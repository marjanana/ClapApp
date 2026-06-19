import type { CueMode, PaloPattern } from "../types";
import { shouldPlayCue } from "./cueModes";

export interface BeatTick {
  beatIndex: number;
  cycleIndex: number;
  timestampMs: number;
  shouldCue: boolean;
  isAccent: boolean;
}

export function getBeatDurationMs(bpm: number): number {
  return 60_000 / bpm;
}

export function getBeatTick(
  elapsedMs: number,
  bpm: number,
  palo: PaloPattern,
  cueMode: CueMode
): BeatTick {
  const beatIndexAbsolute = Math.max(0, Math.floor(elapsedMs / getBeatDurationMs(bpm)));
  const beatIndex = beatIndexAbsolute % palo.cycleLength;
  const cycleIndex = Math.floor(beatIndexAbsolute / palo.cycleLength);
  const beatNumber = beatIndex + 1;

  return {
    beatIndex,
    cycleIndex,
    timestampMs: beatIndexAbsolute * getBeatDurationMs(bpm),
    shouldCue: shouldPlayCue(cueMode, palo, beatIndex, cycleIndex),
    isAccent: palo.accents.includes(beatNumber)
  };
}

export function getCycleProgress(elapsedMs: number, bpm: number, palo: PaloPattern): number {
  const cycleDuration = getBeatDurationMs(bpm) * palo.cycleLength;
  return (elapsedMs % cycleDuration) / cycleDuration;
}
