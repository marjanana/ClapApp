import { describe, expect, it } from "vitest";
import { paloById } from "../data/palos";
import { beginnerTimingWindows, scoreClap, summarizeClaps } from "./scoring";

describe("scoring", () => {
  it("classifies beginner timing windows", () => {
    expect(beginnerTimingWindows).toEqual({ onTimeMs: 70, acceptableMs: 120 });

    const palo = paloById.tangos;
    const start = 1_000;

    expect(scoreClap(start + 60, start, 60, palo).result).toBe("on_time");
    expect(scoreClap(start - 90, start, 60, palo).result).toBe("early");
    expect(scoreClap(start + 90, start, 60, palo).result).toBe("late");
  });

  it("maps timestamps back to cycle position", () => {
    const palo = paloById.tangos;
    const start = 2_000;

    expect(scoreClap(start + 1_000, start, 60, palo).expectedBeat).toBe(2);
    expect(scoreClap(start + 4_000, start, 60, palo).expectedBeat).toBe(5);
    expect(scoreClap(start + 5_000, start, 60, palo).expectedBeat).toBe(1);
  });

  it("summarizes steady, early, and late tendencies", () => {
    const summary = summarizeClaps([
      { timestampMs: 0, expectedBeat: 1, timingErrorMs: -90, result: "early" },
      { timestampMs: 0, expectedBeat: 2, timingErrorMs: -80, result: "early" },
      { timestampMs: 0, expectedBeat: 3, timingErrorMs: 20, result: "on_time" }
    ]);

    expect(summary.earlyCount).toBe(2);
    expect(summary.timingTendency).toBe("rushing");
    expect(summary.stabilityScore).toBeGreaterThan(0);
  });
});
