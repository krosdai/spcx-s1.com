# Phases

Five phases. Each phase ends with a deployable preview and a Kros
review checkpoint. Do not start Phase N+1 until Phase N is reviewed
and merged.

If time gets tight, **Phase 2 is the minimum viable site** — readable,
complete, and honest, even without 3D and audio polish.

---

## Phase 1 — Skeleton + content extraction

**Status:** done (2026-05-21). Awaiting Kros's review on PR #1.

Deliverables:

- [x] Workspace scaffolding (pnpm), MIT LICENSE
- [x] S-1 source file copied into `sources/` with SHA-256 captured
- [x] Agent-facing documentation (CLAUDE.md, AGENTS.md, docs/)
- [x] `packages/content/` — Zod schema, validator, Vitest suite
- [x] S-1 content extracted into stage files for **all 11 stages**
      (English required; Chinese stub allowed)
- [x] Validator wired into `pnpm -r build`
- [x] `apps/web/` — Next.js 15 + Tailwind v4 + Zustand
- [x] Persistent UI shell: T-minus bar, chapter index, source toggle,
      language toggle, audio toggle, `[ⓘ]` modal reopen — all wired to
      global Zustand state
- [x] Stage 0 modal (authored disclaimer, third-person)
- [x] Stage 10 (end credits, full glossary with search, verbatim
      Forward-Looking caveat)
- [x] Cloudflare Pages preview URL live
      (https://0c5fc859.spcx-s1.pages.dev, branch alias
      https://xdanger-claude-musing-gagari.spcx-s1.pages.dev)
- [x] Short summary in chat: stack chosen, repo path on disk, how to
      run locally, what's queued for Phase 2 (covered in the Phase 1
      PR thread; Phase 2 deliverables enumerated below)

**Out of scope for Phase 1:** Stages 1, 2, 3, 4, 5, 6, 7, 8, 9
rendering (Phase 2 + Phase 3); multilingual UI translation; share
cards; audio files; 3D. The data layer extracted in Phase 1 must
support all of them.

---

## Phase 2 — All static stages

**Status:** done (2026-05-21). Awaiting Kros's review.

Deliverables:

- [x] Stage 2 — Who We Are: KPI strip with scroll-triggered count-ups
      (mass to orbit / orbital launches / Starlink subscribers), founding
      prose, and the milestone timeline 2008-2026.
- [x] Stage 3 — The Three Pillars: Space, Connectivity, AI rendered as
      stacked sections; each pillar parses its bullet list into sub-product
      cards (Falcon 9, Dragon, Starlink Consumer/Enterprise/Government/
      Mobile, COLOSSUS, Grok, Macrohard) with an expandable business-detail
      `<details>` for the deep prose.
- [x] Stage 4 — The Algorithm: the seven-point Repeatable Business Model
      list plus the pulled-out five-step Algorithm quote at l.906.
- [x] Stage 6 — The Numbers: six new KPI nodes (Revenue 2023/2024/2025 +
      Net income (loss) 2023/2024/2025) with finance-convention rendering
      `$10,387` / `($4,937)`, verbatim Use of Proceeds and Dividend
      Policy callouts in amber, and four collapsible deep tables
      (Summary, MD&A, Capitalization, Segment 2025).
- [x] Stage 7 — The Anomaly Log: six highlighted disclosures pinned, full
      taxonomy by category (mission / operational / regulatory / financial
      / governance / sector-ai), each risk card expandable to its verbatim
      S-1 paragraph; commercial-viability caveat cross-linked at the
      bottom with `caveat:commercial-viability` tag.
- [x] Stage 8 — Who Steers the Ship: founder & controlled-company status,
      dual-class share structure, Texas reincorporation & forum, Musk
      dependency risk factor, related-party transactions (summary +
      financial-statement notes).
- [x] Shared `StageSection` wrapper + `textHelpers` lib (`parseList`,
      `cleanProse`, `parseNumericValue`, `formatNumericValue`) covering
      all six stages.
- [x] Stage 1 / 5 / 9 still render the Phase-3 placeholder.
- [x] Source toggle annotates every Phase 2 content block via
      `SourceRef`.
- [x] `pnpm -r build`, `pnpm lint`, `pnpm --filter @spcx/content test`
      all green; static export still ~106 kB first-load JS on `/`.

Note: Chart.js was deferred. Stage 6 ships with a KPI grid that
captures the headline trajectory but no rendered bar/line charts yet;
this can be picked up in a focused follow-up without touching the
content layer.

Review checkpoint at end of Phase 2 recommended (PLAN.md §11).

---

## Phase 3 — Cinematic stages

**Status:** done (2026-05-21). Awaiting Kros's review.

Deliverables:

- [x] Stage 1 — Cold Open: black-screen reveal, scroll-triggered
      typewriter of the Musk quote at l.577–580, sparse R3F starfield
      (sphere-shell distribution, slow drift) gated on WebGL +
      `min-width: 768px` + `prefers-reduced-motion: no-preference`.
- [x] Stage 5 — Roadmap: Why-now framing, four-category Growth
      Strategies grid (Space / Connectivity / AI / Future Markets)
      parsed from l.1049–1072, dedicated Future Markets cards with
      descriptions from l.7938–7962, collapsible Business detail
      (l.7635–7932), pinned commercial-viability caveat. Cinematic:
      R3F forward-drift starfield as a sticky backdrop while the
      reader scrolls through the section.
