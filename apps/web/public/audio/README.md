# Audio assets

The playback layer in `apps/web/src/components/Audio/AudioController.tsx`
expects these files. Each is ElevenLabs-generated, all original, and
committed alongside the rest of the static export per AGENTS.md §3.
Volume policy from PLAN.md §7:

- Audio off by default site-wide; opt-in via the persistent shell toggle.
- BGM ≈ −20 dB below SFX. The manifest uses `BGM_GAIN = 0.1` against
  `SFX_GAIN = 1.0` to land in that ratio.
- All SFX cues < 2 s.
- Mobile (≤ 768 px) plays BGM only.
- `prefers-reduced-motion: reduce` forces all audio off, regardless of
  the persisted toggle.

## Expected files

| File                        | Purpose                               | Length |
| --------------------------- | ------------------------------------- | ------ |
| `bgm-ambient-loop.mp3`      | Global ambient BGM, seamless loop     | ~3 min |
| `sfx-stage1-cold-open.mp3`  | Stage 1 launch-moment cue             | < 2 s  |
| `tts-stage1-musk-quote.mp3` | Optional Stage 1 Musk-quote narration | ~30 s  |

Until each file lands, the corresponding cue is silently ignored at
runtime — the `<audio>` element's `play()` promise rejects on a 404
and `AudioController` swallows that rejection. Adding a file is
therefore a content drop with no code change: place the file in this
directory using the exact name above and the next build picks it up.

## Generating audio

The PLAN.md §7 spec calls for ElevenLabs-generated audio only. The
generator commands run outside this repo via the ElevenLabs MCP
(`mcp__ElevenLabs_Player__generate_music`, `generate_sound_effect`,
`generate_tts`). Save the returned audio to this directory using the
filenames above, then verify locally:

```sh
pnpm --filter web dev
# open http://localhost:3000/, toggle audio on, scroll to Stage 1
```
