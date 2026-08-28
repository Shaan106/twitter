import { index, integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const monitorRuns = sqliteTable('monitor_runs', {
  id: text('id').primaryKey(),
  status: text('status').notNull(),
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at'),
  newestPostId: text('newest_post_id'),
  postsSeen: integer('posts_seen').notNull().default(0),
  eventsCreated: integer('events_created').notNull().default(0),
  error: text('error'),
  createdAt: text('created_at').notNull(),
}, (table) => [index('idx_monitor_runs_completed').on(table.completedAt)]);

export const sourcePosts = sqliteTable('source_posts', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  text: text('text').notNull(),
  postedAt: text('posted_at').notNull(),
  capturedAt: text('captured_at').notNull(),
  imageEvidenceJson: text('image_evidence_json').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_source_posts_url').on(table.url),
  index('idx_source_posts_posted').on(table.postedAt),
]);

export const tradeEvents = sqliteTable('trade_events', {
  id: text('id').primaryKey(),
  sourcePostId: text('source_post_id').notNull().references(() => sourcePosts.id),
  sequence: integer('sequence').notNull().default(0),
  ticker: text('ticker'),
  action: text('action').notNull(),
  headline: text('headline').notNull(),
  summary: text('summary').notNull(),
  shares: real('shares'),
  notional: real('notional'),
  price: real('price'),
  weightBps: integer('weight_bps'),
  confidence: text('confidence').notNull(),
  effectiveAt: text('effective_at').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_trade_events_source_sequence').on(table.sourcePostId, table.sequence),
  index('idx_trade_events_effective').on(table.effectiveAt),
  index('idx_trade_events_ticker').on(table.ticker),
]);

export const portfolioSnapshots = sqliteTable('portfolio_snapshots', {
  id: text('id').primaryKey(),
  sourcePostId: text('source_post_id').notNull().references(() => sourcePosts.id),
  label: text('label').notNull(),
  netEquity: real('net_equity'),
  grossExposure: real('gross_exposure'),
  impliedBorrowing: real('implied_borrowing'),
  grossWeightBps: integer('gross_weight_bps'),
  snapshotAt: text('snapshot_at').notNull(),
  isComplete: integer('is_complete', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
}, (table) => [index('idx_portfolio_snapshots_time').on(table.snapshotAt)]);

export const portfolioAllocations = sqliteTable('portfolio_allocations', {
  id: text('id').primaryKey(),
  snapshotId: text('snapshot_id').notNull().references(() => portfolioSnapshots.id),
  ticker: text('ticker').notNull(),
  company: text('company').notNull(),
  shares: real('shares'),
  referencePrice: real('reference_price'),
  marketValue: real('market_value'),
  weightBps: integer('weight_bps'),
  weightKind: text('weight_kind').notNull(),
  sourcePostId: text('source_post_id').notNull().references(() => sourcePosts.id),
  createdAt: text('created_at').notNull(),
}, (table) => [
  uniqueIndex('idx_portfolio_allocations_snapshot_ticker').on(table.snapshotId, table.ticker),
  index('idx_portfolio_allocations_ticker').on(table.ticker),
]);

export const currentPositions = sqliteTable('current_positions', {
  ticker: text('ticker').primaryKey(),
  company: text('company').notNull(),
  shares: real('shares'),
  referencePrice: real('reference_price'),
  marketValue: real('market_value'),
  weightBps: integer('weight_bps'),
  weightKind: text('weight_kind').notNull(),
  sourcePostId: text('source_post_id').notNull().references(() => sourcePosts.id),
  asOf: text('as_of').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [index('idx_current_positions_weight').on(table.weightBps)]);

export const actionItems = sqliteTable('action_items', {
  id: text('id').primaryKey(),
  tradeEventId: text('trade_event_id').notNull().references(() => tradeEvents.id),
  ticker: text('ticker'),
  action: text('action').notNull(),
  headline: text('headline').notNull(),
  detail: text('detail').notNull(),
  status: text('status').notNull().default('new'),
  priority: text('priority').notNull().default('normal'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  uniqueIndex('idx_action_items_event').on(table.tradeEventId),
  index('idx_action_items_status_created').on(table.status, table.createdAt),
]);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});
