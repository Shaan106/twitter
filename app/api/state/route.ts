import { getDatabase } from '@/db/runtime';
import type { ActionStatus, TrackerState } from '@/lib/types';

export const dynamic = 'force-dynamic';

type Row = Record<string, string | number | null>;
const required = (value: unknown) => String(value ?? '');
const optional = (value: unknown) => value === null || value === undefined ? null : String(value);
const numberOrNull = (value: unknown) => value === null || value === undefined ? null : Number(value);

async function loadState(): Promise<TrackerState> {
  const database = await getDatabase();
  const [positionResult, snapshotResult, actionResult, eventResult, monitorResult, settingResult] = await database.batch([
    database.prepare(`
      SELECT p.*, s.url AS source_url
      FROM current_positions p
      JOIN source_posts s ON s.id = p.source_post_id
      ORDER BY CASE WHEN p.weight_bps IS NULL THEN 1 ELSE 0 END, p.weight_bps DESC, p.ticker
    `),
    database.prepare(`
      SELECT ps.*, sp.url AS source_url
      FROM portfolio_snapshots ps
      JOIN source_posts sp ON sp.id = ps.source_post_id
      ORDER BY ps.snapshot_at DESC LIMIT 1
    `),
    database.prepare(`
      SELECT a.*, sp.url AS source_url
      FROM action_items a
      JOIN trade_events te ON te.id = a.trade_event_id
      JOIN source_posts sp ON sp.id = te.source_post_id
      ORDER BY CASE a.status WHEN 'new' THEN 0 WHEN 'done' THEN 1 ELSE 2 END, a.created_at DESC
    `),
    database.prepare(`
      SELECT te.*, sp.url AS source_url, sp.text AS source_text, sp.posted_at, sp.captured_at
      FROM trade_events te
      JOIN source_posts sp ON sp.id = te.source_post_id
      ORDER BY te.effective_at DESC, te.sequence DESC
      LIMIT 80
    `),
    database.prepare(`SELECT * FROM monitor_runs ORDER BY COALESCE(completed_at, started_at) DESC LIMIT 1`),
    database.prepare(`SELECT key, value FROM settings`),
  ]);

  const snapshotRow = (snapshotResult.results?.[0] ?? null) as Row | null;
  const monitorRow = (monitorResult.results?.[0] ?? null) as Row | null;
  const settings = Object.fromEntries(((settingResult.results ?? []) as Row[]).map((row) => [required(row.key), required(row.value)]));

  return {
    account: {
      handle: settings.source_handle || 'DiligentPlane',
      displayName: 'Diligent Plane',
      profileUrl: 'https://x.com/DiligentPlane',
    },
    holdings: ((positionResult.results ?? []) as Row[]).map((row) => ({
      ticker: required(row.ticker),
      company: required(row.company),
      shares: numberOrNull(row.shares),
      referencePrice: numberOrNull(row.reference_price),
      marketValue: numberOrNull(row.market_value),
      weightBps: numberOrNull(row.weight_bps),
      weightKind: required(row.weight_kind) as TrackerState['holdings'][number]['weightKind'],
      sourcePostId: required(row.source_post_id),
      sourceUrl: required(row.source_url),
      asOf: required(row.as_of),
    })),
    snapshot: snapshotRow ? {
      id: required(snapshotRow.id),
      label: required(snapshotRow.label),
      netEquity: numberOrNull(snapshotRow.net_equity),
      grossExposure: numberOrNull(snapshotRow.gross_exposure),
      impliedBorrowing: numberOrNull(snapshotRow.implied_borrowing),
      grossWeightBps: numberOrNull(snapshotRow.gross_weight_bps),
      snapshotAt: required(snapshotRow.snapshot_at),
      sourcePostId: required(snapshotRow.source_post_id),
      sourceUrl: required(snapshotRow.source_url),
      isComplete: Number(snapshotRow.is_complete ?? 0) === 1,
      notes: optional(snapshotRow.notes),
    } : null,
    actions: ((actionResult.results ?? []) as Row[]).map((row) => ({
      id: required(row.id),
      tradeEventId: required(row.trade_event_id),
      ticker: optional(row.ticker),
      action: required(row.action) as TrackerState['actions'][number]['action'],
      headline: required(row.headline),
      detail: required(row.detail),
      status: required(row.status) as ActionStatus,
      priority: required(row.priority) as TrackerState['actions'][number]['priority'],
      createdAt: required(row.created_at),
      updatedAt: required(row.updated_at),
      sourceUrl: required(row.source_url),
    })),
    events: ((eventResult.results ?? []) as Row[]).map((row) => ({
      id: required(row.id),
      ticker: optional(row.ticker),
      action: required(row.action) as TrackerState['events'][number]['action'],
      headline: required(row.headline),
      summary: required(row.summary),
      shares: numberOrNull(row.shares),
      notional: numberOrNull(row.notional),
      price: numberOrNull(row.price),
      weightBps: numberOrNull(row.weight_bps),
      confidence: required(row.confidence) as TrackerState['events'][number]['confidence'],
      effectiveAt: required(row.effective_at),
      source: {
        id: required(row.source_post_id),
        url: required(row.source_url),
        text: required(row.source_text),
        postedAt: required(row.posted_at),
        capturedAt: required(row.captured_at),
      },
    })),
    monitor: {
      status: monitorRow ? required(monitorRow.status) as TrackerState['monitor']['status'] : 'ready',
      lastCheckedAt: monitorRow ? optional(monitorRow.completed_at) : null,
      newestPostId: monitorRow ? optional(monitorRow.newest_post_id) : null,
      postsSeen: monitorRow ? Number(monitorRow.posts_seen ?? 0) : 0,
      eventsCreated: monitorRow ? Number(monitorRow.events_created ?? 0) : 0,
      error: monitorRow ? optional(monitorRow.error) : null,
    },
    methodology: {
      checkedWindow: settings.checked_window || 'Recent public posts',
      disclaimer: 'Public-disclosure tracker, not personalized financial advice. Verify every trade, price, tax consequence, and risk before acting.',
    },
  };
}

export async function GET() {
  try {
    return Response.json(await loadState(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Could not load tracker state.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.action !== 'action.update') return Response.json({ error: 'Unsupported action.' }, { status: 400 });
    const id = required(body.id).trim();
    const status = required(body.status) as ActionStatus;
    if (!id || !['new', 'done', 'dismissed'].includes(status)) return Response.json({ error: 'Invalid action update.' }, { status: 400 });
    const database = await getDatabase();
    const result = await database.prepare(`UPDATE action_items SET status = ?, updated_at = ? WHERE id = ?`).bind(status, new Date().toISOString(), id).run();
    if (!Number(result.meta.changes ?? 0)) return Response.json({ error: 'Action item not found.' }, { status: 404 });
    return Response.json(await loadState(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Could not update action.' }, { status: 500 });
  }
}
