import { Instrument } from "@prisma/client";
import { MeaningfulChangeEvent, RawTick } from "../types/market.js";

export interface PricePoint {
  price: number;
  timestamp: number;
}

export class MeaningfulChangeDetector {
  // Keep rolling 5-minute price buffer per symbol for Rate of Change (RoC) velocity detection
  private priceHistoryBuffer = new Map<string, PricePoint[]>();
  private readonly WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  public evaluateChanges(
    instrument: Instrument,
    currentTick: RawTick,
    sessionElapsedFraction: number = 0.5 // e.g. mid-day (12:30 PM = ~0.5 of 6.25 hr trading day)
  ): MeaningfulChangeEvent[] {
    const events: MeaningfulChangeEvent[] = [];
    const symbol = instrument.symbol;
    const price = currentTick.price;
    const now = currentTick.timestamp;

    // 1. Maintain Rolling Buffer for Velocity (RoC)
    let buffer = this.priceHistoryBuffer.get(symbol);
    if (!buffer) {
      buffer = [];
      this.priceHistoryBuffer.set(symbol, buffer);
    }
    buffer.push({ price, timestamp: now });
    // Evict items older than WINDOW_MS
    const cutoff = now - this.WINDOW_MS;
    buffer = buffer.filter((p) => p.timestamp >= cutoff);
    this.priceHistoryBuffer.set(symbol, buffer);

    // 2. Volume Anomaly Detection
    // Baseline volume expected by this time of day
    const expectedVolumeByNow = instrument.baselineVolume20D * Math.max(0.1, sessionElapsedFraction);
    const volumeMultiple = currentTick.volume / Math.max(1, expectedVolumeByNow);

    if (volumeMultiple >= 2.2) {
      const severity = volumeMultiple >= 3.5 ? "CRITICAL" : "WARNING";
      events.push({
        id: `EVT_VOL_${symbol}_${now}`,
        symbol,
        eventType: "VOLUME_SURGE",
        severity,
        headline: `Extraordinary Volume Surge (${volumeMultiple.toFixed(1)}x expected)`,
        details: `Trading volume reached ${(currentTick.volume / 100000).toFixed(1)} Lakh shares, which is ${volumeMultiple.toFixed(1)}x the 20-day benchmark for this time of day. High probability of institutional block deals or material order flow.`,
        timestamp: now,
        metrics: {
          price,
          volumeMultiple: Number(volumeMultiple.toFixed(2)),
        },
      });
    }

    // 3. 52-Week High Breakout
    if (price >= instrument.fiftyTwoWeekHigh) {
      const breakoutPct = ((price - instrument.fiftyTwoWeekHigh) / instrument.fiftyTwoWeekHigh) * 100;
      events.push({
        id: `EVT_52WH_${symbol}_${now}`,
        symbol,
        eventType: "BREAKOUT_52W_HIGH",
        severity: "CRITICAL",
        headline: `New 52-Week High Breakout (₹${price.toFixed(2)})`,
        details: `Stock has breached its 52-week high of ₹${instrument.fiftyTwoWeekHigh.toFixed(2)}${breakoutPct > 0 ? ` (+${breakoutPct.toFixed(1)}% above)` : ""}. Prior multi-month resistance cleared.`,
        timestamp: now,
        metrics: {
          price,
          thresholdCrossed: `52W High: ₹${instrument.fiftyTwoWeekHigh}`,
        },
      });
    }

    // 4. 52-Week Low Breakdown
    if (price <= instrument.fiftyTwoWeekLow) {
      events.push({
        id: `EVT_52WL_${symbol}_${now}`,
        symbol,
        eventType: "BREAKOUT_52W_LOW",
        severity: "CRITICAL",
        headline: `New 52-Week Low Breakdown (₹${price.toFixed(2)})`,
        details: `Stock fell through its 52-week support floor of ₹${instrument.fiftyTwoWeekLow.toFixed(2)}. Unprecedented 1-year low.`,
        timestamp: now,
        metrics: {
          price,
          thresholdCrossed: `52W Low: ₹${instrument.fiftyTwoWeekLow}`,
        },
      });
    }

    // 5. Circuit Breaker Proximity Alert
    const distToUpperPct = ((instrument.upperCircuit - price) / instrument.upperCircuit) * 100;
    const distToLowerPct = ((price - instrument.lowerCircuit) / instrument.lowerCircuit) * 100;

    if (distToUpperPct <= 1.2 && distToUpperPct >= 0) {
      events.push({
        id: `EVT_CIRC_UP_${symbol}_${now}`,
        symbol,
        eventType: "CIRCUIT_APPROACH",
        severity: "CRITICAL",
        headline: `Nearing Upper Circuit Limit (within ${distToUpperPct.toFixed(1)}%)`,
        details: `Current price ₹${price.toFixed(2)} is just ${distToUpperPct.toFixed(1)}% away from Upper Circuit limit of ₹${instrument.upperCircuit.toFixed(2)}. Trading freeze imminent if buy pressure continues.`,
        timestamp: now,
        metrics: {
          price,
          distanceToCircuitPct: Number(distToUpperPct.toFixed(2)),
          thresholdCrossed: `Upper Circuit: ₹${instrument.upperCircuit}`,
        },
      });
    } else if (distToLowerPct <= 1.2 && distToLowerPct >= 0) {
      events.push({
        id: `EVT_CIRC_LO_${symbol}_${now}`,
        symbol,
        eventType: "CIRCUIT_APPROACH",
        severity: "CRITICAL",
        headline: `Nearing Lower Circuit Limit (within ${distToLowerPct.toFixed(1)}%)`,
        details: `Current price ₹${price.toFixed(2)} is just ${distToLowerPct.toFixed(1)}% away from Lower Circuit limit of ₹${instrument.lowerCircuit.toFixed(2)}. Risk of order halt.`,
        timestamp: now,
        metrics: {
          price,
          distanceToCircuitPct: Number(distToLowerPct.toFixed(2)),
          thresholdCrossed: `Lower Circuit: ₹${instrument.lowerCircuit}`,
        },
      });
    }

    // 6. Rapid Velocity / Flash Rate of Change (RoC) in 5-min window
    if (buffer.length >= 2) {
      const oldestInWindow = buffer[0];
      const timeDiffMinutes = (now - oldestInWindow.timestamp) / 60000;
      if (timeDiffMinutes >= 0.5) { // at least 30s of observation
        const pctVelocity = ((price - oldestInWindow.price) / oldestInWindow.price) * 100;
        if (Math.abs(pctVelocity) >= 1.8) {
          events.push({
            id: `EVT_ROC_${symbol}_${now}`,
            symbol,
            eventType: "RAPID_ROC_ACCELERATION",
            severity: Math.abs(pctVelocity) >= 3.0 ? "CRITICAL" : "WARNING",
            headline: `Flash Momentum: ${pctVelocity > 0 ? "+" : ""}${pctVelocity.toFixed(1)}% in ${Math.round(timeDiffMinutes)} mins`,
            details: `Abnormal rapid acceleration from ₹${oldestInWindow.price.toFixed(2)} to ₹${price.toFixed(2)} within the last ${Math.round(timeDiffMinutes)} minutes.`,
            timestamp: now,
            metrics: {
              price,
              priceChangePct: Number(pctVelocity.toFixed(2)),
            },
          });
        }
      }
    }

    return events;
  }
}
