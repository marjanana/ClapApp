import { useCallback, useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Circle,
  Eye,
  Gauge,
  Hand,
  Library,
  MapPinned,
  MessageCircle,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TimerReset,
  Trophy
} from "lucide-react";
import { curriculum } from "./data/curriculum";
import { getPatternNotation, paloById, palos } from "./data/palos";
import { cueModeLabels, getCueInstruction } from "./lib/cueModes";
import { scoreClap, summarizeClaps } from "./lib/scoring";
import { useClapDetector } from "./hooks/useClapDetector";
import { useMetronome } from "./hooks/useMetronome";
import { useProgress } from "./hooks/useProgress";
import type { ClapEvent, CueMode, Lesson, PaloId, ScoreSummary } from "./types";

type View = "practice" | "library" | "progress";

const cueModes: CueMode[] = [
  "full_pulse",
  "accent_only",
  "dropout",
  "random_entry",
  "call_response",
  "assessment"
];

export function App() {
  const [view, setView] = useState<View>("practice");
  const [selectedPaloId, setSelectedPaloId] = useState<PaloId>("tangos");
  const [cueMode, setCueMode] = useState<CueMode>("full_pulse");
  const [clapDetectionEnabled, setClapDetectionEnabled] = useState(false);
  const [clapEvents, setClapEvents] = useState<ClapEvent[]>([]);
  const [demoMode, setDemoMode] = useState(true);
  const [lastSavedMessage, setLastSavedMessage] = useState("");
  const selectedPalo = paloById[selectedPaloId];
  const [bpm, setBpm] = useState(selectedPalo.defaultBpm);
  const { progress, completePractice } = useProgress();

  const progressByPalo = useMemo(
    () => new Map(progress.map((record) => [record.paloId, record])),
    [progress]
  );

  const currentLesson = useMemo(() => {
    return (
      curriculum.find((lesson) => {
        if (!lesson.paloId) {
          return false;
        }

        const record = progressByPalo.get(lesson.paloId);
        return record?.unlocked && !record.completedLessons.includes(lesson.id);
      }) ?? curriculum.find((lesson) => lesson.paloId === selectedPaloId) ?? curriculum[0]
    );
  }, [progressByPalo, selectedPaloId]);

  const summary = useMemo<ScoreSummary>(() => summarizeClaps(clapEvents), [clapEvents]);

  const metronome = useMetronome({
    palo: selectedPalo,
    bpm,
    cueMode
  });

  const handleClap = useCallback(
    (timestampMs: number) => {
      if (metronome.sessionStartMs === null) {
        return;
      }

      setClapEvents((events) => [
        ...events.slice(-31),
        scoreClap(timestampMs, metronome.sessionStartMs!, bpm, selectedPalo)
      ]);
    },
    [bpm, metronome.sessionStartMs, selectedPalo]
  );

  const clapDetector = useClapDetector({
    enabled: clapDetectionEnabled,
    isPracticeRunning: metronome.isPlaying,
    onClap: handleClap
  });

  function selectPalo(paloId: PaloId) {
    const nextPalo = paloById[paloId];
    setSelectedPaloId(paloId);
    setBpm(nextPalo.defaultBpm);
    setClapEvents([]);
    setDemoMode(true);
    setLastSavedMessage("");
    metronome.stop();
  }

  function togglePractice() {
    setLastSavedMessage("");

    if (metronome.isPlaying) {
      metronome.stop();
      return;
    }

    setClapEvents([]);
    metronome.start();
  }

  function watchDemo() {
    setDemoMode(true);
    setLastSavedMessage("");

    if (!metronome.isPlaying) {
      metronome.start();
    }
  }

  function practiceMyClap() {
    setDemoMode(false);
    setClapDetectionEnabled(true);
    setLastSavedMessage("");

    if (!metronome.isPlaying) {
      metronome.start();
    }
  }

  function saveRound() {
    const lesson = currentLesson.paloId === selectedPaloId ? currentLesson : getFallbackLesson(selectedPaloId);
    const score = clapEvents.length > 0 ? summary.stabilityScore : 65;

    completePractice(selectedPaloId, lesson.id, score);
    setLastSavedMessage(`${selectedPalo.name} saved. ${score}% steady.`);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand-mark" aria-hidden="true">
          <Hand size={26} />
        </div>
        <div>
          <h1>Palmas Pace</h1>
          <p>Flamenco clapping at your own pace.</p>
        </div>
        <nav className="nav-tabs">
          <button className={view === "practice" ? "active" : ""} onClick={() => setView("practice")}>
            <Target size={18} />
            <span>
              Practice
              <small>Coach + clapping</small>
            </span>
          </button>
          <button className={view === "library" ? "active" : ""} onClick={() => setView("library")}>
            <Library size={18} />
            <span>
              Library
              <small>Choose a palo</small>
            </span>
          </button>
          <button className={view === "progress" ? "active" : ""} onClick={() => setView("progress")}>
            <Trophy size={18} />
            <span>
              Progress
              <small>Saved rounds</small>
            </span>
          </button>
        </nav>
      </aside>

      {view === "practice" && (
        <PracticeView
          bpm={bpm}
          clapDetectionEnabled={clapDetectionEnabled}
          clapEvents={clapEvents}
          cueMode={cueMode}
          currentLesson={currentLesson}
          demoMode={demoMode}
          lastSavedMessage={lastSavedMessage}
          metronome={metronome}
          micState={clapDetector.permissionState}
          progressByPalo={progressByPalo}
          selectedPalo={selectedPalo}
          summary={summary}
          onBpmChange={setBpm}
          onCueModeChange={setCueMode}
          onPracticeMyClap={practiceMyClap}
          onReset={() => setClapEvents([])}
          onSaveRound={saveRound}
          onSelectPalo={selectPalo}
          onShowProgress={() => setView("progress")}
          onToggleMic={() => setClapDetectionEnabled((enabled) => !enabled)}
          onTogglePractice={togglePractice}
          onWatchDemo={watchDemo}
        />
      )}

      {view === "library" && (
        <LibraryView
          progressByPalo={progressByPalo}
          selectedPaloId={selectedPaloId}
          onSelectPalo={(paloId) => {
            selectPalo(paloId);
            setView("practice");
          }}
        />
      )}

      {view === "progress" && (
        <ProgressView
          currentLesson={currentLesson}
          progressByPalo={progressByPalo}
          summary={summary}
          onPractice={() => setView("practice")}
        />
      )}
    </main>
  );
}