- [x] Stage 9 — The Horizon: Kardashev II framing (l.715–758), Future
      Markets summary, Lunar economy block (l.7666–7708), pinned
      verbatim commercial-viability caveat, scroll-triggered typewriter
      of the closing line at l.626 as the final beat before End
      Credits. Cinematic: R3F low-poly wireframe Earth on a sparse
      starfield, sticky-positioned through the section.
- [x] Shared `useCanCinematic()` hook: WebGL detect + 768 px floor +
      reduced-motion gate. Each 3D scene is dynamic-imported via
      `next/dynamic({ ssr: false })` so the static export bundle stays
      lean (~109 kB first-load JS on `/`).
- [x] Reduced-motion path: every cinematic backdrop returns `null`
      and every typewriter renders the full text immediately when
      `prefers-reduced-motion: reduce` is set.
- [x] Mobile fallback: cinematic backdrops disabled below 768 px so
      mobile users still get the full content with no GPU overhead.
- [x] Content fix: `stage5.roadmap.why-now` line range tightened from
      `l.700–758` to `l.715–758` so the "Why This Matters Now" prose
      no longer pulls in the preceding AI-segment / capex bullets.
- [x] `pnpm -r build`, `pnpm lint`, `pnpm --filter @spcx/content test`
      all green.

Note: cross-stage motion polish (KPI count-up easing, etc.) was left
to a focused follow-up. Phase 3's motion additions all use
`useReducedMotion` and stay close to the existing palette/restraint
rules.

---

## Phase 4 — Multilingual + a11y + SEO + share cards

**Status:** in progress. Delivered in three PRs.

### Phase 4 — PR A: infrastructure (this branch)

- [x] Chinese translation registry at
      `packages/content/src/translations/zh.ts` — keyed by node id,
      one canonical translation per node, looked up by the existing
      `sourceNode` / `authoredNode` factories. Initially empty.
- [x] Validator rule 12 wired to `--phase=4` flag. Run with
      `pnpm --filter @spcx/content validate:phase4`. Build default
      stays at phase 1 until the registry is populated.
- [x] Coverage audit: `pnpm --filter @spcx/content audit-zh`
      (`--quiet` for tally only) lists every missing translation
      grouped by stage and exits non-zero while gaps remain.
- [x] Locale-aware rendering helper at `apps/web/src/lib/localized.ts`
      and `apps/web/src/hooks/useLocalized.ts`. Returns
      `{ primary, secondary }`: verbatim nodes in `zh` keep their
      English original on top and render the Chinese translation
      beneath; non-verbatim nodes swap straight to `zh`.
- [x] Every stage component switched off the literal `node.text.en`
      pattern and through the dual-text helper.
- [x] UI-string registry at `apps/web/src/lib/uiStrings.ts` for
      labels outside the content layer (Shell controls, chapter
      index, mission briefing modal, stage titles). `<html lang>`
      already synced to `uiStore.locale` in `Shell.tsx`.

### Phase 4 — PR B: translations

Delivered in two passes so the Chinese copy can be reviewed in
focused chunks instead of a single 193-entry blob.

PR B₁ — infra + small stages (this branch):

- [x] Fill `zh` values across `uiStrings.ts` (shell controls, stage
      titles, stage-0 modal copy, Stage 4 callout).
- [x] Add `shell.stage-prefix` and a `useStageEyebrow(id)` hook so the
      `Stage NN` telemetry chip switches with locale across every
      stage component (StageSection, StagePlaceholder, MissionBriefing,
      Stage0Stub, ColdOpenInner, Roadmap, Horizon, EndCredits).
- [x] Populate `zh.ts` for stages 0 (4), 1 (1 Musk quote), and 4 (2)
      — 7/193 entries covered.

PR B₂ — remaining stage content (follow-up):

- [ ] Populate `zh.ts` for stages 2/3/5/6/7/8/9 (64 entries) and
      migrate their per-stage labels (Stage 7 `TITLE_OVERRIDES`,
      Stage 8 `BLOCK_ORDER`, headings, summary toggles) onto the
      registry.
- [ ] Populate `zh.ts` for stage 10's glossary (122 entries, Kros to
      draft) plus EndCredits' "Forward-Looking Statements" + glossary
      search labels.
- [ ] Flip the build script to `validate:phase4` so missing entries
      fail CI.

### Phase 4 — PR C: SEO + share cards + a11y audit

- [ ] OpenGraph + Twitter Card metadata + canonical URL +
      `sitemap.xml` + `robots.txt`.
- [ ] Per-stage OG share cards generated at build time.
- [ ] WCAG 2.1 AA pass (axe + Lighthouse), keyboard nav end to end,
      `prefers-reduced-motion` honored throughout.

Review checkpoint at end of Phase 4 recommended (PLAN.md §11).

---

## Phase 5 — Audio polish

**Status:** not started.

Ambient BGM (~3 min loop) + stage SFX from ElevenLabs committed under
`apps/web/public/audio/`. Optional Stage 1 TTS narration (opt-in,
default OFF). All audio off by default site-wide. Volume policy: BGM
≈ −20 dB below SFX, all cues < 2s. Mobile defaults to BGM only.
`prefers-reduced-motion: reduce` → audio also defaults to muted.

---

## Cross-phase guarantees

These hold from Phase 1 onward:

- Every line of body copy traces to an S-1 line range (or is a
  Stage 0 / Stage 10 authored exception).
- `pnpm -r build` fails on any content validation error.
- Audio defaults to OFF and is mutable from the persistent shell.
- `prefers-reduced-motion: reduce` disables all motion immediately.
- No third-party CDNs (fonts, analytics, embeds). Static export only.
