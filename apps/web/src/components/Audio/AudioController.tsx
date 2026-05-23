"use client";

import { useEffect, useRef, useState } from "react";

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
//     the matching section id. Each cue only plays once per session
//     (tracked by a separate "played" set, distinct from the cache of
//     `<audio>` elements so re-enabling audio after a brief opt-out
//     re-arms the observer instead of being silently skipped).
//
// The mobile gate (`max-width: 768px`) suppresses SFX entirely so
// shared-context readers don't get sudden bursts; BGM is the floor
// because users opted into "audio on" knowingly. The gate is tracked
// reactively via matchMedia so a viewport resize or rotation flips
// behavior without waiting for the next store change.
//
// Files referenced here live under `apps/web/public/audio/` and ride
// alongside the static export. The component renders nothing — it is
// a side-effect orchestrator only.

const MOBILE_QUERY = "(max-width: 768px)";

const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (typeof window.matchMedia !== "function") return undefined;

    const media = window.matchMedia(MOBILE_QUERY);
    setIsMobile(media.matches);

    const update = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Modern browsers expose `addEventListener` on `MediaQueryList`;
    // older Safari / iOS Safari only ship the legacy `addListener` /
    // `removeListener` pair. Try the modern API first and fall back so
    // the component doesn't throw on `AudioController` mount in those
    // environments before the reader even toggles audio.
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => {
        media.removeEventListener("change", update);
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    media.addListener(update);
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      media.removeListener(update);
    };
  }, []);

  return isMobile;
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
  const isMobile = useIsMobile();

  // BGM owns its own audio element so re-renders don't reset playback
  // position. SFX cache lives in a ref keyed by cue id — distinct
  // from `sfxPlayedRef`, which tracks "this cue has fired in this
  // session" so a brief audio toggle off/on doesn't permanently
  // silence the cue.
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const sfxPlayedRef = useRef<Set<string>>(new Set());
  const ttsRef = useRef<HTMLAudioElement | null>(null);
  const ttsPlayedRef = useRef(false);

  // BGM lifecycle: lazy-create on first opt-in, then play/pause
  // against the same instance so toggling doesn't reset playback
  // position. The lazy-create matters because audio is off by default
  // site-wide (AGENTS.md §3) — eagerly constructing the element with
  // `preload="auto"` would silently download the ~3-minute MP3 for
  // every first-time visitor who never asked for audio. We also
  // re-read `prefers-reduced-motion` directly from `matchMedia` here
  // instead of trusting the store's `reducedMotion` flag, because the
  // store starts at `false` and only flips after `hydrateReducedMotion`
  // runs — a one-render race where a reduced-motion user with audio
  // already persisted on could briefly hear BGM start.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!hasHydrated) return undefined;

    const reducedMotionNow =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : reducedMotion;

    const shouldPlay = audioOn && !reducedMotionNow;

    if (!shouldPlay) {
      // Don't even allocate the element; if we previously did, pause it.
      bgmRef.current?.pause();
      return undefined;
    }

    if (!bgmRef.current) {
      const el = new Audio();
      el.src = BGM.src;
      el.loop = BGM.loop;
      el.volume = BGM.gain;
      el.preload = "auto";
      bgmRef.current = el;
    }

    const el = bgmRef.current;

    // `.play()` may reject if the browser blocks autoplay before a
    // user gesture. The common case: a returning visitor with
    // `audioOn` persisted true lands fresh on the page, the effect
    // runs immediately, but the browser hasn't recorded a gesture
    // for this document yet so playback is denied. Wire one-shot
    // pointer-down / key-down listeners that retry on the next
    // interaction so the visible "audio on" state actually matches
    // what the reader hears. Re-arms on continued failure because
    // not every `pointerdown` / `keydown` produces a user activation
    // token (modifier keys alone, IME composition, right-click in
    // Chrome). Only stops on successful playback or effect re-run.
    let cancelled = false;
    let retryListener: (() => void) | null = null;

    const detachRetry = () => {
      if (!retryListener) return;
      document.removeEventListener("pointerdown", retryListener);
      document.removeEventListener("keydown", retryListener);
      retryListener = null;
    };

    const attachRetry = () => {
      if (cancelled || retryListener) return;
      const handler = () => {
        if (cancelled) return;
        detachRetry();
        void el.play().catch(() => {
          // The triggering event didn't produce a user activation
          // token (e.g. a Shift / Ctrl keydown alone). Re-arm so the
          // next interaction gets another chance.
          if (!cancelled) attachRetry();
        });
      };
      retryListener = handler;
      document.addEventListener("pointerdown", handler);
      document.addEventListener("keydown", handler);
    };

    void el.play().catch(() => {
      attachRetry();
    });

    return () => {
      cancelled = true;
      detachRetry();
      el.pause();
    };
  }, [audioOn, reducedMotion, hasHydrated]);

  // Stage-1 SFX: fires once per session when Stage 1 scrolls into
  // view, gated on audio being on, not reduced-motion, and not
  // mobile. Important: the observer attaches every time the gates
  // flip on — opting out then back in re-arms the observer without
  // losing the cue (only `sfxPlayedRef` is the permanent latch).
  useEffect(() => {
    if (!hasHydrated) return undefined;
    if (!audioOn || reducedMotion || isMobile) return undefined;

    const cue = SFX["stage1.cold-open"];
    if (!cue) return undefined;
    if (sfxPlayedRef.current.has(cue.id)) return undefined;

    let el = sfxRef.current.get(cue.id);
    if (!el) {
      el = new Audio();
      el.src = cue.src;
      el.volume = cue.gain;
      el.preload = "auto";
      sfxRef.current.set(cue.id, el);
    }

    const audioEl = el;

    // Same autoplay retry pattern as the BGM effect: if Stage 1
    // intersects before the first user gesture, `play()` rejects
    // and the observer disconnects (one-shot). Without a retry the
    // chime is lost for the rest of the session for a returning
    // visitor with `audioOn` persisted true. So on rejection we
    // attach one-shot `pointerdown` / `keydown` listeners that fire
    // the cue on the next interaction.
    let retryListener: (() => void) | null = null;
    let cancelled = false;
    const attemptPlay = () => {
      if (cancelled) return;
      void audioEl
        .play()
        .then(() => {
          sfxPlayedRef.current.add(cue.id);
        })
        .catch(() => {
          if (cancelled || retryListener) return;
          const handler = () => {
            if (cancelled) return;
            retryListener = null;
            document.removeEventListener("pointerdown", handler);
            document.removeEventListener("keydown", handler);
            attemptPlay();
          };
          retryListener = handler;
          document.addEventListener("pointerdown", handler, { once: true });
          document.addEventListener("keydown", handler, { once: true });
        });
    };

    const cleanupObserver = observeStageEnter("stage-1", attemptPlay);
    return () => {
      cancelled = true;
      cleanupObserver();
      if (retryListener) {
        document.removeEventListener("pointerdown", retryListener);
        document.removeEventListener("keydown", retryListener);
      }
    };
  }, [audioOn, reducedMotion, isMobile, hasHydrated]);

  // Optional Stage 1 TTS narration. Independent of the main SFX cue;
  // fires only when the reader has explicitly opted in via the shell.
  // Same mobile / reduced-motion gates apply. The cleanup pauses the
  // element (not just the observer) so toggling `audioOn`, `ttsOn`,
  // or reduced-motion mid-playback actually stops the audio.
  useEffect(() => {
    if (!hasHydrated) return undefined;
    if (!audioOn || !ttsOn || reducedMotion || isMobile) return undefined;
    if (ttsPlayedRef.current) return undefined;

    if (!ttsRef.current) {
      const el = new Audio();
      el.src = STAGE_1_TTS.src;
      el.volume = STAGE_1_TTS.gain;
      el.preload = "auto";
      ttsRef.current = el;
    }

    const el = ttsRef.current;
    const cleanupObserver = observeStageEnter("stage-1", () => {
      // Same latch-on-success rule as the SFX cue above — a 404 on
      // the not-yet-shipped TTS file shouldn't burn the one-shot for
      // a future visit where the file exists.
      void el
        .play()
        .then(() => {
          ttsPlayedRef.current = true;
        })
        .catch(() => undefined);
    });

    return () => {
      cleanupObserver();
      el.pause();
    };
  }, [audioOn, ttsOn, reducedMotion, isMobile, hasHydrated]);

  return null;
};
