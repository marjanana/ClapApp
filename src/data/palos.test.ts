import { describe, expect, it } from "vitest";
import { getPatternNotation, paloById, palos } from "./palos";

describe("palos", () => {
  it("keeps every pattern aligned with its cycle and labels", () => {
    for (const palo of palos) {
      expect(palo.pattern).toHaveLength(palo.cycleLength);
      expect(palo.countLabels).toHaveLength(palo.cycleLength);
      expect(palo.accents.every((accent) => accent >= 1 && accent <= palo.cycleLength)).toBe(true);
    }
  });

  it("defines the beginner tangos four-clap-plus-reset map and verdiales silent-beat map", () => {
    expect(getPatternNotation(paloById.tangos)).toBe("x X x X .");
    expect(getPatternNotation(paloById.verdiales)).toBe(". X X");
  });

  it("uses the 12, 3, 6, 8, 10 teaching skeleton for solea and buleria", () => {
    expect(paloById.solea.countLabels.filter((_, index) => paloById.solea.accents.includes(index + 1))).toEqual([
      "12",
      "3",
      "6",
      "8",
      "10"
    ]);
    expect(paloById.buleria.accents).toEqual(paloById.solea.accents);
  });
});
