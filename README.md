# Mirror Desk

Mirror Desk is a source-linked trade tracker for [`@DiligentPlane`](https://x.com/DiligentPlane). It reconstructs disclosed holdings, separates explicit figures from estimates, highlights portfolio leverage, and turns clear buy/sell/trim updates into reviewable action cards. It never places trades.

## Current reconstruction

The seed snapshot covers posts from August 26–28, 2026. The latest disclosed positions are MU, RVII, LITE, META, and NVDA. NVDA's disclosed 25.05% portfolio weight implies approximately $3.60M of net equity; applying that anchor to the other disclosed position values produces roughly 122.7% gross exposure and $817K of implied borrowing. Those derived values are labeled estimates in the interface.

## What is included

- Portfolio view with explicit/estimated evidence labels and source links.
- Action inbox for newly disclosed trades, with mirrored/dismissed states.
- Chronological trade history backed by original X posts.
- D1/SQLite persistence with idempotent ingestion.
- Authenticated hosted ingestion through `TRACKER_INGEST_TOKEN`.
- A read-only browser-monitor contract for recurring checks.
- Light, dark, and system themes using the original app's dense, square-cornered visual system.

## Run locally

Use Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Local D1 state is stored under `.wrangler/state/`.

## Monitor workflow

The scheduled monitor reads new public posts through the browser, inspects attached position screenshots, and sends normalized evidence to `/api/ingest`. The exact rules and JSON schema are in [`docs/ingestion-contract.md`](docs/ingestion-contract.md).

The automation is intentionally read-only: it does not engage on X or execute trades. A local desktop scheduled task requires the computer to be awake and the Codex desktop app to be running.

## Validation

```bash
npm run db:generate
npm run build
npm run lint
```