interface PracticeViewProps {
  bpm: number;
  clapDetectionEnabled: boolean;
  clapEvents: ClapEvent[];
  cueMode: CueMode;
  currentLesson: Lesson;
  demoMode: boolean;
  lastSavedMessage: string;
  metronome: ReturnType<typeof useMetronome>;
  micState: "idle" | "listening" | "denied" | "error";
  progressByPalo: Map<PaloId, { unlocked: boolean; bestStabilityScore: number; completedLessons: string[] }>;
  selectedPalo: (typeof palos)[number];
  summary: ScoreSummary;
  onBpmChange: (bpm: number) => void;
  onCueModeChange: (mode: CueMode) => void;
  onPracticeMyClap: () => void;
  onReset: () => void;
  onSaveRound: () => void;
  onSelectPalo: (paloId: PaloId) => void;
  onShowProgress: () => void;
  onToggleMic: () => void;
  onTogglePractice: () => void;
  onWatchDemo: () => void;
}

function PracticeView({
  bpm,
  clapDetectionEnabled,
  clapEvents,
  cueMode,
  currentLesson,
  demoMode,
  lastSavedMessage,
  metronome,
  micState,
  progressByPalo,
  selectedPalo,
  summary,
  onBpmChange,
  onCueModeChange,
  onPracticeMyClap,
  onReset,
  onSaveRound,
  onSelectPalo,
  onShowProgress,
  onToggleMic,
  onTogglePractice,
  onWatchDemo
}: PracticeViewProps) {
  const selectedRecord = progressByPalo.get(selectedPalo.id);
  const savedLessons = selectedRecord?.completedLessons.length ?? 0;

  return (
    <section className="content-grid" aria-label="Practice dashboard">
      <div className="lesson-panel">
        <div className="section-heading">
          <MessageCircle size={20} />
          <span>Coach</span>
        </div>
        <h2>{currentLesson.title}</h2>
        <p>{currentLesson.focus}</p>
        <div className="coach-path">
          <span className="path-step active">Listen</span>
          <span className="path-step">Follow</span>
          <span className="path-step">Try</span>
          <span className="path-step">Review</span>
          <span className="path-step">Save</span>
        </div>
        <ol className="lesson-steps">
          {currentLesson.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="demo-legend">
          <span>
            <i className="legend-hand" aria-hidden="true" />
            Ghost hand = good clap
          </span>
          <span>
            <i className="legend-user" aria-hidden="true" />
            Dot = your clap
          </span>
        </div>
        <div className="coach-note">
          <strong>Where is the coach?</strong>
          <span>
            You are in it now. This panel gives the next steps, and the green feedback strip below the rhythm map
            reacts after you clap.
          </span>
        </div>
      </div>

      <div className="practice-panel">
        <div className="practice-header">
          <div>
            <span className="eyebrow">{selectedPalo.family}-beat family</span>
            <h2>{selectedPalo.name}</h2>
            <p>{selectedPalo.beginnerNote}</p>
          </div>
          <button className="primary-action" onClick={onTogglePractice}>
            {metronome.isPlaying ? <Pause size={20} /> : <Play size={20} />}
            {metronome.isPlaying ? "Pause" : "Start"}
          </button>
        </div>

        <CompasMap
          activeBeat={metronome.beatIndex}
          clapEvents={clapEvents}
          demoMode={demoMode}
          isPlaying={metronome.isPlaying}
          palo={selectedPalo}
        />

        <div className="demo-panel">
          <div>
            <span className="eyebrow">Demo overlay</span>
            <strong>{demoMode ? "Watch the ghost claps land on the beat." : "Your claps are now the main overlay."}</strong>
            <p>
              Big ghost hands show accented claps, small ghost hands show soft claps, and empty beats are rests.
            </p>
          </div>
          <div className="demo-actions">
            <button className={demoMode ? "selected" : ""} onClick={onWatchDemo}>
              <Eye size={18} />
              Watch demo
            </button>
            <button className={!demoMode ? "selected" : ""} onClick={onPracticeMyClap}>
              <Hand size={18} />
              Practice my clap
            </button>
          </div>
        </div>

        <div className="feedback-row" aria-live="polite">
          <MessageCircle size={18} />
          <span>
            <strong>Coach says: </strong>
            {getCoachFeedbackText(demoMode, clapEvents.length > 0 ? summary.message : getCueInstruction(cueMode))}
          </span>
        </div>

        <div className="progress-callout">
          <div>
            <span className="eyebrow">Your progress</span>
            <strong>{selectedRecord?.bestStabilityScore ?? 0}% best saved score</strong>
            <p>
              Press <b>Save round</b> after a practice attempt. Saved rounds update the Progress tab and unlock the
              next palo.
            </p>
          </div>
          <button onClick={onShowProgress}>
            <MapPinned size={18} />
            See progress
          </button>
        </div>

        <div className="controls-grid">
          <label className="control-block">
            <span>
              <Gauge size={17} />
              Tempo {bpm} BPM
            </span>
            <input
              type="range"
              min={selectedPalo.minBpm}
              max={selectedPalo.maxBpm}
              value={bpm}
              onChange={(event) => onBpmChange(Number(event.target.value))}
            />
          </label>

          <label className="control-block">
            <span>
              <TimerReset size={17} />
              Cue mode
            </span>
            <select value={cueMode} onChange={(event) => onCueModeChange(event.target.value as CueMode)}>
              {cueModes.map((mode) => (
                <option key={mode} value={mode}>
                  {cueModeLabels[mode]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="practice-actions">
          <button className={clapDetectionEnabled ? "toggle-on" : ""} onClick={onToggleMic}>
            {clapDetectionEnabled ? <Mic size={18} /> : <MicOff size={18} />}
            {clapDetectionEnabled ? "Mic on" : "Mic off"}
          </button>
          <button onClick={onReset}>
            <RotateCcw size={18} />
            Reset
          </button>
          <button onClick={onSaveRound}>
            <CheckCircle2 size={18} />
            Save round
          </button>
        </div>

        <div className="microcopy">
          <span>{getMicMessage(clapDetectionEnabled, micState)}</span>
          <span>
            {lastSavedMessage ||
              `${savedLessons} saved ${savedLessons === 1 ? "lesson" : "lessons"} for ${selectedPalo.name}`}
          </span>
        </div>
      </div>

      <div className="side-stack">
        <CoachPanel
          cueMode={cueMode}
          demoMode={demoMode}
          events={clapEvents}
          isPlaying={metronome.isPlaying}
          micEnabled={clapDetectionEnabled}
          selectedPaloName={selectedPalo.name}
          summary={summary}
        />
        <PaloPicker progressByPalo={progressByPalo} selectedPaloId={selectedPalo.id} onSelectPalo={onSelectPalo} />
        <ScorePanel summary={summary} events={clapEvents} />
      </div>
    </section>
  );
}

function CoachPanel({
  cueMode,
  demoMode,
  events,
  isPlaying,
  micEnabled,
  selectedPaloName,
  summary
}: {
  cueMode: CueMode;
  demoMode: boolean;
  events: ClapEvent[];
  isPlaying: boolean;
  micEnabled: boolean;
  selectedPaloName: string;
  summary: ScoreSummary;
}) {
  const nextAction = getCoachNextAction(isPlaying, micEnabled, events.length, demoMode);

  return (
    <div className="utility-panel coach-card">
      <div className="section-heading">
        <Sparkles size={20} />
        <span>Live coach</span>
      </div>
      <h3>{nextAction.title}</h3>
      <p>{nextAction.body}</p>
      <div className="coach-status-list">
        <span>
          <b>Palo</b>
          {selectedPaloName}
        </span>
        <span>
          <b>Mode</b>
          {cueModeLabels[cueMode]}
        </span>
        <span>
          <b>Last feedback</b>
          {events.length > 0 ? summary.timingTendency : "waiting"}
        </span>
      </div>
    </div>
  );
}

function CompasMap({
  activeBeat,
  clapEvents,
  demoMode,
  palo,
  isPlaying
}: {
  activeBeat: number;
  clapEvents: ClapEvent[];
  demoMode: boolean;
  palo: (typeof palos)[number];
  isPlaying: boolean;
}) {
  const latestEventByBeat = getLatestEventByBeat(clapEvents);

  return (
    <div className="compas-map" style={{ "--beat-count": palo.cycleLength } as CSSProperties}>
      {palo.pattern.map((symbol, index) => {
        const beatNumber = index + 1;
        const isAccent = palo.accents.includes(beatNumber);
        const isActive = isPlaying && index === activeBeat;
        const isClapTarget = symbol !== ".";
        const userEvent = latestEventByBeat.get(beatNumber);

        return (
          <div
            className={`beat-cell ${isAccent ? "accent" : ""} ${isActive ? "active" : ""} ${
              isClapTarget ? "clap-target" : "rest-target"
            }`}
            key={`${palo.id}-${palo.countLabels[index]}`}
          >
            <span className="beat-label">{palo.countLabels[index]}</span>
            <span className="beat-symbol">{symbol}</span>
            {isClapTarget && (
              <span
                aria-label={isAccent ? "Good accented clap lands here" : "Good soft clap lands here"}
                className={`demo-clap ${isAccent ? "accent-demo" : "soft-demo"} ${
                  demoMode && isActive ? "landing" : ""
                }`}
              >
                <Hand size={isAccent ? 24 : 19} />
              </span>
            )}
            {userEvent && (
              <span className={`user-clap ${userEvent.result}`} title={`Your clap was ${userEvent.result}`}>
                {userEvent.result === "on_time" ? "OK" : userEvent.result === "early" ? "E" : "L"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PaloPicker({
  progressByPalo,
  selectedPaloId,
  onSelectPalo
}: {
  progressByPalo: Map<PaloId, { unlocked: boolean }>;
  selectedPaloId: PaloId;
  onSelectPalo: (paloId: PaloId) => void;
}) {
  return (
    <div className="utility-panel">
      <div className="section-heading">
        <BookOpen size={20} />
        <span>Palos</span>
      </div>
      <div className="palo-list compact">
        {palos.map((palo) => {
          const record = progressByPalo.get(palo.id);
          const disabled = !record?.unlocked;

          return (
            <button
              className={selectedPaloId === palo.id ? "selected" : ""}
              disabled={disabled}
              key={palo.id}
              onClick={() => onSelectPalo(palo.id)}
            >
              <span>{palo.name}</span>
              <small>{disabled ? "Locked" : getPatternNotation(palo)}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScorePanel({ summary, events }: { summary: ScoreSummary; events: ClapEvent[] }) {
  return (
    <div className="utility-panel">
      <div className="section-heading">
        <Target size={20} />
        <span>Review</span>
      </div>
      <div className="score-meter">
        <strong>{events.length > 0 ? `${summary.stabilityScore}%` : "--"}</strong>
        <span>{events.length > 0 ? summary.timingTendency : "Start with full pulse"}</span>
      </div>
      <div className="score-grid">
        <span>On time</span>
        <b>{summary.onTimeCount}</b>
        <span>Early</span>
        <b>{summary.earlyCount}</b>
        <span>Late</span>
        <b>{summary.lateCount}</b>
      </div>
    </div>
  );
}

function LibraryView({
  progressByPalo,
  selectedPaloId,
  onSelectPalo
}: {
  progressByPalo: Map<PaloId, { unlocked: boolean; bestStabilityScore: number }>;
  selectedPaloId: PaloId;
  onSelectPalo: (paloId: PaloId) => void;
}) {
  const groups = [
    { id: "four", title: "Four-beat family" },
    { id: "three", title: "Three-beat family" },
    { id: "twelve", title: "Twelve-beat family" }
  ] as const;

  return (
    <section className="single-column">
      <div className="section-title">
        <h2>Library</h2>
        <p>Palos stay locked until their foundation is steady enough to build on.</p>
      </div>
      {groups.map((group) => (
        <div className="library-band" key={group.id}>
          <h3>{group.title}</h3>
          <div className="library-grid">
            {palos
              .filter((palo) => palo.family === group.id)
              .map((palo) => {
                const record = progressByPalo.get(palo.id);
                const disabled = !record?.unlocked;

                return (
                  <button
                    className={`library-card ${selectedPaloId === palo.id ? "selected" : ""}`}
                    disabled={disabled}
                    key={palo.id}
                    onClick={() => onSelectPalo(palo.id)}
                  >
                    <span className="card-topline">
                      {disabled ? <Circle size={17} /> : <CheckCircle2 size={17} />}
                      {disabled ? "Locked" : `${record?.bestStabilityScore ?? 0}% best`}
                    </span>
                    <strong>{palo.name}</strong>
                    <code>{getPatternNotation(palo)}</code>
                    <p>{palo.beginnerNote}</p>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </section>
  );
}

function ProgressView({
  currentLesson,
  progressByPalo,
  summary,
  onPractice
}: {
  currentLesson: Lesson;
  progressByPalo: Map<PaloId, { unlocked: boolean; bestStabilityScore: number; completedLessons: string[] }>;
  summary: ScoreSummary;
  onPractice: () => void;
}) {
  const unlockedCount = Array.from(progressByPalo.values()).filter((record) => record.unlocked).length;
  const completedCount = Array.from(progressByPalo.values()).reduce(
    (total, record) => total + record.completedLessons.length,
    0
  );

  return (
    <section className="single-column">
      <div className="progress-hero">
        <div>
          <span className="eyebrow">Progress dashboard</span>
          <h2>{currentLesson.title}</h2>
          <p>
            This page shows saved practice rounds. To update it, go back to Practice and press Save round after a try.
            Next up: {currentLesson.focus}
          </p>
        </div>
        <button className="primary-action" onClick={onPractice}>
          <Play size={20} />
          Practice
        </button>
      </div>
      <div className="stats-row">
        <Stat label="Unlocked" value={`${unlockedCount}/${palos.length}`} />
        <Stat label="Lessons saved" value={completedCount.toString()} />
        <Stat label="Timing" value={summary.timingTendency} />
      </div>
      <div className="progress-list">
        <div className="progress-list-header">
          <strong>Saved scores by palo</strong>
          <span>Locked palos open as you save steady rounds.</span>
        </div>
        {palos.map((palo) => {
          const record = progressByPalo.get(palo.id);

          return (
            <div className="progress-item" key={palo.id}>
              <span>{palo.name}</span>
              <div className="progress-bar" aria-label={`${palo.name} progress`}>
                <span style={{ width: `${Math.min(record?.bestStabilityScore ?? 0, 100)}%` }} />
              </div>
              <strong>{record?.unlocked ? `${record.bestStabilityScore}%` : "Locked"}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getFallbackLesson(paloId: PaloId): Lesson {
  return curriculum.find((lesson) => lesson.paloId === paloId) ?? curriculum[0];
}

function getLatestEventByBeat(events: ClapEvent[]): Map<number, ClapEvent> {
  return events.slice(-8).reduce((map, event) => {
    map.set(event.expectedBeat, event);
    return map;
  }, new Map<number, ClapEvent>());
}

function getCoachFeedbackText(demoMode: boolean, fallback: string): string {
  if (demoMode) {
    return "Watch the ghost hand. Clap exactly when it lands inside the highlighted beat box, then press Practice my clap.";
  }

  return fallback;
}

function getCoachNextAction(isPlaying: boolean, micEnabled: boolean, eventCount: number, demoMode: boolean) {
  if (demoMode && !isPlaying) {
    return {
      title: "Watch good clapping first",
      body: "Press Watch demo. The ghost hand will land on each correct clap position."
    };
  }

  if (demoMode) {
    return {
      title: "Copy the ghost hand",
      body: "Big ghost hands are accented claps. Small ghost hands are softer claps. Empty boxes are rests."
    };
  }

  if (!isPlaying) {
    return {
      title: "Start your practice attempt",
      body: "Press Start, then clap where the ghost hands were landing."
    };
  }

  if (!micEnabled) {
    return {
      title: "Turn on the mic for feedback",
      body: "The coach can play the beat now. Turn on Mic if you want early, late, and steady feedback."
    };
  }

  if (eventCount === 0) {
    return {
      title: "Clap gently near the beat",
      body: "The coach is listening. Try a relaxed clap and watch the feedback after it lands."
    };
  }

  return {
    title: "Review, then save",
    body: "Use the feedback to adjust one small thing. Press Save round when you want this attempt added to Progress."
  };
}

function getMicMessage(enabled: boolean, state: "idle" | "listening" | "denied" | "error") {
  if (!enabled) {
    return "Microphone feedback is off.";
  }

  if (state === "listening") {
    return "Listening for claps.";
  }

  if (state === "denied") {
    return "Microphone permission was not granted.";
  }

  return "Microphone starts when practice starts.";
}
