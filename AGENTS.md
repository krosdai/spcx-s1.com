# Project context for AI agents

This file is the canonical entry point for any AI agent working in
this repo — Claude Code, Codex, Cursor, GitHub Copilot, or others.
Read it in full before touching code. The deeper docs in `docs/` go
further on specific topics.

Claude Code is pointed here via `CLAUDE.md`. Same content, same rules,
regardless of which agent you are.

---

## 1. What this project is

A single-page, scroll-driven, first-person interactive visualization of
SpaceX's May 2026 Form S-1, written as a launch sequence for a general
audience. Eleven "stages" run from a Mission Briefing modal through end
credits, with a thin persistent UI shell (T-minus countdown, chapter
index, source / language / audio toggles) above every stage.

- Domain: `spcx-s1.com` (purchased; DNS pending)
- Deploy: Cloudflare Pages (static export)
- Owner: Kros Dai (戴云杰 / xdanger), `y@dai.co`
- License: MIT

This is a fan-made project. Not affiliated with SpaceX. The S-1 is a
public SEC filing; everything on the site traces back to it.

## 2. Canonical source documents (read these)

1. **Build brief** — the canonical product spec, kept by Kros, may be
   amended:
   ```
   /Users/xdanger/Library/CloudStorage/Dropbox-Personal/@xdanger/projects/260002.Web_spacex-s1-interactive/PLAN.md
   ```
   Sections: §1 product, §2 audience, §3 non-negotiables, §4 site
   architecture + stage map + S-1 line ranges, §5 multilingual,
   §6 content manifest, §7 audio, §8 stack guidance, §9 phasing,
   §10 decisions, §11 still-open, §12 notes for agents.
2. **The S-1 itself** — in repo, single source of all body copy:
   ```
   sources/20260520_SpaceX_S-1_SEC-Filing.md  (16,211 lines)
   ```
   Authoritative upstream copy lives at
   `~/Library/CloudStorage/Dropbox-Personal/@xdanger/resources/2026/20260520_SpaceX_S-1_SEC-Filing.md`.
   The in-repo copy was snapshotted on 2026-05-21 with SHA-256
   `eb4d32cdf86b76a2504ba02cd92b68357b94b4bbd729548d85853a4742d56380`.
3. **Existing financial analysis PDF** — the chart palette to reuse:
   ```
   /Users/xdanger/Library/CloudStorage/Dropbox-Personal/@xdanger/kb/spacex_s1_2026_financial_analysis.pdf
   ```
   Do **not** reproduce its analysis on the site (third-party
   interpretation, not source content). Palette only.

If PLAN.md or the upstream S-1 changes, re-validate everything (the
content layer hashes the source file).

## 3. Non-negotiables (full text in PLAN.md §3)

- **Source-bound.** Every line of body copy traces to specific S-1
  line numbers. Content layer fails the build if any node is missing
  source attribution. No editorial commentary, opinion, or analysis.
- **First-person SpaceX voice.** "We / our / us" throughout, with three
  named exceptions: (1) Stage 0 modal (third-person, by the site
  authors), (2) the single direct Musk quote at l.577–580 (retained
  with attribution + quotation marks), (3) Stage 10 credits
  (third-person).
- **Complete coverage.** Every major S-1 section reachable: full Risk
  Factors, full Glossary, full Capitalization, full Use of Proceeds,
  verbatim Forward-Looking Statements caveat. Layered disclosure is
  fine; silent omission is not.
- **Restrained visuals.** Near-black background, white type, single
  accent. No neon, gradients, glow, decorative particles. Sci-fi feel
  comes from motion, pacing, and density — not effects.
- **Accessible.** WCAG 2.1 AA floor. Keyboard navigation end to end.
  `prefers-reduced-motion: reduce` disables all camera moves, type-on,
  count-ups, parallax. Screen reader can read every stage via semantic
  HTML.
- **Audio off by default.** ElevenLabs-generated only, all original,
  committed to repo under `apps/web/public/audio/`. See PLAN.md §7.
- **Multilingual: English first, Chinese in Phase 4.** Proper nouns stay
  in English in the Chinese locale. Verbatim quotes keep the English
  original + add Chinese beneath. In Phase 1 the validator only requires
  `text.en`; `text.zh` is allowed to be missing or empty. In Phase 4 the
  validator's rule 12 flips on and the build fails if any node lacks a
  `text.zh` key.

## 4. Phase plan (see `docs/phases.md` for status)

| Phase | Goal                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Skeleton + content extraction. Stage 0 + Stage 10 render. Persistent UI shell works. All S-1 content extracted + validated. Cloudflare preview live. |
| 2     | All static stages (2, 3, 4, 6, 7, 8).                                                                                                                |
| 3     | Cinematic stages (1, 5, 9) with 3D + reduced-motion fallback.                                                                                        |
| 4     | Multilingual UI + accessibility audit + SEO + share cards.                                                                                           |
| 5     | Audio polish (BGM + SFX + optional Stage 1 TTS).                                                                                                     |

