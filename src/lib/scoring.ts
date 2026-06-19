import type { ClapEvent, PaloPattern, ScoreSummary } from "../types";

const ON_TIME_MS = 70;
const ACCEPTABLE_MS = 120;

export function classifyTimingError(errorMs: number): ClapEvent["result"] {
  const absolute = Math.abs(errorMs);

  if (absolute <= ON_TIME_MS) {
    return "on_time";
  }

  if (absolute <= ACCEPTABLE_MS) {
    return errorMs < 0 ? "early" : "late";
  }

  return errorMs < 0 ? "early" : "late";
}

export function getExpectedBeatFromTimestamp(
  timestampMs: number,
  sessionStartMs: number,
  bpm: number,
  palo: PaloPattern
): { beat: number; timingErrorMs: number } {
  const beatDurationMs = 60_000 / bpm;
  const elapsedMs = timestampMs - sessionStartMs;
  const nearestGridIndex = Math.max(0, Math.round(elapsedMs / beatDurationMs));
  const expectedTimestamp = sessionStartMs + nearestGridIndex * beatDurationMs;
  const beat = (nearestGridIndex % palo.cycleLength) + 1;

  return {
    beat,
    timingErrorMs: Math.round(timestampMs - expectedTimestamp)
  };
}

export function scoreClap(
  timestampMs: number,
  sessionStartMs: number,
  bpm: number,
  palo: PaloPattern
): ClapEvent {
  const expected = getExpectedBeatFromTimestamp(timestampMs, sessionStartMs, bpm, palo);

  return {
    timestampMs,
    expectedBeat: expected.beat,
    timingErrorMs: expected.timingErrorMs,
    result: classifyTimingError(expected.timingErrorMs)
  };
}

export function summarizeClaps(events: ClapEvent[]): ScoreSummary {
  const onTimeCount = events.filter((event) => event.result === "on_time").length;
  const earlyCount = events.filter((event) => event.result === "early").length;
  const lateCount = events.filter((event) => event.result === "late").length;
  const missedCount = events.filter((event) => event.result === "missed").length;
  const extraCount = events.filter((event) => event.result === "extra").length;
  const scoredCount = events.filter((event) => event.result !== "extra").length || 1;
  const stabilityScore = Math.max(
    0,
    Math.round(((onTimeCount + 0.5 * (earlyCount + lateCount)) / scoredCount) * 100)
  );

  const signedErrors = events
    .filter((event) => event.result === "early" || event.result === "late" || event.result === "on_time")
    .map((event) => event.timingErrorMs);
  const averageSignedError =
    signedErrors.length === 0
      ? 0
      : signedErrors.reduce((total, value) => total + value, 0) / signedErrors.length;

  const timingTendency =
    Math.abs(averageSignedError) <= 20
      ? "steady"
      : averageSignedError < 0
        ? "rushing"
        : "dragging";

  return {
    stabilityScore,
    timingTendency,
    onTimeCount,
    earlyCount,
    lateCount,
    missedCount,
    extraCount,
    message: getGentleMessage(stabilityScore, timingTendency)
  };
}

function getGentleMessage(score: number, tendency: ScoreSummary["timingTendency"]): string {
  if (score >= 85) {
    return "That felt steady. Keep the same calm hands for one more round.";
  }

  if (tendency === "rushing") {
    return "You are arriving a little early. Breathe before the clap.";
  }

  if (tendency === "dragging") {
    return "You are landing a little late. Let the next beat come sooner.";
  }

  return "The cycle is forming. Slow it down and give each beat more room.";
}

export const beginnerTimingWindows = {
  onTimeMs: ON_TIME_MS,
  acceptableMs: ACCEPTABLE_MS
};
