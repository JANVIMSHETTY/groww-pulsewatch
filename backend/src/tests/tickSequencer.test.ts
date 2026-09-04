import { describe, it, expect, beforeEach } from "vitest";
import { TickSequencer } from "../engine/tickSequencer.js";
import { RawTick } from "../types/market.js";

describe("TickSequencer Engine", () => {
  let sequencer: TickSequencer;

  beforeEach(() => {
    sequencer = new TickSequencer();
  });

  const baseTick: RawTick = {
    symbol: "RELIANCE",
    exchange: "NSE",
    price: 2980.0,
    volume: 1000000,
    lastTradedQty: 50,
    timestamp: 1000000,
    sequenceId: 100,
  };

  it("should accept initial valid monotonic tick", () => {
    const res = sequencer.validateAndSequence(baseTick, 1000500); // 500ms latency
    expect(res.isValid).toBe(true);
    expect(res.staleness).toBe("LIVE");
    expect(res.latencyMs).toBe(500);
  });

  it("should reject out-of-order sequence tick (seq N <= lastSeq)", () => {
    sequencer.validateAndSequence(baseTick, 1000500);

    const oldTick: RawTick = {
      ...baseTick,
      sequenceId: 99, // out of order
      timestamp: 1000100,
    };

    const res = sequencer.validateAndSequence(oldTick, 1000600);
    expect(res.isValid).toBe(false);
    expect(res.rejectReason).toBe("OUT_OF_ORDER_SEQUENCE");
  });

  it("should reject exact duplicate ticks", () => {
    sequencer.validateAndSequence(baseTick, 1000500);
    const res = sequencer.validateAndSequence(baseTick, 1000500);
    expect(res.isValid).toBe(false);
    expect(res.rejectReason).toBe("DUPLICATE_TICK");
  });

  it("should reject ticks with excessive future clock skew (>30s)", () => {
    const futureTick: RawTick = {
      ...baseTick,
      timestamp: 2000000, // far future
      sequenceId: 101,
    };
    const res = sequencer.validateAndSequence(futureTick, 1000000);
    expect(res.isValid).toBe(false);
    expect(res.rejectReason).toBe("EXCESSIVE_CLOCK_SKEW");
  });

  it("should calculate correct staleness SLAs", () => {
    expect(sequencer.calculateStaleness(1500)).toBe("LIVE");
    expect(sequencer.calculateStaleness(5500)).toBe("DELAYED");
    expect(sequencer.calculateStaleness(25000)).toBe("STALE");
  });
});
