import { describe, it, expect, beforeEach } from "vitest";
import { AttentionScorer } from "../engine/attentionScorer.js";

describe("AttentionScorer Engine", () => {
  let scorer: AttentionScorer;

  beforeEach(() => {
    scorer = new AttentionScorer();
  });

  it("should score high urgency (>70) on volume surge + 52W breakout", () => {
    const score = scorer.computeScore(
      310.0, // price
      280.0, // previous close
      3.2,   // 3.2x volume multiple
      true,  // 52W breakout
      5.0,   // circuit distance
      []
    );

    expect(score.totalScore).toBeGreaterThanOrEqual(70);
    expect(score.volumeComponent).toBe(30);
    expect(score.levelViolationComponent).toBe(25);
    expect(score.primaryReason).toContain("52W Breakout");
  });

  it("should score low urgency (<25) for routine market fluctuations", () => {
    const score = scorer.computeScore(
      100.2, // price
      100.0, // previous close (+0.2%)
      0.95,  // normal volume
      false, // no breakout
      8.0,   // far from circuit
      []
    );

    expect(score.totalScore).toBeLessThan(25);
  });
});
