const capturedAt = '2026-08-28T16:32:00.000Z';

const posts = [
  ['2093372744033346033', 'Back in $NVDA', '2026-08-28T16:18:49.000Z'],
  ['2093325797368995852', 'Portfolio holdings update', '2026-08-28T13:12:16.000Z'],
  ['2093022098444710236', 'New position: $RVII. I bought 27,245 shares.', '2026-08-27T17:05:29.000Z'],
  ['2092977156078879043', 'Bought $2.25M of $MU', '2026-08-27T14:06:54.000Z'],
  ['2092773676085063787', 'My $MU sells. Still holding 600 shares.', '2026-08-27T00:38:20.000Z'],
  ['2092772188591964261', 'Portfolio update. Got off margin completely. Sold some MU, LITE and NVDA. Have $267K cash.', '2026-08-27T00:32:26.000Z'],
  ['2092756958252073115', 'Sold off $2.14M of margin', '2026-08-26T23:31:55.000Z'],
  ['2092661263121670638', 'New $NVDA position', '2026-08-26T17:11:39.000Z'],
  ['2092640534883914178', 'Trimmed $500K of $LITE getting off some margin. Bought $NVDA.', '2026-08-26T15:49:17.000Z'],
] as const;

const events = [
  {
    id: 'event-nvda-back-in', postId: '2093372744033346033', sequence: 0, ticker: 'NVDA', action: 'buy',
    headline: 'Bought NVDA', summary: 'Re-entered with 4,089.130448 shares. The screenshot shows $900,549.20 market value, $220.84 average cost, and 25.05% portfolio diversity.',
    shares: 4089.130448, notional: 900549.2, price: 220.84, weightBps: 2505, confidence: 'explicit', effectiveAt: '2026-08-28T16:18:49.000Z',
  },
  {
    id: 'event-holdings-aug28', postId: '2093325797368995852', sequence: 0, ticker: null, action: 'snapshot',
    headline: 'Published holdings', summary: 'Disclosed MU, RVII, LITE, and META share counts before the later NVDA re-entry.',
    shares: null, notional: null, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-28T13:12:16.000Z',
  },
  {
    id: 'event-rvii-buy', postId: '2093022098444710236', sequence: 0, ticker: 'RVII', action: 'buy',
    headline: 'Opened RVII', summary: 'Opened a new RVII position with 27,245 shares.',
    shares: 27245, notional: null, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-27T17:05:29.000Z',
  },
  {
    id: 'event-mu-buy', postId: '2092977156078879043', sequence: 0, ticker: 'MU', action: 'buy',
    headline: 'Bought $2.25M of MU', summary: 'Rebuilt the Micron position one day after cutting exposure to remove margin.',
    shares: null, notional: 2250000, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-27T14:06:54.000Z',
  },
  {
    id: 'event-mu-trim', postId: '2092773676085063787', sequence: 0, ticker: 'MU', action: 'trim',
    headline: 'Trimmed MU to 600 shares', summary: 'Posted sale confirmations and stated that 600 MU shares remained.',
    shares: 600, notional: null, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-27T00:38:20.000Z',
  },
  {
    id: 'event-margin-off', postId: '2092772188591964261', sequence: 0, ticker: null, action: 'delever',
    headline: 'Removed margin', summary: 'Sold portions of MU, LITE, and NVDA, reported no remaining margin, and disclosed $267K cash.',
    shares: null, notional: 267000, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-27T00:32:26.000Z',
  },
  {
    id: 'event-margin-sale', postId: '2092756958252073115', sequence: 0, ticker: null, action: 'delever',
    headline: 'Sold $2.14M of margin exposure', summary: 'A broad deleveraging step following the NVDA earnings trade.',
    shares: null, notional: 2140000, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-26T23:31:55.000Z',
  },
  {
    id: 'event-nvda-open', postId: '2092661263121670638', sequence: 0, ticker: 'NVDA', action: 'buy',
    headline: 'Opened NVDA before earnings', summary: 'Published a new NVDA position ahead of earnings; later posts described roughly $1.4M at risk.',
    shares: null, notional: 1400000, price: null, weightBps: null, confidence: 'strong', effectiveAt: '2026-08-26T17:11:39.000Z',
  },
  {
    id: 'event-lite-trim', postId: '2092640534883914178', sequence: 0, ticker: 'LITE', action: 'trim',
    headline: 'Trimmed $500K of LITE', summary: 'Reduced LITE to lower margin exposure.',
    shares: null, notional: 500000, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-26T15:49:17.000Z',
  },
  {
    id: 'event-nvda-add', postId: '2092640534883914178', sequence: 1, ticker: 'NVDA', action: 'buy',
    headline: 'Bought NVDA', summary: 'Redirected capital from the LITE trim into NVDA.',
    shares: null, notional: null, price: null, weightBps: null, confidence: 'explicit', effectiveAt: '2026-08-26T15:49:17.000Z',
  },
] as const;

