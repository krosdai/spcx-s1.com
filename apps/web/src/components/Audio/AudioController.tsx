"use client";

import { useEffect, useRef } from "react";

import { BGM, SFX, STAGE_1_TTS } from "../../lib/audioManifest";
import { useUIStore } from "../../stores/uiStore";

// Mounts the playback layer once per session. Splits sources into two
// owners so policy stays simple:
//
//   - The BGM `<audio>` is created on mount, paused, and only resumes
//     once the user opts in via the shell toggle AND the page is not
//     under `prefers-reduced-motion: reduce`. It loops indefinitely
//     and survives across stage scrolls.
//   - Per-stage SFX cues fire from IntersectionObservers attached to
//     the matching section id. Each cue is loaded lazily on first
//     intersection and only plays once per session.
//
// The mobile gate (`max-width: 768px`) suppresses SFX entirely so
// shared-context readers don't get sudden bursts; BGM is the floor
// because users opted into "audio on" knowingly.
//
// Files referenced here live under `apps/web/public/audio/` and ride
// alongside the static export. The component renders nothing — it is
// a side-effect orchestrator only.

const MOBILE_QUERY = "(max-width: 768px)";

const isMobileViewport = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_QUERY).matches;
};

const observeStageEnter = (stageId: string, onEnter: () => void): (() => void) => {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    return () => undefined;
  }
  const target = document.getElementById(stageId);
  if (!target) return () => undefined;

  let fired = false;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !fired) {
          fired = true;
          observer.disconnect();
          onEnter();
        }
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(target);
  return () => {
    observer.disconnect();
  };
};

export const AudioController = () => {
  const audioOn = useUIStore((state) => state.audioOn);
  const ttsOn = useUIStore((state) => state.ttsOn);
  const reducedMotion = useUIStore((state) => state.reducedMotion);
  const hasHydrated = useUIStore((state) => state.hasHydrated);

  // BGM owns its own audio element; SFX cues live in a map keyed by
  // node id. We keep the SFX map in a ref so re-renders don't reset
  // playback bookkeeping (each cue plays once per session).
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const ttsRef = useRef<HTMLAudioElement | null>(null);

  // BGM lifecycle: create once, then play/pause based on `audioOn`
  // and the reduced-motion gate. Re-creating the element when the
  // toggle flips would reset playback position and trigger a fresh
  // network fetch — instead we keep it warm and call `.play()` /
  // `.pause()` against the same instance.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!hasHydrated) return undefined;

    if (!bgmRef.current) {
      const el = new Audio();
      el.src = BGM.src;
      el.loop = BGM.loop;
      el.volume = BGM.gain;
      el.preload = "auto";
      bgmRef.current = el;
    }

    const el = bgmRef.current;
    const shouldPlay = audioOn && !reducedMotion;

    if (shouldPlay) {
      // `.play()` may reject if the browser blocks autoplay before a
      // user gesture. Swallow the rejection — the user already opted
      // in by clicking the toggle, so a missed start is a no-op.
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }

    return () => {
      el.pause();
    };
  }, [audioOn, reducedMotion, hasHydrated]);

  // Stage-1 SFX: fires once when Stage 1 scrolls into view, gated on
  // audio being on, not reduced-motion, and not mobile.
  useEffect(() => {
    if (!hasHydrated) return undefined;
    if (!audioOn || reducedMotion) return undefined;
    if (isMobileViewport()) return undefined;

    const cue = SFX["stage1.cold-open"];
    if (!cue) return undefined;
    if (sfxRef.current.has(cue.id)) return undefined;

    const el = new Audio();
    el.src = cue.src;
    el.volume = cue.gain;
    el.preload = "auto";
    sfxRef.current.set(cue.id, el);

    return observeStageEnter("stage-1", () => {
      void el.play().catch(() => undefined);
    });
  }, [audioOn, reducedMotion, hasHydrated]);

  // Optional Stage 1 TTS narration. Independent of the main SFX cue;
  // fires only when the reader has explicitly opted in via the shell.
  // Same mobile / reduced-motion gates apply.
  useEffect(() => {
    if (!hasHydrated) return undefined;
    if (!audioOn || !ttsOn || reducedMotion) return undefined;
    if (isMobileViewport()) return undefined;

    if (!ttsRef.current) {
      const el = new Audio();
      el.src = STAGE_1_TTS.src;
      el.volume = STAGE_1_TTS.gain;
      el.preload = "auto";
      ttsRef.current = el;
    }

    const el = ttsRef.current;
    return observeStageEnter("stage-1", () => {
      void el.play().catch(() => undefined);
    });
  }, [audioOn, ttsOn, reducedMotion, hasHydrated]);

  return null;
};
