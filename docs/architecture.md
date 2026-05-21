# Architecture

This doc covers the stack, the monorepo layout, and the build / deploy
pipeline. For why each decision was made, see
[`decisions.md`](./decisions.md).

## Stack at a glance

| Layer           | Choice                                            | Notes                                                              |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| Framework       | Next.js 15 (App Router)                           | `output: 'export'`, static HTML only, no SSR runtime               |
| Language        | TypeScript (strict)                               | `tsconfig.json` extends root `strict: true`                        |
| UI              | React 19 + Tailwind CSS v4                        | Tailwind v4 uses CSS-first config (`@theme`)                       |
| State           | Zustand                                           | Global UI state: toggles, T-minus, chapter index                   |
| Validation      | Zod                                               | Used for the content schema at build time                          |
| Tests           | Vitest                                            | Targets the content package; UI tests TBD in Phase 2/3             |
| Charts          | Chart.js                                          | Deferred to Phase 2 (Stage 6)                                      |
| 3D              | React Three Fiber                                 | Deferred to Phase 3 (Stages 1, 5, 9), with reduced-motion fallback |
| Motion          | Motion v12 (Framer Motion 12)                     | Used only where it earns its bytes                                 |
| Fonts           | `@fontsource/inter`, `@fontsource/jetbrains-mono` | Self-hosted, no third-party font CDN                               |
| Audio           | ElevenLabs (committed to repo)                    | Phase 5; off by default                                            |
| Package manager | pnpm 11 (workspace)                               | Pinned via `packageManager` in root `package.json`                 |
| Node            | 22.22.1+                                          | Pinned via `engines` in root `package.json`                        |
| Deploy          | Cloudflare Pages                                  | Static export from `apps/web/out`                                  |

## Monorepo layout

```
.
├── apps/
│   └── web/                              # Next.js app (static export)
│       ├── src/
│       │   ├── app/                      # App Router routes + layouts
│       │   ├── components/               # UI components
│       │   ├── stores/                   # Zustand stores
│       │   └── lib/                      # Utilities
│       ├── public/
│       │   ├── fonts/                    # (built from @fontsource at install)
│       │   └── audio/                    # ElevenLabs-generated (Phase 5)
│       ├── next.config.mjs               # output: 'export'
│       ├── tailwind.config.css           # Tailwind v4 @theme tokens
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── content/                          # @spcx/content
│       ├── src/
│       │   ├── schema.ts                 # Zod ContentNode + Manifest schemas
│       │   ├── stages/                   # one file per stage 0..10
│       │   ├── manifest.ts               # build-time source manifest
│       │   ├── validator.ts              # programmatic validator
│       │   └── index.ts                  # exports allNodes, byStage(), etc.
│       ├── bin/validate.ts               # CLI: `pnpm --filter @spcx/content validate`
│       ├── tests/                        # Vitest suite
│       ├── eslint.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── sources/
│   └── 20260520_SpaceX_S-1_SEC-Filing.md # 16,211 lines; SHA-256 in AGENTS.md
├── docs/                                 # this doc tree
├── AGENTS.md                             # primary agent context
├── CLAUDE.md                             # Claude-specific pointer to AGENTS.md
├── README.md
├── LICENSE                               # MIT
├── package.json                          # root pnpm scripts
├── pnpm-workspace.yaml
└── tsconfig.json                         # root TS defaults
```

## Build pipeline

```
pnpm -r build
   └─ packages/content build
        ├─ tsc --noEmit (typecheck schema + stages)
        └─ tsx bin/validate.ts (run validator against sources/...)
   └─ apps/web build
        ├─ next build (uses output: 'export')
        └─ writes static site to apps/web/out
```

The web build imports `@spcx/content` directly (typed). Because Next.js
runs at build time and `output: 'export'` produces pure HTML/JS/CSS,
the entire content layer is shaken into the bundle at build time and
no runtime fetch is needed.

The content validator must pass before `apps/web` is built — pnpm's
topological build order handles this because `apps/web` depends on
`@spcx/content`.

## Deploy pipeline

Target: Cloudflare Pages.

Two ways to wire it (see `decisions.md` for current choice):

1. **GitHub integration (preferred).** Kros connects
   `xdanger/spcx-s1.com` in the Cloudflare dashboard. Pages config:
   - Build command: `pnpm install --frozen-lockfile && pnpm -r build`
   - Build output directory: `apps/web/out`
   - Root directory: `/`
   - Node version: 22.22.1
   - Environment variables: none required for Phase 1
2. **Wrangler CLI.** `wrangler 4.93.0` is installed locally; needs
   either `wrangler login` (interactive) or a
   `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` env pair.

Preview deploys: every push to a non-`main` branch should produce a
preview URL. Production deploys: pushes to `main`.

## Performance budget

PLAN.md §8 commits to "smooth on a 2020-era laptop." Concrete targets:

- Initial JS shipped to the browser on a cold visit: < 150 KB gzipped.
  This rules out shipping R3F, Chart.js, or the entire content payload
  upfront.
- Stage 1 / 5 / 9 3D bundles: lazy-loaded only when the stage enters
  the viewport. Each scene budget ~120 KB gzipped on top of the base.
- Stage 6 charts: dynamic import when Stage 6 enters viewport.
- LCP < 2.5s on a 2020-era laptop on cable (Phase 1 / 2 measurement,
  formal a11y + perf audit in Phase 4).

## Accessibility plumbing

- Semantic HTML for every stage (`<section>`, `<article>`, headings in
  sequence, `aria-labelledby` for the chapter index, `aria-live` for
  toggles, `<dialog>` for Stage 0 modal).
- `prefers-reduced-motion: reduce` disables all camera moves, type-on
  animations, count-ups, and parallax. Implemented as a hook that all
  motion components read.
- All interactive elements reachable with `Tab` / `Shift-Tab`. Focus
  ring visible (single accent colour, high contrast).
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI
  components, in both English and Chinese locales.
- Full a11y audit happens in Phase 4.

## Privacy & analytics

- No client-side analytics with cookies.
- If analytics at all: Cloudflare Web Analytics or Plausible — decided
  in Phase 4. None in Phase 1.
- No third-party CDNs (fonts, analytics, embeds). Everything served
  from the same origin.
