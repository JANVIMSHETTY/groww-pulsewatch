export type Exchange = "NSE" | "BSE";

export type StalenessStatus = "LIVE" | "DELAYED" | "STALE";

export interface RawTick {
  symbol: string;
  exchange: Exchange;
  price: number;
  volume: number;          // Cumulative day volume
  lastTradedQty: number;   // Qty in current tick
  timestamp: number;       // Unix epoch ms
  sequenceId: number;      // Monotonic sequence id from exchange feed
  bidPrice?: number;
  askPrice?: number;
}

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
  volumeComponent: number;      // 0 - 30 points
  priceVelocityComponent: number; // 0 - 30 points
  levelViolationComponent: number; // 0 - 25 points
  circuitProximityComponent: number; // 0 - 15 points
  totalScore: number;          // 0 - 100 points
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
  
  // Data Integrity & SLA
  stalenessStatus: StalenessStatus;
  lastTickTimestamp: number;
  sequenceId: number;
  isConflictResolved: boolean;
  activeExchange: Exchange;

  // Urgency & Attention
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