We are **in Phase 1.** Do not start Phase 2 until Phase 1 is reviewed
and merged.

## 5. Stack and layout

Stack chosen 2026-05-21 (rationale in `docs/decisions.md`):

- **Next.js 15 App Router** with `output: 'export'` (static export).
- **React 19**, **TypeScript** (strict), **Tailwind CSS v4**.
- **Zustand** for global UI state (toggles, T-minus, chapter index).
- **Zod** for content schema validation at build time.
- **Vitest** for unit tests.
- **Self-hosted Inter (display) + JetBrains Mono (telemetry)** via
  `@fontsource/*`. No third-party font CDN.
- **3D & charts deferred**: React Three Fiber in Phase 3,
  Chart.js in Phase 2.

Monorepo layout (pnpm workspace):

```
.
├── apps/
│   └── web/                # Next.js app; static export → apps/web/out
├── packages/
│   └── content/            # @spcx/content: schema + validator + data
│       ├── src/
│       │   ├── schema.ts       # Zod ContentNode schema
│       │   ├── stages/         # one file per stage (stage0.ts … stage10.ts)
│       │   ├── manifest.ts     # build-time source manifest
│       │   └── index.ts        # exports all stages
│       ├── bin/validate.ts # CLI: pnpm validate
│       └── tests/
├── sources/
│   └── 20260520_SpaceX_S-1_SEC-Filing.md   # the SEC filing
├── docs/                   # see §8 below
├── AGENTS.md               # this file (primary agent context)
├── CLAUDE.md               # pointer for Claude Code + Claude-specific tips
├── README.md               # public-facing
├── LICENSE                 # MIT
├── package.json            # root (pnpm scripts)
├── pnpm-workspace.yaml
└── tsconfig.json
```

## 6. Common commands

```sh
pnpm install                # install all workspace deps
pnpm -r build               # build everything (content validates first)
pnpm --filter @spcx/content validate   # validate content layer
pnpm --filter @spcx/content test       # run schema + validator tests
pnpm --filter web dev       # start Next.js dev server (apps/web)
pnpm --filter web build     # build static export → apps/web/out
pnpm lint                   # repo-wide ESLint + Prettier --check
pnpm lint:fix               # autofix + format
pnpm format                 # prettier + autocorrect-node
```

`pnpm install` is required before any of the above the first time.

## 7. Content pipeline summary (deep dive in `docs/content-pipeline.md`)

- Every piece of body copy on the site is a `ContentNode` (schema in
  `packages/content/src/schema.ts`).
- Each node has: `id`, `stage`, `kind`, `text.en` (required) +
  `text.zh` (optional), `verbatim: boolean`, optional `originalText`,
  a `source` ref (file + lineStart + lineEnd) or `null` for authored
  Stage 0 / Stage 10 entries.
- The validator (`pnpm --filter @spcx/content validate`) runs as part
  of the build. It:
  1. Parses every stage file against the Zod schema.
  2. Loads `sources/20260520_SpaceX_S-1_SEC-Filing.md` and checks each
     `source.lineStart..lineEnd` actually exists.
  3. For `verbatim: true` nodes, checks `text.en` matches the source
     lines (whitespace-normalized).
  4. Recomputes the SHA-256 of the source file and fails the build
     (rule 10) if it drifts from the manifest. Run
     `pnpm --filter @spcx/content refresh-manifest` to bring the
     manifest back in sync after replacing the snapshot.
  5. Fails the build on any error.
- Add a new node by editing the relevant `packages/content/src/stages/stageN.ts`
  file, then running `pnpm --filter @spcx/content validate`.

## 8. Sub-docs

- `docs/architecture.md` — stack rationale, monorepo layout, build &
  deploy pipeline.
- `docs/content-pipeline.md` — content schema in detail, validator
  rules, extraction guidelines, examples.
- `docs/stages.md` — the 11 stages with their S-1 line ranges, voice
  rules, and Phase assignments. Self-contained: you do not need
  PLAN.md open to do daily extraction work.
- `docs/voice-and-visual.md` — voice rules in detail, visual language,
  the financial palette (TEAL `#1D9E75`, BLUE `#378ADD`, CORAL
  `#D85A30`, GREEN `#639922`, AMBER `#BA7517`).
- `docs/phases.md` — current Phase, what's done, what's queued, what's
  out of scope per phase.
- `docs/decisions.md` — ADR-lite: stack choice, repo name, source file
  location, license holder, etc.

## 9. Things to NOT do

- Do **not** add editorial commentary, opinion, analysis, or any
  content not directly traceable to the S-1 (with the three voice
  exceptions named in §3).
- Do **not** reproduce the chat-based strategic / financial analyses
  Kros and I produced in conversation. Those are third-party
  interpretation.
- Do **not** use neon, gradients, glow, rainbow palettes, or
  decorative particles. Visual restraint is non-negotiable.
- Do **not** add a third-party font CDN, analytics with cookies, or
  any SSR runtime. Static export only.
