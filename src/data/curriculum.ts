import type { Lesson } from "../types";

export const curriculum: Lesson[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    stage: "Foundation",
    minutes: 8,
    focus: "Hear the pulse before trying to be clever with your hands.",
    steps: [
      "Listen to the beat and count aloud.",
      "Practice soft palmas sordas and bright palmas claras.",
      "Clap every beat gently for four short rounds.",
      "Rest your hands whenever tension appears."
    ]
  },
  {
    id: "tangos-silent-one",
    title: "Tangos: Four Claps",
    stage: "Four-beat family",
    paloId: "tangos",
    minutes: 6,
    focus: "Clap all four beats while keeping 2 and 4 stronger.",
    steps: [
      "Hear four beats and watch the soft reset clap on beat 1.",
      "Clap x X x X with full-pulse cues.",
      "Repeat with accent-only cues.",
      "Check whether the soft beat 1 stays calm."
    ]
  },
  {
    id: "tientos-patience",
    title: "Tientos: Patience",
    stage: "Four-beat family",
    paloId: "tientos",
    minutes: 6,
    focus: "Hold the same tangos map at a slower tempo.",
    steps: [
      "Count slowly and keep every clap relaxed.",
      "Clap x X x X for eight cycles.",
      "Use cue dropout for two quiet cycles.",
      "Review whether your claps dragged or rushed."
    ]
  },
  {
    id: "fandangos-anchor",
    title: "Fandangos: Anchor Beat",
    stage: "Three-beat family",
    paloId: "fandangos_huelva",
    minutes: 7,
    focus: "Make beat 1 strong and let beats 2 and 3 stay light.",
    steps: [
      "Listen to the 3-pulse loop.",
      "Clap X x x with a relaxed wrist.",
      "Switch between full-pulse and accent-only cues.",
      "Notice if the phrase starts to blur."
    ]
  },
  {
    id: "verdiales-silent-downbeat",
    title: "Verdiales: Silent Downbeat",
    stage: "Three-beat family",
    paloId: "verdiales",
    minutes: 7,
    focus: "Feel beat 1 silently, then place two bright claps.",
    steps: [
      "Step or nod on beat 1 without clapping.",
      "Clap . X X for eight cycles.",
      "Try call and response.",
      "Review whether you turned beat 2 into beat 1."
    ]
  },
  {
    id: "solea-anchors",
    title: "Solea: Twelve Anchors",
    stage: "Twelve-beat family",
    paloId: "solea",
    minutes: 9,
    focus: "Find 12, 3, 6, 8, and 10 without losing the cycle.",
    steps: [
      "Hear all 12 pulses.",
      "Clap only structural accents.",
      "Enter from beat 8, then from beat 10.",
      "Use two cycles of cue dropout."
    ]
  },
  {
    id: "alegrias-bright-cycle",
    title: "Alegrias: Bright Cycle",
    stage: "Twelve-beat family",
    paloId: "alegrias",
    minutes: 8,
    focus: "Keep the solea architecture while the feel gets lighter.",
    steps: [
      "Start with the same 12-pulse accent skeleton.",
      "Raise the tempo only after two steady rounds.",
      "Use accent-only cues.",
      "Review the cycle position after each round."
    ]
  },
  {
    id: "buleria-slow-mode",
    title: "Buleria: Slow Mode",
    stage: "Twelve-beat family",
    paloId: "buleria",
    minutes: 8,
    focus: "Stay slow enough to understand the compas before chasing speed.",
    steps: [
      "Begin with the default 12, 3, 6, 8, 10 anchors.",
      "Practice one cycle of call and response.",
      "Clap only 12 and 10 when prompted.",
      "Stop if the cycle disappears."
    ]
  }
];
