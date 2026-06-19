import type { CueMode, PaloPattern } from "../types";

export const cueModeLabels: Record<CueMode, string> = {
  full_pulse: "Full pulse",
  accent_only: "Accent only",
  dropout: "Cue dropout",
  random_entry: "Random entry",
  call_response: "Call and response",
  assessment: "Gentle assessment"
};

export function shouldPlayCue(
  mode: CueMode,
  palo: PaloPattern,
  beatIndex: number,
  cycleIndex: number
): boolean {
  const beatNumber = beatIndex + 1;
  const isAccent = palo.accents.includes(beatNumber);

  if (mode === "full_pulse") {
    return true;
  }

  if (mode === "accent_only" || mode === "assessment") {
    return isAccent;
  }

  if (mode === "dropout") {
    const isDropoutCycle = cycleIndex % 4 >= 2;
    return !isDropoutCycle && (isAccent || beatIndex === 0);
  }

  if (mode === "random_entry") {
    return isAccent || beatIndex === 0;
  }

  if (mode === "call_response") {
    const appCycle = cycleIndex % 2 === 0;
    return appCycle && (isAccent || beatIndex === 0);
  }

  return false;
}

export function getCueInstruction(mode: CueMode): string {
  if (mode === "dropout") {
    return "Two guided cycles, then two quiet cycles. Keep the pulse inside.";
  }

  if (mode === "random_entry") {
    return "Start from the highlighted entry point and land back in the cycle.";
  }

  if (mode === "call_response") {
    return "Listen for one cycle, then answer for one cycle.";
  }

  if (mode === "assessment") {
    return "Hints are reduced so the review can show what is really steady.";
  }

  if (mode === "accent_only") {
    return "Only structural accents sound. Let the quiet beats keep breathing.";
  }

  return "Every beat sounds, with accents brighter than the rest.";
}
