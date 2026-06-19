import { useEffect, useRef, useState } from "react";
import type { CueMode, PaloPattern } from "../types";
import { getBeatDurationMs } from "../lib/metronome";
import { shouldPlayCue } from "../lib/cueModes";

interface UseMetronomeOptions {
  palo: PaloPattern;
  bpm: number;
  cueMode: CueMode;
}

export function useMetronome({ palo, bpm, cueMode }: UseMetronomeOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [sessionStartMs, setSessionStartMs] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const nextTickAtRef = useRef(0);
  const absoluteBeatRef = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    stopClock();
    const context = getAudioContext();
    const nowMs = performance.now();
    nextTickAtRef.current = context.currentTime + 0.05;
    absoluteBeatRef.current = 0;
    setSessionStartMs(nowMs);
    setBeatIndex(0);
    setCycleIndex(0);

    timerRef.current = window.setInterval(() => {
      const beatDurationMs = getBeatDurationMs(bpm);
      const scheduleAheadSeconds = 0.12;

      while (nextTickAtRef.current < context.currentTime + scheduleAheadSeconds) {
        const absoluteBeat = absoluteBeatRef.current;
        const nextBeatIndex = absoluteBeat % palo.cycleLength;
        const nextCycleIndex = Math.floor(absoluteBeat / palo.cycleLength);
        const beatNumber = nextBeatIndex + 1;
        const isAccent = palo.accents.includes(beatNumber);
        const cue = shouldPlayCue(cueMode, palo, nextBeatIndex, nextCycleIndex);

        if (cue) {
          playClick(context, nextTickAtRef.current, isAccent);
        }

        window.setTimeout(() => {
          setBeatIndex(nextBeatIndex);
          setCycleIndex(nextCycleIndex);
        }, Math.max(0, (nextTickAtRef.current - context.currentTime) * 1000));

        nextTickAtRef.current += beatDurationMs / 1000;
        absoluteBeatRef.current += 1;
      }
    }, 25);

    return stopClock;
  }, [bpm, cueMode, isPlaying, palo]);

  function start() {
    setIsPlaying(true);
  }

  function stop() {
    setIsPlaying(false);
    stopClock();
    setBeatIndex(0);
    setCycleIndex(0);
    setSessionStartMs(null);
  }

  function stopClock() {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function getAudioContext() {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }

  return {
    isPlaying,
    beatIndex,
    cycleIndex,
    sessionStartMs,
    start,
    stop
  };
}

function playClick(context: AudioContext, time: number, isAccent: boolean) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(isAccent ? 980 : 620, time);
  gain.gain.setValueAtTime(isAccent ? 0.16 : 0.08, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(time);
  oscillator.stop(time + 0.06);
}
