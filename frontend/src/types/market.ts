export type Exchange = "NSE" | "BSE";
export type StalenessStatus = "LIVE" | "DELAYED" | "STALE";

export type EventType = 
  | "VOLUME_SURGE" 
  | "BREAKOUT_52W_HIGH" 
  | "BREAKOUT_52W_LOW"
  | "CIRCUIT_APPROACH" 
  | "RAPID_ROC_ACCELERATION"
  | "GAP_UP_OPEN"
  | "GAP_DOWN_OPEN";

export type EventSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface MeaningfulChangeEvent {
  id: string;
  symbol: string;
  eventType: EventType;
  severity: EventSeverity;
  headline: string;
  details: string;
  timestamp: number;
  metrics: {
    price: number;
    volumeMultiple?: number;
    priceChangePct?: number;
    distanceToCircuitPct?: number;
    thresholdCrossed?: string;
  };
}

export interface AttentionScoreBreakdown {
  volumeComponent: number;
  priceVelocityComponent: number;
  levelViolationComponent: number;
  circuitProximityComponent: number;
  totalScore: number;
  primaryReason: string;
}

export interface ProcessedQuote {
  symbol: string;
  name: string;
  exchange: Exchange;
  sector: string;
  price: number;
  dayOpen: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  dayChange: number;
  dayChangePct: number;
  volume: number;
  baselineVolume20D: number;
  volumeMultiple: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  upperCircuit: number;
  lowerCircuit: number;
  distanceToUpperCircuitPct: number;
  distanceToLowerCircuitPct: number;
  stalenessStatus: StalenessStatus;
  lastTickTimestamp: number;
  sequenceId: number;
  isConflictResolved: boolean;
  activeExchange: Exchange;
  attentionScore: number;
  attentionBreakdown: AttentionScoreBreakdown;
  activeEvents: MeaningfulChangeEvent[];
}

export interface SessionCatchUpDigest {
  lastViewedAt: string;
  currentTimestamp: string;
  timeAwayMinutes: number;
  totalWatchlistItems: number;
  itemsRequiringAttention: number;
  criticalEvents: MeaningfulChangeEvent[];
  topMoversSinceLastSeen: {
    symbol: string;
    name: string;
    priceThen: number;
    priceNow: number;
    changeSinceSeenPct: number;
    volumeSurgePct: number;
    keyHighlight: string;
    attentionScore: number;
  }[];
}

export interface Watchlist {
  id: string;
  name: string;
  isDefault: boolean;
  items: {
    id: string;
    symbol: string;
    name: string;
    exchange: string;
    sector: string;
    quote?: ProcessedQuote;
    addedAt: string;
  }[];
}
