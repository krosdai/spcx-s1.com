# Voice and visual language

The site lives or dies by restraint. The voice is steady, declarative,
borrowed almost entirely from the S-1 itself. The visuals are
near-black, lots of negative space, single accent. The sci-fi feel
comes from motion, pacing, and information density — not from effects.

If you find yourself reaching for a gradient, a glow, neon, or
decorative particles, stop. PLAN.md §3.4 is clear: those are off-limits.

## Voice rules

Default voice across the site is **first-person SpaceX**: "we / our /
us." Three explicitly named exceptions:

1. **Stage 0 modal** — third-person, by the site authors. It exists to
   make clear this is a fan project and to set up the conceit. Speak
   with the reader, not as SpaceX.
2. **The single direct Musk quote at l.577–580** (repeated at l.6028).
   Retain attribution and quotation marks: `"…" — Elon Musk`. Do not
   absorb it into the SpaceX voice. There is exactly one such quote in
   the filing.
3. **Stage 10 credits** — third-person again. Authorship line, MIT
   license blurb, contact, GitHub link.

Allowed edits to S-1 text to maintain first-person voice:

- `"the Company"` → `"we"`
- `"SpaceX"` → `"we"` (only when needed; preserve "SpaceX" when it
  reads naturally, like in a section heading or a name-the-product
  context)
- Light whitespace normalization

Any other edit makes the node **non-verbatim**, which means you MUST
store the unedited S-1 text in `originalText` so the source toggle can
show it. See [`content-pipeline.md`](./content-pipeline.md) for the
schema.

### Verbatim sections (cannot be edited)

These S-1 passages are reproduced exactly:

- **Use of Proceeds** — `sources/...:3575–3601`
- **Dividend Policy** — `sources/...:3603–3617`
- **Forward-Looking Statements caveat** — `sources/...:3502–3573`
- **Commercial-viability caveat** surfaced in Stages 5 and 9 —
  `sources/...:1086–1118`
- **The Musk quote** — `sources/...:577–580`
- **The closing line of Stage 9** — `sources/...:626`

These nodes have `verbatim: true` and one of the tags
`['verbatim-required', 'musk-quote', 'caveat:commercial-viability']`.
The validator enforces verbatim equality with whitespace
normalization.

### Multilingual rules (full text in PLAN.md §5)

- English locale: pure English, S-1 voice as-is.
- Chinese (and any future non-English): prose translated, **proper
  nouns stay in English** — SpaceX, Falcon 9, Falcon Heavy, Dragon,
  Starship, Starlink, Starshield, COLOSSUS, COLOSSUS II, Grok, xAI, X,
  Macrohard, Terafab, NASA, FCC, FAA, EchoStar, Cursor, Anthropic,
  Tesla, Texas Business Court, Nasdaq, Nasdaq Texas, Kardashev Type
  II, etc.
- The Musk quote stays in English in the Chinese locale with a
  Chinese translation beneath it (don't replace the original).
- Verbatim S-1 quotes in financial / governance / risk sections
  similarly keep the English original and add a Chinese summary or
  translation below.
- `<html lang>` updates on toggle. Toggle state persists.

## Visual language

### Palette

Background: near-black. Body type: white. Single accent for emphasis
and interactive states.

The **chart palette** matches the existing financial PDF
(`~/Library/CloudStorage/Dropbox-Personal/@xdanger/kb/spacex_s1_2026_financial_analysis.pdf`)
so deliverables stay consistent:

| Token            | Hex       | Use                                         |
| ---------------- | --------- | ------------------------------------------- |
| `--accent-teal`  | `#1D9E75` | Stage 6 primary (revenue), positive signals |
| `--accent-blue`  | `#378ADD` | Stage 6 secondary (operating), neutral data |
| `--accent-coral` | `#D85A30` | Stage 7 (risk), negative signals            |
| `--accent-green` | `#639922` | Stage 6 tertiary (growth), highlights       |
| `--accent-amber` | `#BA7517` | Stage 6 quaternary (segment), warnings      |

Use one accent per stage where possible. Mixing all five is reserved
for the Stage 6 chart layer.

### Typography

- **Display** (headings, large numbers, T-minus): Inter, geometric sans,
  tight tracking on large sizes, generous tracking on small caps.
- **Telemetry** (T-minus countdown, source line refs, KPI digits when
  count-ups are running): JetBrains Mono, tabular figures.
- **Body**: Inter, generous line-height (1.5–1.65 on the body), normal
  tracking.

Fonts self-hosted via `@fontsource/inter` and
`@fontsource/jetbrains-mono`. No Google Fonts CDN, no Adobe Fonts.

### Spacing & rhythm

- Negative space is the design. Body copy lives in a column < 70 ch.
- Stage transitions are vertical and respect scroll velocity. No
  horizontal scrolls.
- Source toggle annotations sit in a parallel rail to the right of the
  body copy on desktop; below the body copy on mobile.

### Motion

- Camera moves, type-on, count-ups, parallax: all gated behind a
  shared `useReducedMotion()` hook.
- `prefers-reduced-motion: reduce` → all motion disabled. Content
  remains complete.
- All motion easings are S-curves (ease-in-out variants). No bounces,
  no overshoots.

### References worth studying

- **spacex.com** — dark, minimal, video-led; the brand's own taste
- **Falcon launch telemetry overlays** — mono digits, T-minus, status
  pills, the look we're aiming for in the persistent shell
- **Apple product pages** — scroll-driven camera moves, content reveal
  pacing
- **NYT longform interactives** ("Snow Fall" era) — scroll-locked
  visuals + prose
- **Linear.app** — typography rhythm, restraint

## Audio (Phase 5; off by default)

Specified in detail in PLAN.md §7. Short version:

- One ~3-minute ambient BGM loop, low-frequency drone + sparse high
  overtones. References: Hans Zimmer's Interstellar quiet parts, Stars
  of the Lid, Brian Eno's Apollo.
- Stage SFX: starfield swell, typewriter clicks on the Musk quote,
  soft sub-bass thump on stage transitions, ticks on KPI
  order-of-magnitude crossings, caution-tone on risk expand, warm
  major-chord swell on the Stage 9 closing line.
- All cues short (< 2s). BGM ≈ −20 dB below SFX.
- Optional Stage 1 TTS narration (opt-in; default OFF even when audio
  is on). A neutral, deep-male English voice — NOT a Musk impersonation
  (legally risky and ethically wrong).
- All audio generated with ElevenLabs, committed to repo under
  `apps/web/public/audio/`. No licensed third-party music or SFX.
- Mobile defaults to BGM only (no SFX) when audio is on.
- `prefers-reduced-motion: reduce` → audio also defaults to muted.
