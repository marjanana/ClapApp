import { describe, expect, it } from "vitest";
import { paloById } from "../data/palos";
import { shouldPlayCue } from "./cueModes";

describe("cue modes", () => {
  it("plays every beat in full-pulse mode", () => {
    const palo = paloById.tangos;

    expect([0, 1, 2, 3].map((beat) => shouldPlayCue("full_pulse", palo, beat, 0))).toEqual([
      true,
      true,
      true,
      true
    ]);
  });

  it("plays only structural accents in accent-only mode", () => {
    const palo = paloById.tangos;

    expect([0, 1, 2, 3].map((beat) => shouldPlayCue("accent_only", palo, beat, 0))).toEqual([
      false,
      true,
      false,
      true
    ]);
  });

  it("drops cues for the second half of a four-cycle dropout group", () => {
    const palo = paloById.solea;

    expect(shouldPlayCue("dropout", palo, 0, 0)).toBe(true);
    expect(shouldPlayCue("dropout", palo, 0, 1)).toBe(true);
    expect(shouldPlayCue("dropout", palo, 0, 2)).toBe(false);
    expect(shouldPlayCue("dropout", palo, 0, 3)).toBe(false);
  });

  it("alternates app and user cycles in call-and-response mode", () => {
    const palo = paloById.fandangos_huelva;

    expect(shouldPlayCue("call_response", palo, 0, 0)).toBe(true);
    expect(shouldPlayCue("call_response", palo, 0, 1)).toBe(false);
  });
});
