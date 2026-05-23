"use client";

import { create, type StoreApi } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Locale = "en" | "zh";

interface UIState {
  locale: Locale;
  audioOn: boolean;
  // Stage 1 TTS narration of the Musk quote. Off by default; persists
  // its own bit so a reader who explicitly opts in keeps it on between
  // visits. The audio toggle (`audioOn`) is the master gate — TTS only
  // plays when both are on.
  ttsOn: boolean;
  sourceVisible: boolean;
  modalOpen: boolean;
  modalDismissed: boolean;
  chapterIndexOpen: boolean;
  reducedMotion: boolean;
  scrollProgress: number;
  hasHydrated: boolean;
  setLocale: (locale: Locale) => void;
  toggleAudio: () => void;
  toggleTts: () => void;
  toggleSource: () => void;
  openModal: () => void;
  dismissModal: () => void;
  toggleChapterIndex: () => void;
  setChapterIndexOpen: (open: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setScrollProgress: (progress: number) => void;
  hydrateReducedMotion: () => () => void;
}

// Capture the store API during initialization so `onRehydrateStorage`
// can publish state without referencing `useUIStore` directly. With
// synchronous `localStorage`, persist's `hydrate()` runs inside
// `create(...)` before the exported `const useUIStore = ...` binding
// completes, so touching `useUIStore` from the rehydration callback
// would throw `ReferenceError: Cannot access 'useUIStore' before
// initialization`. The initializer (which receives `api`) runs first,
// so capturing it here is safe.
let storeApi: StoreApi<UIState> | undefined;

export const useUIStore = create<UIState>()(
  persist(
    (set, _get, api) => {
      storeApi = api;
      return {
        locale: "en",
        audioOn: false,
        ttsOn: false,
        sourceVisible: false,
        // Default modalOpen to false. After rehydration completes,
        // `onRehydrateStorage` flips it to true for first-time visitors
        // (no persisted `modalDismissed`). Returning visitors who have
        // dismissed see no modal flash because we never render it open
        // pre-hydration.
        modalOpen: false,
        modalDismissed: false,
        chapterIndexOpen: false,
        reducedMotion: false,
        scrollProgress: 0,
        hasHydrated: false,
        setLocale: (locale) => set({ locale }),
        toggleAudio: () => set((state) => ({ audioOn: !state.audioOn })),
        toggleTts: () => set((state) => ({ ttsOn: !state.ttsOn })),
        toggleSource: () => set((state) => ({ sourceVisible: !state.sourceVisible })),
        openModal: () => set({ modalOpen: true }),
        dismissModal: () => set({ modalOpen: false, modalDismissed: true }),
        toggleChapterIndex: () =>
          set((state) => ({ chapterIndexOpen: !state.chapterIndexOpen })),
        setChapterIndexOpen: (open) => set({ chapterIndexOpen: open }),
        setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
        setScrollProgress: (progress) =>
          set({ scrollProgress: Math.min(1, Math.max(0, progress)) }),
        hydrateReducedMotion: () => {
          if (typeof window === "undefined") {
            return () => undefined;
          }

          const media = window.matchMedia("(prefers-reduced-motion: reduce)");
          const update = () => set({ reducedMotion: media.matches });
          update();
          media.addEventListener("change", update);

          return () => {
            media.removeEventListener("change", update);
          };
        },
      };
    },
    {
      name: "spcx-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        audioOn: state.audioOn,
        ttsOn: state.ttsOn,
        sourceVisible: state.sourceVisible,
        modalDismissed: state.modalDismissed,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state || !storeApi) return;
        // Important: mutating the rehydrated `state` object directly does
        // not publish to subscribers — Zustand's `set` already fired. Call
        // `setState` via the captured store API so React components
        // observing `hasHydrated` and `modalOpen` re-render. Using the
        // captured `storeApi` instead of `useUIStore` avoids a TDZ
        // ReferenceError because this callback can fire synchronously
        // inside `create(...)` before the `useUIStore` const is bound.
        // First-time visitor (no persisted dismissal) → show the modal
        // now that we've safely hydrated; returning dismissed visitor →
        // modal stays closed.
        storeApi.setState({
          hasHydrated: true,
          modalOpen: !state.modalDismissed,
        });
      },
    },
  ),
);
