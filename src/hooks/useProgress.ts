import { useEffect, useState } from "react";
import type { PaloId, ProgressRecord } from "../types";
import { loadProgress, saveProgress, updatePaloProgress } from "../lib/progress";

export function useProgress() {
  const [progress, setProgress] = useState<ProgressRecord[]>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  function completePractice(paloId: PaloId, lessonId: string, stabilityScore: number) {
    setProgress((current) => updatePaloProgress(current, paloId, lessonId, stabilityScore));
  }

  return {
    progress,
    completePractice
  };
}
