import { RawTick, StalenessStatus } from "../types/market.js";

export interface TickValidationResult {
  isValid: boolean;
  rejectReason?: "OUT_OF_ORDER_SEQUENCE" | "EXCESSIVE_CLOCK_SKEW" | "DUPLICATE_TICK";
  staleness: StalenessStatus;
  latencyMs: number;
}

export class TickSequencer {
  // Tracks highest seen sequence ID per symbol:exchange
  private lastSequenceMap = new Map<string, number>();
  // Tracks last processed tick timestamp per symbol:exchange
  private lastTimestampMap = new Map<string, number>();

  // SLA Thresholds in milliseconds
  private readonly DELAYED_THRESHOLD_MS = 4000;
  private readonly STALE_THRESHOLD_MS = 15000;
  private readonly MAX_CLOCK_SKEW_FUTURE_MS = 30000; // reject ticks >30s in future

  private getKey(symbol: string, exchange: string): string {
    return `${symbol.toUpperCase()}:${exchange.toUpperCase()}`;
  }

  public validateAndSequence(tick: RawTick, currentTimeMs: number = Date.now()): TickValidationResult {
    const key = this.getKey(tick.symbol, tick.exchange);
    const lastSeq = this.lastSequenceMap.get(key) ?? -1;
    const lastTime = this.lastTimestampMap.get(key) ?? 0;

    // Check future clock skew
    if (tick.timestamp > currentTimeMs + this.MAX_CLOCK_SKEW_FUTURE_MS) {
      return {
        isValid: false,
        rejectReason: "EXCESSIVE_CLOCK_SKEW",
        staleness: "STALE",
        latencyMs: 0,
      };
    }

    // Check for duplicates
    if (tick.sequenceId === lastSeq && tick.timestamp === lastTime) {
      return {
        isValid: false,
        rejectReason: "DUPLICATE_TICK",
        staleness: "LIVE",
        latencyMs: currentTimeMs - tick.timestamp,
      };
    }

    // Check monotonic sequence constraint
    if (tick.sequenceId <= lastSeq) {
      return {
        isValid: false,
        rejectReason: "OUT_OF_ORDER_SEQUENCE",
        staleness: this.calculateStaleness(currentTimeMs - tick.timestamp),
        latencyMs: currentTimeMs - tick.timestamp,
      };
    }

    // Valid tick: update state
    this.lastSequenceMap.set(key, tick.sequenceId);
    this.lastTimestampMap.set(key, tick.timestamp);

    const latencyMs = Math.max(0, currentTimeMs - tick.timestamp);
    const staleness = this.calculateStaleness(latencyMs);

    return {
      isValid: true,
      staleness,
      latencyMs,
    };
  }

  public calculateStaleness(latencyMs: number): StalenessStatus {
    if (latencyMs < this.DELAYED_THRESHOLD_MS) return "LIVE";
    if (latencyMs <= this.STALE_THRESHOLD_MS) return "DELAYED";
    return "STALE";
  }

  public reset(symbol?: string, exchange?: string): void {
    if (symbol && exchange) {
      const key = this.getKey(symbol, exchange);
      this.lastSequenceMap.delete(key);
      this.lastTimestampMap.delete(key);
    } else {
      this.lastSequenceMap.clear();
      this.lastTimestampMap.clear();
    }
  }
}
