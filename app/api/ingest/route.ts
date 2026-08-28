import { getDatabase, getIngestToken } from '@/db/runtime';
import type { Confidence, IngestPayload, TradeAction, WeightKind } from '@/lib/types';

export const dynamic = 'force-dynamic';

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const allowedActions = new Set<TradeAction>(['buy', 'add', 'trim', 'sell', 'delever', 'snapshot', 'comment']);
const allowedConfidence = new Set<Confidence>(['explicit', 'strong', 'inferred']);
const allowedWeightKinds = new Set<WeightKind>(['explicit', 'estimated', 'unknown']);
const text = (value: unknown) => String(value ?? '').trim();
const nullableNumber = (value: unknown) => value === null || value === undefined ? null : Number(value);

function isIsoDate(value: unknown) {
  const stringValue = text(value);
  return Boolean(stringValue) && Number.isFinite(Date.parse(stringValue));
}

function isXPostUrl(value: unknown) {
  try {
    const url = new URL(text(value));
    return url.protocol === 'https:'
      && ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(url.hostname)
      && /^\/DiligentPlane\/status\/\d+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

function isTicker(value: unknown) {
  return value === null || value === undefined || /^[A-Z0-9.-]{1,10}$/.test(text(value));
}

function isAuthorized(request: Request) {
  const hostname = new URL(request.url).hostname;
  if (localHosts.has(hostname)) return true;
  const expected = getIngestToken();
  if (!expected) return false;
  return request.headers.get('Authorization') === `Bearer ${expected}`;
}

function validate(payload: unknown): payload is IngestPayload {
  if (!payload || typeof payload !== 'object') return false;
  const body = payload as Partial<IngestPayload>;
  if (!body.run || !Array.isArray(body.posts) || !Array.isArray(body.events)) return false;
  if (!text(body.run.id) || !isIsoDate(body.run.startedAt) || !isIsoDate(body.run.completedAt)) return false;
  if (!Number.isInteger(body.run.postsSeen) || body.run.postsSeen < 0) return false;
  if (body.posts.length > 100 || body.events.length > 100) return false;
  if (!body.posts.every((post) => /^\d+$/.test(text(post.id)) && isXPostUrl(post.url) && text(post.text).length <= 5000 && isIsoDate(post.postedAt))) return false;
  if (!body.events.every((event) => {
    const numericValues = [event.shares, event.notional, event.price, event.weightBps]
      .filter((value) => value !== null && value !== undefined)
      .map(Number);
    return Boolean(text(event.id))
      && /^\d+$/.test(text(event.sourcePostId))
      && isTicker(event.ticker)
      && allowedActions.has(event.action)
      && allowedConfidence.has(event.confidence)
      && text(event.headline).length > 0
      && text(event.headline).length <= 240
      && text(event.summary).length <= 2000
      && numericValues.every(Number.isFinite)
      && isIsoDate(event.effectiveAt)
      && (!event.positionAfter || (
        allowedWeightKinds.has(event.positionAfter.weightKind)
        && text(event.positionAfter.company).length > 0
      ));
  })) return false;
  if (body.snapshot) {
    if (!text(body.snapshot.id) || !/^\d+$/.test(text(body.snapshot.sourcePostId)) || !isIsoDate(body.snapshot.snapshotAt)) return false;
    if (!Array.isArray(body.snapshot.positions) || body.snapshot.positions.length > 30) return false;
    if (!body.snapshot.positions.every((position) => isTicker(position.ticker) && Boolean(text(position.ticker)) && Boolean(text(position.company)) && allowedWeightKinds.has(position.weightKind))) return false;
  }
  return true;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    const missingToken = !localHosts.has(new URL(request.url).hostname) && !getIngestToken();
    return Response.json({ error: missingToken ? 'Hosted ingestion is not configured.' : 'Unauthorized.' }, { status: missingToken ? 503 : 401 });
  }

  try {
    const payload = await request.json() as unknown;
    if (!validate(payload)) return Response.json({ error: 'Payload does not match the ingestion contract.' }, { status: 400 });

    const database = await getDatabase();
    const now = new Date().toISOString();
    const postStatements = payload.posts.map((post) => database.prepare(`
      INSERT OR IGNORE INTO source_posts (
        id, url, text, posted_at, captured_at, image_evidence_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      post.id, post.url, post.text, post.postedAt, post.capturedAt || payload.run.completedAt,
      JSON.stringify((post.imageEvidence ?? []).slice(0, 8)), now,
    ));
    if (postStatements.length) await database.batch(postStatements);

    const eventResults = payload.events.length ? await database.batch(payload.events.map((event) => database.prepare(`
      INSERT OR IGNORE INTO trade_events (
        id, source_post_id, sequence, ticker, action, headline, summary, shares, notional,
        price, weight_bps, confidence, effective_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      event.id, event.sourcePostId, event.sequence ?? 0, event.ticker ?? null, event.action,
      event.headline, event.summary, nullableNumber(event.shares), nullableNumber(event.notional),
      nullableNumber(event.price), nullableNumber(event.weightBps), event.confidence, event.effectiveAt, now,
    ))) : [];
    const createdEvents = eventResults.reduce((total, result) => total + Number(result.meta.changes ?? 0), 0);

    const followUpStatements = payload.events.flatMap((event) => {
      const statements: D1PreparedStatement[] = [];
      if (event.createAction) {
        statements.push(database.prepare(`
          INSERT OR IGNORE INTO action_items (
            id, trade_event_id, ticker, action, headline, detail, status, priority, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'new', ?, ?, ?)
        `).bind(
          `action-${event.id}`, event.id, event.ticker ?? null, event.action,
          event.headline, event.actionDetail || event.summary, event.priority || 'normal', now, now,
        ));
      }
      if (Object.prototype.hasOwnProperty.call(event, 'positionAfter') && event.ticker) {
        if (event.positionAfter === null) {
          statements.push(database.prepare(`DELETE FROM current_positions WHERE ticker = ?`).bind(event.ticker));
        } else if (event.positionAfter) {
          statements.push(database.prepare(`
            INSERT INTO current_positions (
              ticker, company, shares, reference_price, market_value, weight_bps, weight_kind,
              source_post_id, as_of, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(ticker) DO UPDATE SET
              company = excluded.company,
              shares = excluded.shares,
              reference_price = excluded.reference_price,
              market_value = excluded.market_value,
              weight_bps = excluded.weight_bps,
              weight_kind = excluded.weight_kind,
              source_post_id = excluded.source_post_id,
              as_of = excluded.as_of,
              updated_at = excluded.updated_at
          `).bind(
            event.ticker, event.positionAfter.company, nullableNumber(event.positionAfter.shares),
            nullableNumber(event.positionAfter.referencePrice), nullableNumber(event.positionAfter.marketValue),
            nullableNumber(event.positionAfter.weightBps), event.positionAfter.weightKind,
            event.sourcePostId, event.effectiveAt, now,
          ));
        }
      }
      return statements;
    });
    if (followUpStatements.length) await database.batch(followUpStatements);

    if (payload.snapshot) {
      const snapshot = payload.snapshot;
      const snapshotStatements: D1PreparedStatement[] = [
        database.prepare(`
          INSERT OR REPLACE INTO portfolio_snapshots (
            id, source_post_id, label, net_equity, gross_exposure, implied_borrowing,
            gross_weight_bps, snapshot_at, is_complete, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          snapshot.id, snapshot.sourcePostId, snapshot.label, nullableNumber(snapshot.netEquity),
          nullableNumber(snapshot.grossExposure), nullableNumber(snapshot.impliedBorrowing),
          nullableNumber(snapshot.grossWeightBps), snapshot.snapshotAt, snapshot.isComplete ? 1 : 0,
          snapshot.notes ?? null, now,
        ),
        database.prepare(`DELETE FROM portfolio_allocations WHERE snapshot_id = ?`).bind(snapshot.id),
      ];
      if (snapshot.isComplete) snapshotStatements.push(database.prepare(`DELETE FROM current_positions`));
      snapshot.positions.forEach((position) => {
        const ticker = text(position.ticker).toUpperCase();
        const sourcePostId = position.sourcePostId || snapshot.sourcePostId;
        snapshotStatements.push(database.prepare(`
          INSERT INTO portfolio_allocations (
            id, snapshot_id, ticker, company, shares, reference_price, market_value,
            weight_bps, weight_kind, source_post_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          `allocation-${snapshot.id}-${ticker.toLowerCase()}`, snapshot.id, ticker, position.company,
          nullableNumber(position.shares), nullableNumber(position.referencePrice), nullableNumber(position.marketValue),
          nullableNumber(position.weightBps), position.weightKind, sourcePostId, now,
        ));
        snapshotStatements.push(database.prepare(`
          INSERT INTO current_positions (
            ticker, company, shares, reference_price, market_value, weight_bps, weight_kind,
            source_post_id, as_of, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(ticker) DO UPDATE SET
            company = excluded.company,
            shares = excluded.shares,
            reference_price = excluded.reference_price,
            market_value = excluded.market_value,
            weight_bps = excluded.weight_bps,
            weight_kind = excluded.weight_kind,
            source_post_id = excluded.source_post_id,
            as_of = excluded.as_of,
            updated_at = excluded.updated_at
        `).bind(
          ticker, position.company, nullableNumber(position.shares), nullableNumber(position.referencePrice),
          nullableNumber(position.marketValue), nullableNumber(position.weightBps), position.weightKind,
          sourcePostId, snapshot.snapshotAt, now,
        ));
      });
      await database.batch(snapshotStatements);
    }

    await database.batch([
      database.prepare(`
        INSERT OR REPLACE INTO monitor_runs (
          id, status, started_at, completed_at, newest_post_id, posts_seen, events_created, error, created_at
        ) VALUES (?, 'ready', ?, ?, ?, ?, ?, NULL, ?)
      `).bind(payload.run.id, payload.run.startedAt, payload.run.completedAt, payload.run.newestPostId, payload.run.postsSeen, createdEvents, now),
      database.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('last_ingested_post_id', ?, ?)`).bind(payload.run.newestPostId ?? '', now),
    ]);
    await database.prepare('PRAGMA optimize').run();

    return Response.json({ ok: true, postsReceived: payload.posts.length, eventsCreated: createdEvents, snapshotUpdated: Boolean(payload.snapshot) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Ingestion failed.' }, { status: 500 });
  }
}
