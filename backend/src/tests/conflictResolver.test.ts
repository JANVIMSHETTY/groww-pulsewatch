import { describe, it, expect, beforeEach } from "vitest";
import { MultiExchangeConflictResolver } from "../engine/conflictResolver.js";
import { RawTick } from "../types/market.js";

describe("MultiExchangeConflictResolver Engine", () => {
  let resolver: MultiExchangeConflictResolver;

  beforeEach(() => {
    resolver = new MultiExchangeConflictResolver();
  });

  const nseTick: RawTick = {
    symbol: "TCS",
    exchange: "NSE",
    price: 4100.0,
    volume: 2000000,
    lastTradedQty: 100,
    timestamp: 1000000,
    sequenceId: 50,
  };

  const bseTick: RawTick = {
    symbol: "TCS",
    exchange: "BSE",
    price: 4102.0,
    volume: 500000,
    lastTradedQty: 25,
    timestamp: 1000100,
    sequenceId: 50,
  };

  it("should pass through single feed with no conflict", () => {
    const res = resolver.reconcile(nseTick);
    expect(res.isConflictResolved).toBe(false);
    expect(res.preferredTick.exchange).toBe("NSE");
  });

  it("should select NSE as primary liquidity provider under equal freshness", () => {
    resolver.reconcile(nseTick);
    const res = resolver.reconcile(bseTick);
    expect(res.isConflictResolved).toBe(true);
    expect(res.preferredTick.exchange).toBe("NSE");
  });

  it("should detect material cross-exchange arbitrage discrepancies (spread >= 0.4%)", () => {
    resolver.reconcile(nseTick);
    const wideBseTick: RawTick = {
      ...bseTick,
      price: 4130.0, // ~0.73% higher
    };
    const res = resolver.reconcile(wideBseTick);
    expect(res.arbitrageFlag).toBe(true);
    expect(res.priceDiscrepancyPct).toBeGreaterThan(0.4);
  });
});
