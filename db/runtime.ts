import { env } from 'cloudflare:workers';
import { seedDatabase } from './seed';

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS monitor_runs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    newest_post_id TEXT,
    posts_seen INTEGER NOT NULL DEFAULT 0,
    events_created INTEGER NOT NULL DEFAULT 0,
    error TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_monitor_runs_completed ON monitor_runs(completed_at)`,
  `CREATE TABLE IF NOT EXISTS source_posts (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    text TEXT NOT NULL,
    posted_at TEXT NOT NULL,
    captured_at TEXT NOT NULL,
    image_evidence_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_source_posts_url ON source_posts(url)`,
  `CREATE INDEX IF NOT EXISTS idx_source_posts_posted ON source_posts(posted_at)`,
  `CREATE TABLE IF NOT EXISTS trade_events (
    id TEXT PRIMARY KEY,
    source_post_id TEXT NOT NULL REFERENCES source_posts(id),
    sequence INTEGER NOT NULL DEFAULT 0,
    ticker TEXT,
    action TEXT NOT NULL,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    shares REAL,
    notional REAL,
    price REAL,
    weight_bps INTEGER,
    confidence TEXT NOT NULL,
    effective_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_trade_events_source_sequence ON trade_events(source_post_id, sequence)`,
  `CREATE INDEX IF NOT EXISTS idx_trade_events_effective ON trade_events(effective_at)`,
  `CREATE INDEX IF NOT EXISTS idx_trade_events_ticker ON trade_events(ticker)`,
  `CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id TEXT PRIMARY KEY,
    source_post_id TEXT NOT NULL REFERENCES source_posts(id),
    label TEXT NOT NULL,
    net_equity REAL,
    gross_exposure REAL,
    implied_borrowing REAL,
    gross_weight_bps INTEGER,
    snapshot_at TEXT NOT NULL,
    is_complete INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_time ON portfolio_snapshots(snapshot_at)`,
  `CREATE TABLE IF NOT EXISTS portfolio_allocations (
    id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL REFERENCES portfolio_snapshots(id),
    ticker TEXT NOT NULL,
    company TEXT NOT NULL,
    shares REAL,
    reference_price REAL,
    market_value REAL,
    weight_bps INTEGER,
    weight_kind TEXT NOT NULL,
    source_post_id TEXT NOT NULL REFERENCES source_posts(id),
    created_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_allocations_snapshot_ticker ON portfolio_allocations(snapshot_id, ticker)`,
  `CREATE INDEX IF NOT EXISTS idx_portfolio_allocations_ticker ON portfolio_allocations(ticker)`,
  `CREATE TABLE IF NOT EXISTS current_positions (
    ticker TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    shares REAL,
    reference_price REAL,
    market_value REAL,
    weight_bps INTEGER,
    weight_kind TEXT NOT NULL,
    source_post_id TEXT NOT NULL REFERENCES source_posts(id),
    as_of TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_current_positions_weight ON current_positions(weight_bps)`,
  `CREATE TABLE IF NOT EXISTS action_items (
    id TEXT PRIMARY KEY,
    trade_event_id TEXT NOT NULL REFERENCES trade_events(id),
    ticker TEXT,
    action TEXT NOT NULL,
    headline TEXT NOT NULL,
    detail TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',
    priority TEXT NOT NULL DEFAULT 'normal',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_action_items_event ON action_items(trade_event_id)`,
  `CREATE INDEX IF NOT EXISTS idx_action_items_status_created ON action_items(status, created_at)`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
];

let initialization: Promise<void> | null = null;

function getBinding() {
  if (!env.DB) throw new Error('The SQLite-compatible DB binding is unavailable.');
  return env.DB;
}

export async function getDatabase() {
  const database = getBinding();
  if (!initialization) {
    initialization = (async () => {
      await database.batch(schemaStatements.map((statement) => database.prepare(statement)));
      await seedDatabase(database);
      await database.prepare('PRAGMA optimize').run();
    })().catch((error) => {
      initialization = null;
      throw error;
    });
  }
  await initialization;
  return database;
}

export function getIngestToken() {
  return (env as unknown as { TRACKER_INGEST_TOKEN?: string }).TRACKER_INGEST_TOKEN ?? null;
}
