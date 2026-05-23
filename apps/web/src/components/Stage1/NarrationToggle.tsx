"use client";

import { useEffect, useState } from "react";

import { useUiString } from "../../hooks/useLocalized";
import { useUIStore } from "../../stores/uiStore";

// Contextual TTS opt-in for Stage 1. Lives inline under the Musk
// quote (not in the persistent shell) because the narration is a
// one-stage feature — adding it to the global controls would
// confuse readers on every other stage. Toggling on also flips
// `audioOn` so the AudioController actually plays.
//
// The button is suppressed when `prefers-reduced-motion: reduce`
// is set or when the viewport is below the 768 px mobile floor,
// matching the AudioController gates. Without this the button would
// appear functional but the click would no-op.

const MOBILE_QUERY = "(max-width: 768px)";

const useTtsAvailable = (): boolean => {
  const reducedMotion = useUIStore((state) => state.reducedMotion);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (typeof window.matchMedia !== "function") return undefined;

    const media = window.matchMedia(MOBILE_QUERY);
    setIsMobile(media.matches);
    const update = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

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

  return !reducedMotion && !isMobile;
};

export const NarrationToggle = () => {
  const audioOn = useUIStore((state) => state.audioOn);
  const ttsOn = useUIStore((state) => state.ttsOn);
  const toggleAudio = useUIStore((state) => state.toggleAudio);
  const toggleTts = useUIStore((state) => state.toggleTts);
  const hasHydrated = useUIStore((state) => state.hasHydrated);
  const available = useTtsAvailable();

  const playLabel = useUiString("stage1.narration.play");
  const stopLabel = useUiString("stage1.narration.stop");

  // Defer rendering until hydration to avoid a flash of the wrong
  // state when the persisted `ttsOn` flips from default-false to the
  // stored value after rehydration.
  if (!hasHydrated || !available) return null;

  const handleToggle = () => {
    if (ttsOn) {
      toggleTts();
      return;
    }
    // Turning narration on requires audio on too. Flip both in the
    // same gesture so the AudioController effect picks the change
    // up on its next run.
    if (!audioOn) {
      toggleAudio();
    }
    toggleTts();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={ttsOn}
      className="mt-6 inline-flex items-center gap-2 border border-white/20 px-4 py-2 font-telemetry text-[11px] uppercase tracking-[0.18em] text-muted-white transition-colors hover:border-accent-teal hover:text-body-white"
    >
      <span aria-hidden="true">{ttsOn ? "■" : "▶"}</span>
      <span>{ttsOn ? stopLabel : playLabel}</span>
    </button>
  );
};
