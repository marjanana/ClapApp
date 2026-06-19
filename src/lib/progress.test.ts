import { describe, expect, it } from "vitest";
import { createInitialProgress, updatePaloProgress } from "./progress";

describe("progress", () => {
  it("starts with only entry palos unlocked", () => {
    const progress = createInitialProgress();

    expect(progress.find((record) => record.paloId === "tangos")?.unlocked).toBe(true);
    expect(progress.find((record) => record.paloId === "tientos")?.unlocked).toBe(false);
  });

  it("unlocks the next palo after completing its prerequisite", () => {
    const progress = updatePaloProgress(createInitialProgress(), "tangos", "tangos-silent-one", 80);

    expect(progress.find((record) => record.paloId === "tientos")?.unlocked).toBe(true);
  });

  it("preserves the best score when a weaker round is saved", () => {
    const first = updatePaloProgress(createInitialProgress(), "tangos", "round-one", 82);
    const second = updatePaloProgress(first, "tangos", "round-two", 61);

    expect(second.find((record) => record.paloId === "tangos")?.bestStabilityScore).toBe(82);
  });
});
