CREATE TABLE `action_items` (
	`id` text PRIMARY KEY NOT NULL,
	`trade_event_id` text NOT NULL,
	`ticker` text,
	`action` text NOT NULL,
	`headline` text NOT NULL,
	`detail` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`trade_event_id`) REFERENCES `trade_events`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_action_items_event` ON `action_items` (`trade_event_id`);--> statement-breakpoint
CREATE INDEX `idx_action_items_status_created` ON `action_items` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `current_positions` (
	`ticker` text PRIMARY KEY NOT NULL,
	`company` text NOT NULL,
	`shares` real,
	`reference_price` real,
	`market_value` real,
	`weight_bps` integer,
	`weight_kind` text NOT NULL,
	`source_post_id` text NOT NULL,
	`as_of` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`source_post_id`) REFERENCES `source_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_current_positions_weight` ON `current_positions` (`weight_bps`);--> statement-breakpoint
CREATE TABLE `monitor_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text,
	`newest_post_id` text,
	`posts_seen` integer DEFAULT 0 NOT NULL,
	`events_created` integer DEFAULT 0 NOT NULL,
	`error` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_monitor_runs_completed` ON `monitor_runs` (`completed_at`);--> statement-breakpoint
CREATE TABLE `portfolio_allocations` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`ticker` text NOT NULL,
	`company` text NOT NULL,
	`shares` real,
	`reference_price` real,
	`market_value` real,
	`weight_bps` integer,
	`weight_kind` text NOT NULL,
	`source_post_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `portfolio_snapshots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_post_id`) REFERENCES `source_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_portfolio_allocations_snapshot_ticker` ON `portfolio_allocations` (`snapshot_id`,`ticker`);--> statement-breakpoint
CREATE INDEX `idx_portfolio_allocations_ticker` ON `portfolio_allocations` (`ticker`);--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`source_post_id` text NOT NULL,
	`label` text NOT NULL,
	`net_equity` real,
	`gross_exposure` real,
	`implied_borrowing` real,
	`gross_weight_bps` integer,
	`snapshot_at` text NOT NULL,
	`is_complete` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_post_id`) REFERENCES `source_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_portfolio_snapshots_time` ON `portfolio_snapshots` (`snapshot_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `source_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`text` text NOT NULL,
	`posted_at` text NOT NULL,
	`captured_at` text NOT NULL,
	`image_evidence_json` text DEFAULT '[]' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_source_posts_url` ON `source_posts` (`url`);--> statement-breakpoint
CREATE INDEX `idx_source_posts_posted` ON `source_posts` (`posted_at`);--> statement-breakpoint
CREATE TABLE `trade_events` (
	`id` text PRIMARY KEY NOT NULL,
	`source_post_id` text NOT NULL,
	`sequence` integer DEFAULT 0 NOT NULL,
	`ticker` text,
	`action` text NOT NULL,
	`headline` text NOT NULL,
	`summary` text NOT NULL,
	`shares` real,
	`notional` real,
	`price` real,
	`weight_bps` integer,
	`confidence` text NOT NULL,
	`effective_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_post_id`) REFERENCES `source_posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_trade_events_source_sequence` ON `trade_events` (`source_post_id`,`sequence`);--> statement-breakpoint
CREATE INDEX `idx_trade_events_effective` ON `trade_events` (`effective_at`);--> statement-breakpoint
CREATE INDEX `idx_trade_events_ticker` ON `trade_events` (`ticker`);