- Do **not** invoke `/ultrareview` yourself. It is user-triggered.
- Do **not** modify linter configs without explicit approval.
- Do **not** create emoji in code, comments, or copy (unless Kros
  explicitly asks).
- Do **not** push to `main` directly. Open a PR.
- Do **not** start Phase N+1 before Phase N is reviewed and merged.

## 10. Decisions / discrepancies / open items

Captured in detail in `docs/decisions.md`. Quick list:

- **GitHub repo name discrepancy.** PLAN.md says `xdanger/spcx-s1`;
  actual remote is `git@github.com:xdanger/spcx-s1.com.git`. Use the
  actual remote. (2026-05-21)
- **Source file in repo.** `sources/20260520_SpaceX_S-1_SEC-Filing.md`
  is a committed snapshot of the upstream Dropbox copy. Reproducible
  builds. Re-sync manually if SEC files an amended S-1.
- **Cloudflare Pages auth.** `wrangler` 4.93.0 is installed but not
  logged in. Kros to either run `wrangler login` or provide
  `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`.
- **License holder.** MIT, copyright "Kros Dai (戴云杰 / xdanger)".

## 11. Working style Kros prefers

- Concise updates. Don't narrate every file write. Summarize at
  natural checkpoints.
- Plain prose in chat. Wrap any text Kros will copy in fenced code
  blocks.
- Default language: English in code, comments, the site itself, and
  docs. Chinese only where Kros explicitly asks or where PLAN.md's
  multilingual rules apply.
- No emojis anywhere unless asked.
- Match the chart palette from the existing financial PDF (see
  `docs/voice-and-visual.md`).
- Ask before deviating from the suggested stack, when an S-1 sentence
  is ambiguous, when PLAN.md's line ranges don't match what's in the
  file, or when any GitHub / Cloudflare / domain account prompts need
  Kros's manual action.

## 12. PR review etiquette

While a pull request is open, keep watching for new activity and
process it autonomously. That includes:

- **CI status** — GitHub Actions checks, Cloudflare Pages preview
  build, code-review reusable workflow. If a check fails, treat it
  like a reviewer comment and act on it.
- **Code-review bots** — CodeRabbit, Greptile, the Codex bot, etc.
  and any inline comments they leave.
- **Human reviewers** — top-level review comments and inline
  comments.

For each inline comment:

1. Decide whether it flags a real bug, a stylistic preference, a
   misread of the code, or a duplicate of a thread already addressed.
2. If it's a real bug, fix it — preferably in a focused commit that
   addresses just that thread or a tight batch of related threads.
3. **Reply inline to every comment, including the ones you don't
   fix.** Cite the commit SHA that resolves it, or explain concisely
   why no change is needed (false positive, intentional design, out
   of scope for the current phase). Silent dismissals are not
   acceptable — every thread gets an answer.
4. Resolve the thread. Two equivalent paths:
   - `gh api graphql` → `resolveReviewThread`, or
   - Drive Chrome via the Chrome MCP (see §13), open the PR page,
     and click the "Resolve conversation" button. Useful when
     GraphQL coverage is patchy or a bot's threads aren't surfaced
     by `gh`.
5. Before declaring the PR ready, **open the PR page in Chrome** and
   visually confirm: every thread shows as resolved, every CI check
   is green, and the PR description checklist matches reality. Don't
   trust the API listing alone — GitHub's UI is the source of truth
   reviewers see.

Keep polling until the PR is merged or has gone quiet for a reasonable
interval — roughly ten minutes with no new reviewer or bot activity
after the last push.

The goal: make the best call you can with the context available, and
do most of the work without bouncing decisions back to Kros. Only stop
and ask when it's genuinely his call to make — architecture pivot,
scope expansion, an account or billing action, or an ambiguity in the
S-1 that can't be resolved from the source itself.

## 13. Browser verification (Phase 2+)

Phase 2 introduces real UI stages. For any change that touches what
the user sees — a new stage, a visual tweak, a layout fix, a motion
adjustment — **verify in a real browser before reporting the work as
done.** Type checking and unit tests verify code correctness, not
feature behavior.

Drive Kros's actual Chrome via the Chrome MCP (tools named
`mcp__Claude_in_Chrome__*`; load via `ToolSearch` if deferred). Do
this proactively, without waiting to be asked:

1. Start the dev server: `pnpm --filter web dev`.
2. Navigate Chrome to the local URL (typically
   `http://localhost:3000`).
3. Walk the affected stages and the obvious edge cases — keyboard
   navigation, `prefers-reduced-motion: reduce`, narrow viewports,
   the persistent UI shell.
4. Read the console messages and network requests. Take screenshots
   of meaningful states so Kros can see what you saw.
5. Watch for regressions in other stages, not just the one you
   changed.

If you genuinely can't drive Chrome (extension not connected,
sandboxed environment, dev server won't start), say so explicitly
rather than claiming success. Don't fall back to "looks right in the
diff" — for UI work, that's not verification.

The same Chrome MCP is the fallback path for resolving PR threads —
see §12 step 4.

End of agent context.
