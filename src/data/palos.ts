import type { PaloId, PaloPattern } from "../types";

export const palos: PaloPattern[] = [
  {
    id: "tangos",
    name: "Tangos",
    cycleLength: 5,
    defaultBpm: 92,
    minBpm: 60,
    maxBpm: 160,
    countLabels: ["1", "2", "3", "4", "reset"],
    pattern: ["x", "X", "x", "X", "."],
    accents: [2, 4],
    beginnerNote: "Clap four beats, then see the silent reset beat before the cycle begins again.",
    family: "four"
  },
  {
    id: "tientos",
    name: "Tientos",
    cycleLength: 5,
    defaultBpm: 70,
    minBpm: 50,
    maxBpm: 120,
    countLabels: ["1", "2", "3", "4", "reset"],
    pattern: ["x", "X", "x", "X", "."],
    accents: [2, 4],
    beginnerNote: "Use the same four claps plus silent reset as tangos, but let the slower tempo teach patience.",
    family: "four",
    unlockAfter: "tangos"
  },
  {
    id: "fandangos_huelva",
    name: "Fandangos de Huelva",
    cycleLength: 3,
    defaultBpm: 96,
    minBpm: 70,
    maxBpm: 154,
    countLabels: ["1", "2", "3"],
    pattern: ["X", "x", "x"],
    accents: [1],
    beginnerNote: "Let beat 1 feel like home while 2 and 3 stay light.",
    family: "three",
    unlockAfter: "tientos"
  },
  {
    id: "verdiales",
    name: "Verdiales",
    cycleLength: 3,
    defaultBpm: 108,
    minBpm: 80,
    maxBpm: 150,
    countLabels: ["1", "2", "3"],
    pattern: [".", "X", "X"],
    accents: [2, 3],
    beginnerNote: "Notice the silent downbeat before the two clear claps.",
    family: "three",
    unlockAfter: "fandangos_huelva"
  },
  {
    id: "solea",
    name: "Solea",
    cycleLength: 12,
    defaultBpm: 72,
    minBpm: 50,
    maxBpm: 120,
    countLabels: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    pattern: ["X", ".", ".", "X", ".", ".", "X", ".", "X", ".", "X", "."],
    accents: [1, 4, 7, 9, 11],
    beginnerNote: "Build the 12-pulse cycle slowly: 12, 3, 6, 8, and 10 are your anchors.",
    family: "twelve",
    unlockAfter: "verdiales"
  },
  {
    id: "alegrias",
    name: "Alegrias",
    cycleLength: 12,
    defaultBpm: 112,
    minBpm: 80,
    maxBpm: 170,
    countLabels: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    pattern: ["X", ".", ".", "X", ".", ".", "X", ".", "X", ".", "X", "."],
    accents: [1, 4, 7, 9, 11],
    beginnerNote: "Same 12-beat architecture as solea, with a lighter and brighter feeling.",
    family: "twelve",
    unlockAfter: "solea"
  },
  {
    id: "buleria",
    name: "Buleria Slow Mode",
    cycleLength: 12,
    defaultBpm: 140,
    minBpm: 100,
    maxBpm: 190,
    countLabels: ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    pattern: ["X", ".", ".", "X", ".", ".", "X", ".", "X", ".", "X", "."],
    accents: [1, 4, 7, 9, 11],
    beginnerNote: "Only after solea feels stable: keep the same anchors and let speed arrive gradually.",
    family: "twelve",
    unlockAfter: "solea"
  }
];

export const paloById = Object.fromEntries(palos.map((palo) => [palo.id, palo])) as Record<
  PaloId,
  PaloPattern
>;

export function getPatternNotation(palo: PaloPattern): string {
  return palo.pattern.join(" ");
}

export function isPaloUnlocked(palo: PaloPattern, completedPaloIds: Set<PaloId>): boolean {
  if (!palo.unlockAfter) {
    return true;
  }

  return completedPaloIds.has(palo.unlockAfter);
}
