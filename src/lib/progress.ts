import type { PaloId, ProgressRecord } from "../types";
import { palos } from "../data/palos";

const STORAGE_KEY = "palmas-pace-progress-v1";

export function createInitialProgress(): ProgressRecord[] {
  return palos.map((palo) => ({
    paloId: palo.id,
    completedLessons: [],
    bestStabilityScore: 0,
    lastPracticedAt: "",
    unlocked: !palo.unlockAfter
  }));
}

export function loadProgress(storage: Storage = window.localStorage): ProgressRecord[] {
  const raw = storage.getItem(STORAGE_KEY);

  if (!raw) {
    return createInitialProgress();
  }

  try {
    const parsed = JSON.parse(raw) as ProgressRecord[];
    return reconcileProgress(parsed);
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress: ProgressRecord[], storage: Storage = window.localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updatePaloProgress(
  progress: ProgressRecord[],
  paloId: PaloId,
  lessonId: string,
  stabilityScore: number
): ProgressRecord[] {
  const next = progress.map((record) => {
    if (record.paloId !== paloId) {
      return record;
    }

    return {
      ...record,
      completedLessons: Array.from(new Set([...record.completedLessons, lessonId])),
      bestStabilityScore: Math.max(record.bestStabilityScore, stabilityScore),
      lastPracticedAt: new Date().toISOString()
    };
  });

  return unlockNextPalos(next);
}

export function getCompletedPaloIds(progress: ProgressRecord[]): Set<PaloId> {
  return new Set(
    progress
      .filter((record) => record.completedLessons.length > 0 || record.bestStabilityScore >= 60)
      .map((record) => record.paloId)
  );
}

function reconcileProgress(records: ProgressRecord[]): ProgressRecord[] {
  const byId = new Map(records.map((record) => [record.paloId, record]));
  return unlockNextPalos(
    createInitialProgress().map((initial) => ({
      ...initial,
      ...byId.get(initial.paloId)
    }))
  );
}

function unlockNextPalos(progress: ProgressRecord[]): ProgressRecord[] {
  const completed = getCompletedPaloIds(progress);

  return progress.map((record) => {
    const palo = palos.find((item) => item.id === record.paloId);

    if (!palo?.unlockAfter) {
      return { ...record, unlocked: true };
    }

    return {
      ...record,
      unlocked: completed.has(palo.unlockAfter)
    };
  });
}
