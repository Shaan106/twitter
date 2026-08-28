'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ActionItem, ActionStatus, Holding, TrackerState, TradeAction, TradeEvent } from '@/lib/types';

type View = 'portfolio' | 'actions' | 'history';
type ThemeMode = 'system' | 'dark' | 'light';

const views: Array<{ id: View; label: string }> = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'actions', label: 'Actions' },
  { id: 'history', label: 'History' },
];

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem('signal-desk-theme');
    return stored === 'dark' || stored === 'light' || stored === 'system' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(mode: ThemeMode) {
  if (mode === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.dataset.theme = mode;
  try { window.localStorage.setItem('signal-desk-theme', mode); } catch { /* Theme still applies. */ }
}

function money(value: number | null, compact = false) {
  if (value === null) return 'Unknown';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value);
}

function quantity(value: number | null) {
  if (value === null) return 'Unknown';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 }).format(value);
}

function percentage(bps: number | null) {
  if (bps === null) return 'Unknown';
  const value = bps / 100;
  return `${value.toFixed(value < 1 ? 1 : 2)}%`;
}

function dateTime(value: string | null) {
  if (!value) return 'Not checked yet';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(value));
}

function relativeTime(value: string | null) {
  if (!value) return 'not checked';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 2) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1_440) return `${Math.round(minutes / 60)}h ago`;
  return `${Math.round(minutes / 1_440)}d ago`;
}

function actionTone(action: TradeAction) {
  if (action === 'buy' || action === 'add') return 'buy';
  if (action === 'sell' || action === 'trim') return 'sell';
  if (action === 'delever') return 'review';
  return 'neutral';
}

export function GrowthOS() {
  const [state, setState] = useState<TrackerState | null>(null);
  const [view, setView] = useState<View>('portfolio');
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch('/api/state', { cache: 'no-store' });
      const payload = await response.json() as TrackerState & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Could not load the tracker.');
      setState(payload);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load the tracker.');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredTheme();
    const themeFrame = window.requestAnimationFrame(() => {
      setThemeMode(stored);
      applyTheme(stored);
      void refresh();
    });
    const interval = window.setInterval(() => void refresh(true), 60_000);
    const onFocus = () => void refresh(true);
    window.addEventListener('focus', onFocus);
    return () => {
      window.cancelAnimationFrame(themeFrame);
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const updateAction = useCallback(async (id: string, status: ActionStatus) => {
    setBusyId(id);
    try {
      const response = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'action.update', id, status }),
      });
      const payload = await response.json() as TrackerState & { error?: string };
      if (!response.ok) throw new Error(payload.error || 'Could not update the action.');
      setState(payload);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update the action.');
    } finally {
      setBusyId(null);
    }
  }, []);

  const cycleTheme = () => {
    const next: ThemeMode = themeMode === 'system' ? 'dark' : themeMode === 'dark' ? 'light' : 'system';
    setThemeMode(next);
    applyTheme(next);
  };

  const newActions = useMemo(() => state?.actions.filter((item) => item.status === 'new') ?? [], [state]);

  return (
    <main className="app">
      <header className="site-header">
        <button className="wordmark" onClick={() => setView('portfolio')}>Mirror Desk</button>
        <nav className="view-tabs" aria-label="Tracker views">
          {views.map((item) => (
            <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}>
              {item.label}{item.id === 'actions' && newActions.length > 0 ? <sup>{newActions.length}</sup> : null}
            </button>
          ))}
        </nav>
        <button className="theme-button" onClick={cycleTheme} aria-label={`Theme: ${themeMode}. Change theme.`} title="System → Dark → Light">
          <span aria-hidden="true">{themeMode === 'dark' ? '●' : themeMode === 'light' ? '○' : '◐'}</span>
          {themeMode[0].toUpperCase() + themeMode.slice(1)}
        </button>
      </header>

      {loading && !state ? <Loading /> : null}
      {!loading && !state ? <ErrorState message={error || 'Could not load the tracker.'} retry={() => void refresh()} /> : null}
      {state && view === 'portfolio' ? <Portfolio state={state} newActions={newActions} updateAction={updateAction} busyId={busyId} /> : null}
      {state && view === 'actions' ? <Actions items={state.actions} updateAction={updateAction} busyId={busyId} /> : null}
      {state && view === 'history' ? <History events={state.events} /> : null}

      {error && state ? <div className="error-toast" role="alert">{error}<button onClick={() => setError(null)} aria-label="Dismiss">×</button></div> : null}
    </main>
  );
}

