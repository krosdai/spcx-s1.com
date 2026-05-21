# spcx-s1.com — SpaceX S-1 Interactive

An interactive, sci-fi, first-person visualization of SpaceX's May 2026
Form S-1, written as a launch sequence for a general audience.

> Status: Phase 1 (skeleton + content extraction). Not yet deployed.

## What this is

A single-page, scroll-driven site that walks a non-finance reader through
SpaceX's 200-page IPO prospectus from cover to glossary. Eleven stages
flow from a mission briefing modal through a cold open, the company's
history, its segments and business model, its roadmap, its numbers, its
risks, its governance, its long-term horizon, and finally end credits
with the full glossary and forward-looking statements caveat.

Every line of body copy on the site traces back to a specific line range
in the source SEC filing. A source toggle in the UI reveals the line
references next to every block. No editorial commentary, opinion, or
third-party analysis is added.

## Disclaimer

This site is a **fan-made, independent visualization**. It is **not
affiliated with, endorsed by, or sponsored by SpaceX**. All content is
sourced from a public SEC filing (Form S-1, dated 2026-05-20). Nothing
on the site is investment advice.

The S-1 itself is included in the repo at
`sources/20260520_SpaceX_S-1_SEC-Filing.md`. The original filing is a
public document available from the U.S. Securities and Exchange
Commission.

## Stack

- Next.js 15 (App Router, static export) + React 19 + TypeScript
- Tailwind CSS v4
- Zustand for global UI state
- Zod for content schema validation at build time
- Vitest for unit tests
- pnpm workspace monorepo

The full architecture is documented in
[`docs/architecture.md`](./docs/architecture.md).

## Quick start

Requires Node 22.22.1+ and pnpm 11+.

```sh
pnpm install
pnpm --filter @spcx/content validate   # validate the S-1 content layer
pnpm --filter web dev                  # start the Next.js dev server
```

Production build:

```sh
pnpm -r build                          # validates content, then builds web
# static output: apps/web/out
```

Other useful scripts (see `package.json`):

```sh
pnpm lint                              # ESLint + Prettier --check
pnpm lint:fix                          # autofix + format
pnpm format                            # Prettier + autocorrect-node
pnpm --filter @spcx/content test       # vitest
```

## Repo layout

```
apps/web/             Next.js app (static export)
packages/content/     Typed content layer (@spcx/content)
sources/              The SEC filing (single source of truth)
docs/                 Architecture, content pipeline, stages, decisions
```

## For AI agents

If you are an AI agent working in this repo, start with
[`AGENTS.md`](./AGENTS.md). It is the canonical context for all
coding agents (Claude Code, Codex, Cursor, Copilot, etc.) and links to
the deeper docs in `docs/`. Claude Code is pointed there via
[`CLAUDE.md`](./CLAUDE.md), which also carries Claude-specific tips
(notably: how to delegate substantial coding work to Codex).

## License

MIT. See [`LICENSE`](./LICENSE).
