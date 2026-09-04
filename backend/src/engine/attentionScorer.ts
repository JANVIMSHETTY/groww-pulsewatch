import { AttentionScoreBreakdown, MeaningfulChangeEvent, ProcessedQuote } from "../types/market.js";

export class AttentionScorer {
  public computeScore(
    price: number,
    previousClose: number,
    volumeMultiple: number,
    isFiftyTwoWeekBreakout: boolean,
    distanceToCircuitPct: number,
    activeEvents: MeaningfulChangeEvent[]
  ): AttentionScoreBreakdown {
    // 1. Volume Surge Component (0 - 30 pts)
    // 1.0x volume = 0 pts; 2.0x volume = 15 pts; >= 3.0x volume = 30 pts
    let volumeComponent = 0;
    if (volumeMultiple > 1.0) {
      volumeComponent = Math.min(30, Math.round(((volumeMultiple - 1.0) / 2.0) * 30));
    }

    // 2. Price Velocity / Magnitude Component (0 - 30 pts)
    // Absolute daily price change
    const absChangePct = Math.abs(((price - previousClose) / previousClose) * 100);
    // 0% = 0 pts; 5% = 20 pts; >= 7.5% = 30 pts
    let priceVelocityComponent = Math.min(30, Math.round((absChangePct / 7.5) * 30));

    // Boost if there is an active rapid velocity (RoC) event
    const hasRoCEvent = activeEvents.some((e) => e.eventType === "RAPID_ROC_ACCELERATION");
    if (hasRoCEvent) {
      priceVelocityComponent = Math.min(30, priceVelocityComponent + 10);
    }

    // 3. Key Level Violation Component (0 - 25 pts)
    let levelViolationComponent = 0;
    if (isFiftyTwoWeekBreakout) {
      levelViolationComponent = 25;
    }

    // 4. Circuit Proximity Component (0 - 15 pts)
    // Distance <= 1.0% = 15 pts; 1.0% to 2.5% = scaled pts; > 2.5% = 0 pts
    let circuitProximityComponent = 0;
    if (distanceToCircuitPct <= 1.0) {
      circuitProximityComponent = 15;
    } else if (distanceToCircuitPct <= 2.5) {
      circuitProximityComponent = Math.round(((2.5 - distanceToCircuitPct) / 1.5) * 15);
    }

    const totalScore = Math.min(
      100,
      volumeComponent + priceVelocityComponent + levelViolationComponent + circuitProximityComponent
    );

    // Formulate a crisp human-readable rationale
    let primaryReason = "Normal market movements";
    if (totalScore >= 75) {
      const topFactors: string[] = [];
      if (levelViolationComponent > 0) topFactors.push("52W Breakout");
      if (volumeComponent >= 20) topFactors.push(`Volume ${volumeMultiple.toFixed(1)}x surge`);
      if (circuitProximityComponent >= 10) topFactors.push("Nearing circuit band");
      if (hasRoCEvent) topFactors.push("Flash price acceleration");
      primaryReason = topFactors.length > 0 ? topFactors.join(" + ") : `High volatility (${absChangePct.toFixed(1)}% move)`;
    } else if (totalScore >= 45) {
      if (volumeComponent >= 15) primaryReason = `Elevated volume (${volumeMultiple.toFixed(1)}x avg)`;
      else if (absChangePct >= 2.5) primaryReason = `Notable price movement (${absChangePct.toFixed(1)}%)`;
      else primaryReason = "Moderate technical activity";
    }

    return {
      volumeComponent,
      priceVelocityComponent,
      levelViolationComponent,
      circuitProximityComponent,
      totalScore,
      primaryReason,
    };
  }
}
