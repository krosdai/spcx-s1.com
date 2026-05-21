# Decisions

A short ADR-lite log of choices made during the build. New decisions
append at the top. Each entry: date, decision, alternatives considered,
rationale.

---

## 2026-05-21 — Use actual Glossary start line 280

**Decision.** Extract the full Glossary from `sources/20260520_SpaceX_S-1_SEC-Filing.md`
starting at line 280 and ending at line 565.

**Alternatives considered.** Follow `docs/stages.md`, which described the
full Glossary as approximately `l.310-565`.

**Rationale.** The source file's glossary entries begin at line 280 with the
AI terms. Starting at line 310 would omit the first several definitions. The
stage map used an approximate range, so the content layer keeps exact line
refs from the source snapshot and this discrepancy is recorded here.

---

## 2026-05-21 — Use Next.js 15 (static export) over Astro

**Decision.** `apps/web/` is a Next.js 15 App Router app with
`output: 'export'`, deployed as plain HTML to Cloudflare Pages. No SSR
runtime.

**Alternatives considered.** Astro 5; SvelteKit static export; Vite +
React + custom router.

**Rationale.** The site is more "interactive app over content" than
"content over interactivity." Persistent UI shell, scroll-driven
stages, three 3D scenes in Phase 3, an interactive risk filter in
Stage 7, and a glossary with search in Stage 10 all benefit from a
cohesive React component model and React state. Next.js 15 covers
that, the static export hits the "no SSR runtime" constraint, and the
React 19 + RSC opt-out keeps the bundle predictable. Astro would
have been a great choice for the content-heavy Stage 6/7/8/10 work
but adds friction for the interactive Stages 1/5/9.

---

## 2026-05-21 — Snapshot S-1 source into repo at `sources/`

**Decision.** Copy
`/Users/xdanger/Library/CloudStorage/Dropbox-Personal/@xdanger/resources/2026/20260520_SpaceX_S-1_SEC-Filing.md`
into the repo at `sources/20260520_SpaceX_S-1_SEC-Filing.md` (kept the
original filename, as Kros requested). Track its SHA-256 in
`packages/content/src/manifest.ts`.

**Alternatives considered.** Read directly from Dropbox at build time
(no in-repo copy).

**Rationale.** Build reproducibility. CI builds and Cloudflare Pages
builds do not have access to Kros's Dropbox. Snapshotting the source
also gives a hash-pinned reference point so we can detect when an
amended S-1 lands and re-validate. Original Dropbox copy remains
authoritative; the in-repo copy is a snapshot. SHA-256 at snapshot
time: `eb4d32cdf86b76a2504ba02cd92b68357b94b4bbd729548d85853a4742d56380`.

**Refresh procedure** documented in
[`content-pipeline.md`](./content-pipeline.md).

---

## 2026-05-21 — Keep `xdanger/spcx-s1.com` as the GitHub repo name

**Decision.** The repo at `git@github.com:xdanger/spcx-s1.com.git`
stays. PLAN.md's reference to `xdanger/spcx-s1` is treated as a typo.

**Alternatives considered.** Rename to `xdanger/spcx-s1` to match
PLAN.md.

**Rationale.** Kros confirmed (2026-05-21). The `.com` suffix matches
the production domain and is the existing remote.

---

## 2026-05-21 — pnpm workspace with `apps/*` + `packages/*`

**Decision.** Add two workspace globs to the existing scaffold:
`apps/*` for runnable apps (only `apps/web` initially) and
`packages/*` for shared libraries (`packages/content` initially).

**Alternatives considered.** Single-package repo with everything under
`src/`.

**Rationale.** The content layer is genuinely separable from the
web app. Putting it in its own package gets us:

- A clean import boundary (`import { allNodes } from '@spcx/content'`).
- A standalone validator (`pnpm --filter @spcx/content validate`) that
  CI can run independently.
- Room to add a `packages/audio` (Phase 5 metadata about ElevenLabs
  generations) or `packages/charts` (Phase 2 chart helpers) without
  reshaping the tree.

The existing scaffold (`pnpm-workspace.yaml`, root `package.json`
scripts, root `eslint.config.mjs` with `commonIgnorePatterns` and
exportable `baseConfig`) was already designed for this. Workspace
additions are purely additive.

---

## 2026-05-21 — Self-host fonts via `@fontsource/*`

**Decision.** Inter for display + body, JetBrains Mono for telemetry,
both via `@fontsource/inter` and `@fontsource/jetbrains-mono` npm
packages.

**Alternatives considered.** Google Fonts CDN; manual `.woff2` files
in `public/fonts/`.

**Rationale.** PLAN.md §8 forbids third-party font CDNs (privacy +
perf). `@fontsource/*` packages ship the fonts as files we serve from
our own origin, with no manual download/update step. Selecting just
the weights and ranges we need keeps the bundle small.

---

## 2026-05-21 — MIT, copyright holder Kros Dai (戴云杰 / xdanger)

**Decision.** MIT license, single copyright holder named as Kros Dai
(戴云杰 / xdanger). 2026 copyright year.

**Alternatives considered.** Apache 2.0 (more patent-explicit but
heavier); CC-BY-NC for the text-as-art angle (rejected: incompatible
with code).

**Rationale.** Matches PLAN.md §10. MIT is the simplest, most
permissive license for an open-source code repo. The S-1 itself is a
public SEC filing and is not subject to our license.

---

## Open items needing Kros's manual action

These are not decided yet; tracked here for visibility:

- **Cloudflare Pages auth.** `wrangler 4.93.0` is installed but not
  logged in. Choose one: (a) Kros runs `wrangler login` in browser,
  (b) Kros provides `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`,
  or (c) connect the GitHub repo to Cloudflare Pages in the dashboard
  and let Cloudflare handle CI. Recommendation: (c), simplest.
- **Cloudflare Web Analytics.** PLAN.md §11 asks whether to include it
  at all. Default: not in Phase 1; revisit in Phase 4.
- **Final IPO ticker.** PLAN.md lists `SPCX` as the proposed symbol.
  Verify before publishing in case the actual listing differs.
- **Per-phase review checkpoint format.** Likely a Cloudflare preview
  URL + a written checklist Kros walks through. Confirm at end of
  Phase 1.
