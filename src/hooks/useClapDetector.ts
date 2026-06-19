import { useEffect, useRef, useState } from "react";

type ClapHandler = (timestampMs: number) => void;

interface UseClapDetectorOptions {
  enabled: boolean;
  isPracticeRunning: boolean;
  onClap: ClapHandler;
}

export function useClapDetector({ enabled, isPracticeRunning, onClap }: UseClapDetectorOptions) {
  const [permissionState, setPermissionState] = useState<"idle" | "listening" | "denied" | "error">("idle");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastClapAtRef = useRef(0);
  const noiseFloorRef = useRef(0.02);
  const previousEnergyRef = useRef(0);
  const onClapRef = useRef(onClap);

  useEffect(() => {
    onClapRef.current = onClap;
  }, [onClap]);

  useEffect(() => {
    if (!enabled || !isPracticeRunning) {
      stopListening();
      return;
    }

    let cancelled = false;

    async function startListening() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: false
          }
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.15;
        source.connect(analyser);

        streamRef.current = stream;
        audioContextRef.current = context;
        analyserRef.current = analyser;
        setPermissionState("listening");
        analyze();
      } catch {
        setPermissionState("denied");
      }
    }

    void startListening();

    return () => {
      cancelled = true;
      stopListening();
    };
  }, [enabled, isPracticeRunning]);

  function analyze() {
    const analyser = analyserRef.current;

    if (!analyser) {
      return;
    }

    const samples = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(samples);

    let sum = 0;
    for (const sample of samples) {
      const centered = (sample - 128) / 128;
      sum += centered * centered;
    }

    const rms = Math.sqrt(sum / samples.length);
    const noiseFloor = noiseFloorRef.current * 0.98 + rms * 0.02;
    const energyJump = rms - previousEnergyRef.current;
    const now = performance.now();
    const isTransient = rms > Math.max(0.08, noiseFloor * 3.8) && energyJump > 0.035;
    const outsideRefractoryWindow = now - lastClapAtRef.current > 140;

    if (isTransient && outsideRefractoryWindow) {
      lastClapAtRef.current = now;
      onClapRef.current(now);
    }

    noiseFloorRef.current = noiseFloor;
    previousEnergyRef.current = rms;
    animationRef.current = window.requestAnimationFrame(analyze);
  }

  function stopListening() {
    if (animationRef.current !== null) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    void audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;

    if (permissionState === "listening") {
      setPermissionState("idle");
    }
  }

  return {
    permissionState
  };
}