function Portfolio({ state, newActions, updateAction, busyId }: {
  state: TrackerState;
  newActions: ActionItem[];
  updateAction: (id: string, status: ActionStatus) => Promise<void>;
  busyId: string | null;
}) {
  const snapshot = state.snapshot;
  const latest = newActions[0] ?? state.actions[0] ?? null;
  return (
    <section className="dashboard trade-dashboard">
      <AccountHeader state={state} />
      <div className="tracker-metrics" aria-label="Portfolio summary">
        <Metric label="Estimated net equity" value={money(snapshot?.netEquity ?? null, true)} />
        <Metric label="Gross exposure" value={snapshot?.grossWeightBps ? percentage(snapshot.grossWeightBps) : 'Unknown'} warning={(snapshot?.grossWeightBps ?? 0) > 10_000} />
        <Metric label="Known positions" value={String(state.holdings.length)} />
        <Metric label="New mirror actions" value={String(newActions.length)} positive={newActions.length > 0} />
      </div>

      <div className="tracker-grid">
        <Holdings holdings={state.holdings} snapshot={snapshot} />
        <LatestAction item={latest} busy={busyId === latest?.id} updateAction={updateAction} />
      </div>

      <section className="activity-panel">
        <div className="section-heading"><div><p className="eyebrow">Audit trail</p><h2>Recent disclosed trades</h2></div><span>{state.events.length} normalized events</span></div>
        <EventList events={state.events.slice(0, 6)} compact />
      </section>

      <section className="methodology-strip">
        <div><strong>Evidence window</strong><span>{state.methodology.checkedWindow}</span></div>
        <div><strong>Weighting method</strong><span>Explicit NVDA weight; other weights estimated from disclosed shares and screenshot prices.</span></div>
        <div><strong>Important</strong><span>{state.methodology.disclaimer}</span></div>
      </section>
    </section>
  );
}

function AccountHeader({ state }: { state: TrackerState }) {
  const healthy = state.monitor.status !== 'failed';
  return (
    <div className="tracker-intro">
      <div>
        <p className="eyebrow">Tracked account</p>
        <h1>{state.account.displayName}</h1>
        <a href={state.account.profileUrl} target="_blank" rel="noreferrer">@{state.account.handle} ↗</a>
      </div>
      <div className="monitor-state" title={state.monitor.lastCheckedAt ? dateTime(state.monitor.lastCheckedAt) : undefined}>
        <span className={`live-dot ${healthy ? '' : 'failed'}`} />
        <div><strong>{healthy ? '15-minute monitor' : 'Monitor needs attention'}</strong><span>Checked {relativeTime(state.monitor.lastCheckedAt)}</span></div>
        <span className="monitor-count">{state.monitor.postsSeen} posts scanned</span>
      </div>
    </div>
  );
}

function Metric({ label, value, positive, warning }: { label: string; value: string; positive?: boolean; warning?: boolean }) {
  return <div><span>{label}</span><strong className={positive ? 'metric-green' : warning ? 'metric-amber' : ''}>{value}</strong></div>;
}

function Holdings({ holdings, snapshot }: { holdings: Holding[]; snapshot: TrackerState['snapshot'] }) {
  return (
    <section className="holdings-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">Current reconstruction</p><h2>Known portfolio</h2></div>
        <span>{snapshot ? dateTime(snapshot.snapshotAt) : 'No snapshot'}</span>
      </div>
      <div className="holdings-list">
        {holdings.map((holding) => (
          <a className="holding-row" key={holding.ticker} href={holding.sourceUrl} target="_blank" rel="noreferrer">
            <div className="holding-name">
              <strong>{holding.ticker}</strong>
              <span>{holding.company} · {quantity(holding.shares)} sh</span>
            </div>
            <div className="holding-bar" aria-hidden="true"><span style={{ width: `${Math.min((holding.weightBps ?? 0) / 100, 100)}%` }} /></div>
            <div className="holding-weight"><strong>{percentage(holding.weightBps)}</strong><span className={`evidence-label ${holding.weightKind}`}>{holding.weightKind}</span></div>
            <div className="holding-value"><strong>{money(holding.marketValue)}</strong><span>{holding.referencePrice === null ? 'Price unknown' : `${money(holding.referencePrice)} ref.`}</span></div>
          </a>
        ))}
      </div>
      {snapshot && (snapshot.grossWeightBps ?? 0) > 10_000 ? (
        <div className="leverage-note">
          <span>Implied borrowing / margin</span>
          <strong>{money(snapshot.impliedBorrowing)}</strong>
          <p>{snapshot.notes}</p>
        </div>
      ) : null}
    </section>
  );
}

