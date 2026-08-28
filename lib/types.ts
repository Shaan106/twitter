export type WeightKind = 'explicit' | 'estimated' | 'unknown';
export type Confidence = 'explicit' | 'strong' | 'inferred';
export type TradeAction = 'buy' | 'add' | 'trim' | 'sell' | 'delever' | 'snapshot' | 'comment';
export type ActionStatus = 'new' | 'done' | 'dismissed';

export type SourcePost = {
  id: string;
  url: string;
  text: string;
  postedAt: string;
  capturedAt: string;
};

export type Holding = {
  ticker: string;
  company: string;
  shares: number | null;
  referencePrice: number | null;
  marketValue: number | null;
  weightBps: number | null;
  weightKind: WeightKind;
  sourcePostId: string;
  sourceUrl: string;
  asOf: string;
};

export type PortfolioSnapshot = {
  id: string;
  label: string;
  netEquity: number | null;
  grossExposure: number | null;
  impliedBorrowing: number | null;
  grossWeightBps: number | null;
  snapshotAt: string;
  sourcePostId: string;
  sourceUrl: string;
  isComplete: boolean;
  notes: string | null;
};

export type TradeEvent = {
  id: string;
  ticker: string | null;
  action: TradeAction;
  headline: string;
  summary: string;
  shares: number | null;
  notional: number | null;
  price: number | null;
  weightBps: number | null;
  confidence: Confidence;
  effectiveAt: string;
  source: SourcePost;
};

export type ActionItem = {
  id: string;
  tradeEventId: string;
  ticker: string | null;
  action: TradeAction;
  headline: string;
  detail: string;
  status: ActionStatus;
  priority: 'high' | 'normal' | 'review';
  createdAt: string;
  updatedAt: string;
  sourceUrl: string;
};

export type MonitorStatus = {
  status: 'ready' | 'running' | 'failed';
  lastCheckedAt: string | null;
  newestPostId: string | null;
  postsSeen: number;
  eventsCreated: number;
  error: string | null;
};

export type TrackerState = {
  account: {
    handle: string;
    displayName: string;
    profileUrl: string;
  };
  holdings: Holding[];
  snapshot: PortfolioSnapshot | null;
  actions: ActionItem[];
  events: TradeEvent[];
  monitor: MonitorStatus;
  methodology: {
    checkedWindow: string;
    disclaimer: string;
  };
};

export type IngestPost = {
  id: string;
  url: string;
  text: string;
  postedAt: string;
  capturedAt?: string;
  imageEvidence?: string[];
};

export type IngestEvent = {
  id: string;
  sourcePostId: string;
  sequence?: number;
  ticker?: string | null;
  action: TradeAction;
  headline: string;
  summary: string;
  shares?: number | null;
  notional?: number | null;
  price?: number | null;
  weightBps?: number | null;
  confidence: Confidence;
  effectiveAt: string;
  createAction?: boolean;
  priority?: ActionItem['priority'];
  actionDetail?: string;
  positionAfter?: {
    company: string;
    shares: number | null;
    referencePrice: number | null;
    marketValue: number | null;
    weightBps: number | null;
    weightKind: WeightKind;
  } | null;
};

export type IngestSnapshot = {
  id: string;
  sourcePostId: string;
  label: string;
  netEquity?: number | null;
  grossExposure?: number | null;
  impliedBorrowing?: number | null;
  grossWeightBps?: number | null;
  snapshotAt: string;
  isComplete: boolean;
  notes?: string | null;
  positions: Array<{
    ticker: string;
    company: string;
    shares: number | null;
    referencePrice: number | null;
    marketValue: number | null;
    weightBps: number | null;
    weightKind: WeightKind;
    sourcePostId?: string;
  }>;
};

export type IngestPayload = {
  run: {
    id: string;
    startedAt: string;
    completedAt: string;
    newestPostId: string | null;
    postsSeen: number;
  };
  posts: IngestPost[];
  events: IngestEvent[];
  snapshot?: IngestSnapshot | null;
};
