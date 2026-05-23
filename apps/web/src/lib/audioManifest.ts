// Single source of truth for the audio files the player loads. Adding
// a new cue means appending an entry here plus committing the file
// under `apps/web/public/audio/`. The manifest does not load anything
// itself; it tells `AudioController.tsx` what to wire up.
//
// Volume policy (from AGENTS.md §3 / PLAN.md §7):
//   - BGM sits ≈ −20 dB below SFX. Multiplying gains directly is
//     easier to read at a glance than `Math.pow(10, -20/20)`, so
//     `BGM_GAIN = 0.1` matches the −20 dB ratio against `SFX_GAIN = 1`.
//   - All SFX cues are kept under 2 s.
//   - Audio is off by default site-wide; the user opts in via the
//     persistent shell toggle.
//   - `prefers-reduced-motion: reduce` forces audio off regardless of
//     the persisted toggle so motion-sensitive readers don't get a
//     surprise BGM track on first visit.
//   - Mobile (`max-width: 768px` floor) plays BGM only — SFX cues are
//     suppressed to avoid bursts of sound on devices typically used
//     in shared / quiet contexts.
//
// The cue ids match StageId so each cinematic stage can fire its own
// transition SFX once it scrolls into view. Stages without a cue
// stay silent.

export const BGM_GAIN = 0.1;
export const SFX_GAIN = 1.0;

export interface BgmEntry {
  id: "ambient-loop";
  src: string;
  loop: true;
  gain: number;
}

export interface SfxEntry {
  id: string;
  src: string;
  gain: number;
}

// Concrete BGM track. The actual file lands under
// `apps/web/public/audio/` and is referenced via its absolute path so
// `<audio>` can load it from the static export at runtime.
export const BGM: BgmEntry = {
  id: "ambient-loop",
  src: "/audio/bgm-ambient-loop.mp3",
  loop: true,
  gain: BGM_GAIN,
};

// Per-stage SFX cues, fired when the stage scrolls into the viewport
// the first time. Each clip is < 2 s and shares a unified gain to keep
// transitions from punching above the BGM bed. `Partial<Record<...>>`
// so a missing key returns `undefined` at lookup, letting callers gate
// on presence without eslint flagging an always-truthy check.
export const SFX: Partial<Record<string, SfxEntry>> = {
  "stage1.cold-open": {
    id: "stage1.cold-open",
    src: "/audio/sfx-stage1-cold-open.mp3",
    gain: SFX_GAIN,
  },
};

// Optional Stage 1 TTS narration. Opt-in only, default OFF, never
// auto-played. The audio file is wired through the same player so
// gain rules and mute state stay consistent. See `AudioController`
// for how the opt-in flag flows from the persisted ui store.
export const STAGE_1_TTS = {
  id: "stage1.tts",
  src: "/audio/tts-stage1-musk-quote.mp3",
  gain: SFX_GAIN,
} as const;
