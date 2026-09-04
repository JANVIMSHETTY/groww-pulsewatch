import { describe, it, expect, beforeEach } from "vitest";
import { MeaningfulChangeDetector } from "../engine/changeDetector.js";
import { Instrument } from "@prisma/client";
import { RawTick } from "../types/market.js";

describe("MeaningfulChangeDetector Engine", () => {
  let detector: MeaningfulChangeDetector;

  beforeEach(() => {
    detector = new MeaningfulChangeDetector();
  });

  const mockInstrument: Instrument = {
    symbol: "ZOMATO",
    name: "Zomato Ltd",
    exchange: "NSE",
    sector: "Consumer Tech",
    dayOpen: 250.0,
    previousClose: 250.0,
    fiftyTwoWeekHigh: 280.0,
    fiftyTwoWeekLow: 120.0,
    upperCircuit: 300.0,
    lowerCircuit: 200.0,
    baselineVolume20D: 10000000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should detect Volume Surge when volume multiple >= 2.2x expected", () => {
    const tick: RawTick = {
      symbol: "ZOMATO",
      exchange: "NSE",
      price: 255.0,
      volume: 15000000, // 15M volume vs 5M expected mid-day = 3.0x
      lastTradedQty: 10000,
      timestamp: Date.now(),
      sequenceId: 10,
    };

    const events = detector.evaluateChanges(mockInstrument, tick, 0.5);
    const volumeEvent = events.find((e) => e.eventType === "VOLUME_SURGE");
    expect(volumeEvent).toBeDefined();
    expect(volumeEvent?.severity).toBe("WARNING");
    expect(volumeEvent?.metrics.volumeMultiple).toBeGreaterThanOrEqual(2.2);
  });

  it("should detect 52-Week High Breakout", () => {
    const tick: RawTick = {
      symbol: "ZOMATO",
      exchange: "NSE",
      price: 285.0, // breached 280.0
      volume: 4000000,
      lastTradedQty: 500,
      timestamp: Date.now(),
      sequenceId: 12,
    };

    const events = detector.evaluateChanges(mockInstrument, tick, 0.5);
    const breakout = events.find((e) => e.eventType === "BREAKOUT_52W_HIGH");
    expect(breakout).toBeDefined();
    expect(breakout?.severity).toBe("CRITICAL");
  });

  it("should detect Circuit Breaker proximity when price <= 1.2% from circuit", () => {
    const tick: RawTick = {
      symbol: "ZOMATO",
      exchange: "NSE",
      price: 298.0, // within 0.67% of upper circuit 300.0
      volume: 4000000,
      lastTradedQty: 500,
      timestamp: Date.now(),
      sequenceId: 15,
    };

    const events = detector.evaluateChanges(mockInstrument, tick, 0.5);
    const circuit = events.find((e) => e.eventType === "CIRCUIT_APPROACH");
    expect(circuit).toBeDefined();
    expect(circuit?.metrics.distanceToCircuitPct).toBeLessThan(1.2);
  });
});