function LatestAction({ item, busy, updateAction }: {
  item: ActionItem | null;
  busy: boolean;
  updateAction: (id: string, status: ActionStatus) => Promise<void>;
}) {
  if (!item) return <aside className="action-panel empty-panel"><p>No mirror actions yet.</p></aside>;
  return (
    <aside className="action-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">Latest mirror action</p><h2>{item.headline}</h2></div>
        <span className={`action-badge ${actionTone(item.action)}`}>{item.action.toUpperCase()}</span>
      </div>
      <div className="action-body">
        <p className="action-detail">{item.detail}</p>
        <div className="action-facts">
          <span>Status</span><strong>{item.status}</strong>
          <span>Priority</span><strong>{item.priority}</strong>
        </div>
        <a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">Open source evidence ↗</a>
        {item.status === 'new' ? (
          <div className="action-controls">
            <button disabled={busy} onClick={() => void updateAction(item.id, 'done')}>Mark mirrored</button>
            <button disabled={busy} onClick={() => void updateAction(item.id, 'dismissed')}>Dismiss</button>
          </div>
        ) : <button className="restore-action" disabled={busy} onClick={() => void updateAction(item.id, 'new')}>Move back to new</button>}
        <p className="disclaimer">This records your review only. Mirror Desk never places trades.</p>
      </div>
    </aside>
  );
}

function Actions({ items, updateAction, busyId }: {
  items: ActionItem[];
  updateAction: (id: string, status: ActionStatus) => Promise<void>;
  busyId: string | null;
}) {
  const newItems = items.filter((item) => item.status === 'new');
  const reviewed = items.filter((item) => item.status !== 'new');
  return (
    <section className="dashboard list-view">
      <div className="page-heading"><div><p className="eyebrow">What changed</p><h1>Mirror actions</h1></div><span>{newItems.length} need review</span></div>
      <div className="action-list">
        {newItems.length ? newItems.map((item) => (
          <LatestAction key={item.id} item={item} busy={busyId === item.id} updateAction={updateAction} />
        )) : <div className="empty-state">No new changes to review.</div>}
      </div>
      {reviewed.length ? (
        <section className="reviewed-section">
          <div className="section-heading"><h2>Reviewed</h2><span>{reviewed.length}</span></div>
          {reviewed.map((item) => (
            <div className="reviewed-row" key={item.id}>
              <span className={`action-badge ${actionTone(item.action)}`}>{item.action}</span>
              <div><strong>{item.headline}</strong><span>{item.status}</span></div>
              <button disabled={busyId === item.id} onClick={() => void updateAction(item.id, 'new')}>Restore</button>
            </div>
          ))}
        </section>
      ) : null}
    </section>
  );
}

function History({ events }: { events: TradeEvent[] }) {
  return (
    <section className="dashboard list-view">
      <div className="page-heading"><div><p className="eyebrow">Source-linked record</p><h1>Trade history</h1></div><span>{events.length} events</span></div>
      <section className="activity-panel"><EventList events={events} /></section>
    </section>
  );
}

function EventList({ events, compact = false }: { events: TradeEvent[]; compact?: boolean }) {
  return (
    <div className="event-list">
      {events.map((event) => (
        <a className="event-row" href={event.source.url} target="_blank" rel="noreferrer" key={event.id}>
          <time>{dateTime(event.effectiveAt)}</time>
          <span className={`action-badge ${actionTone(event.action)}`}>{event.action}</span>
          <div className="event-copy"><strong>{event.headline}</strong><p>{event.summary}</p></div>
          {!compact ? <div className="event-numbers">
            {event.notional !== null ? <span>{money(event.notional)}</span> : null}
            {event.shares !== null ? <span>{quantity(event.shares)} sh</span> : null}
            <small>{event.confidence}</small>
          </div> : <span className="event-link">↗</span>}
        </a>
      ))}
    </div>
  );
}

function Loading() {
  return <div className="loading"><span className="loading-mark" /><p>Reconstructing the portfolio…</p></div>;
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return <div className="loading"><p>{message}</p><button onClick={retry}>Retry</button></div>;
}
