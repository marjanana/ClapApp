export type PaloId =
  | "tangos"
  | "tientos"
  | "fandangos_huelva"
  | "verdiales"
  | "solea"
  | "alegrias"
  | "buleria";

export type ClapSymbol = "X" | "x" | ".";

export type CueMode =
  | "full_pulse"
  | "accent_only"
  | "dropout"
  | "random_entry"
  | "call_response"
  | "assessment";

export interface PaloPattern {
  id: PaloId;
  name: string;
  cycleLength: number;
  defaultBpm: number;
  minBpm: number;
  maxBpm: number;
  countLabels: string[];
  pattern: ClapSymbol[];
  accents: number[];
  beginnerNote: string;
  family: "foundation" | "four" | "three" | "twelve";
  unlockAfter?: PaloId;
}

export interface PracticeSession {
  paloId: PaloId;
  bpm: number;
  cueMode: CueMode;
  cycles: number;
  clapDetectionEnabled: boolean;
}

export interface ClapEvent {
  timestampMs: number;
  expectedBeat: number;
  timingErrorMs: number;
  result: "early" | "on_time" | "late" | "missed" | "extra";
}

export interface ProgressRecord {
  paloId: PaloId;
  completedLessons: string[];
  bestStabilityScore: number;
  lastPracticedAt: string;
  unlocked: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  stage: string;
  paloId?: PaloId;
  minutes: number;
  focus: string;
  steps: string[];
}

export interface ScoreSummary {
  stabilityScore: number;
  timingTendency: "steady" | "rushing" | "dragging" | "mixed";
  onTimeCount: number;
  earlyCount: number;
  lateCount: number;
  missedCount: number;
  extraCount: number;
  message: string;
}