const positions = [
  ['MU', 'Micron', 2927, 921.53, 2697318.31, 7503, 'estimated', '2093325797368995852'],
  ['NVDA', 'NVIDIA', 4089.130448, 220.224, 900549.2, 2505, 'explicit', '2093372744033346033'],
  ['RVII', 'Robinhood Ventures II', 27245, 23.3, 634808.5, 1766, 'estimated', '2093325797368995852'],
  ['META', 'Meta', 300.88, 572.68, 172307.9584, 479, 'estimated', '2093325797368995852'],
  ['LITE', 'Lumentum', 7.8, 941.07, 7340.346, 20, 'estimated', '2093325797368995852'],
] as const;

export async function seedDatabase(database: D1Database) {
  const initialized = await database.prepare(`SELECT value FROM settings WHERE key = 'tracker_initialized'`).first<{ value: string }>();
  if (initialized?.value === 'true') return;

  const sourceStatements = posts.map(([id, postText, postedAt]) => database.prepare(`
    INSERT OR IGNORE INTO source_posts (id, url, text, posted_at, captured_at, image_evidence_json, created_at)
    VALUES (?, ?, ?, ?, ?, '[]', ?)
  `).bind(id, `https://x.com/DiligentPlane/status/${id}`, postText, postedAt, capturedAt, capturedAt));

  await database.batch(sourceStatements);

  const eventStatements = events.map((event) => database.prepare(`
    INSERT OR IGNORE INTO trade_events (
      id, source_post_id, sequence, ticker, action, headline, summary, shares, notional,
      price, weight_bps, confidence, effective_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    event.id, event.postId, event.sequence, event.ticker, event.action, event.headline, event.summary,
    event.shares, event.notional, event.price, event.weightBps, event.confidence, event.effectiveAt, capturedAt,
  ));

  await database.batch(eventStatements);

  await database.prepare(`
    INSERT OR IGNORE INTO portfolio_snapshots (
      id, source_post_id, label, net_equity, gross_exposure, implied_borrowing,
      gross_weight_bps, snapshot_at, is_complete, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).bind(
    'snapshot-2026-08-28-composite', '2093325797368995852', 'Latest reconstructed portfolio',
    3595006.7864, 4412324.3144, 817317.528, 12273, '2026-08-28T16:18:49.000Z',
    'Composite estimate: the four-holding screenshot preceded the NVDA purchase by about three hours. Weights use NVDA portfolio diversity to estimate net equity.', capturedAt,
  ).run();

  const positionStatements = positions.flatMap(([ticker, company, shares, referencePrice, marketValue, weightBps, weightKind, sourcePostId]) => [
    database.prepare(`
      INSERT OR REPLACE INTO current_positions (
        ticker, company, shares, reference_price, market_value, weight_bps, weight_kind,
        source_post_id, as_of, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(ticker, company, shares, referencePrice, marketValue, weightBps, weightKind, sourcePostId, '2026-08-28T16:18:49.000Z', capturedAt),
    database.prepare(`
      INSERT OR IGNORE INTO portfolio_allocations (
        id, snapshot_id, ticker, company, shares, reference_price, market_value,
        weight_bps, weight_kind, source_post_id, created_at
      ) VALUES (?, 'snapshot-2026-08-28-composite', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(`allocation-2026-08-28-${String(ticker).toLowerCase()}`, ticker, company, shares, referencePrice, marketValue, weightBps, weightKind, sourcePostId, capturedAt),
  ]);

  await database.batch(positionStatements);

  await database.batch([
    database.prepare(`
      INSERT OR IGNORE INTO action_items (
        id, trade_event_id, ticker, action, headline, detail, status, priority, created_at, updated_at
      ) VALUES (?, ?, 'NVDA', 'buy', ?, ?, 'new', 'review', ?, ?)
    `).bind(
      'action-nvda-back-in', 'event-nvda-back-in', 'Mirror change: add NVDA',
      'Target disclosed position: 4,089.130448 shares, $900,549.20 market value, or 25.05% of net equity. This appears to restore leverage, so review rather than blindly matching.',
      capturedAt, capturedAt,
    ),
    database.prepare(`
      INSERT OR IGNORE INTO monitor_runs (
        id, status, started_at, completed_at, newest_post_id, posts_seen, events_created, error, created_at
      ) VALUES (?, 'ready', ?, ?, ?, ?, ?, NULL, ?)
    `).bind('run-initial-2026-08-28', '2026-08-28T16:20:00.000Z', capturedAt, '2093372744033346033', 56, 10, capturedAt),
    database.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('tracker_initialized', 'true', ?)`).bind(capturedAt),
    database.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('source_handle', 'DiligentPlane', ?)`).bind(capturedAt),
    database.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('checked_window', 'Aug 26–28, 2026', ?)`).bind(capturedAt),
    database.prepare(`INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('monitor_interval_minutes', '15', ?)`).bind(capturedAt),
  ]);
}
