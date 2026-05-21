# Claude Code — start here

The canonical project context lives in **[`AGENTS.md`](./AGENTS.md)**.
That file is shared with every agent in this repo (Codex, Cursor,
GitHub Copilot, etc.). Read it in full before touching anything.

Then, depending on what you are doing, read the relevant doc:

- Code or architecture changes → [`docs/architecture.md`](./docs/architecture.md)
- Adding / editing site content → [`docs/content-pipeline.md`](./docs/content-pipeline.md) + [`docs/stages.md`](./docs/stages.md)
- UI / design / motion → [`docs/voice-and-visual.md`](./docs/voice-and-visual.md)
- What phase we are in → [`docs/phases.md`](./docs/phases.md)
- Why a choice was made → [`docs/decisions.md`](./docs/decisions.md)

The canonical product brief (kept by Kros, may be amended) lives
outside the repo at:

```
/Users/xdanger/Library/CloudStorage/Dropbox-Personal/@xdanger/projects/260002.Web_spacex-s1-interactive/PLAN.md
```

If `AGENTS.md` or `docs/` disagrees with `PLAN.md`, `PLAN.md` wins —
and the in-repo docs need updating.

## Claude-specific guidance

### Delegating to Codex

Codex is excellent at coding when handed a clear context and a clear
goal. For substantial implementation work, prefer delegating to it
rather than doing everything in the main session — it gets through
mechanical work fast and protects this conversation's context.

Two delegation paths:

1. **`codex:rescue` subagent** — invoke via the `Agent` tool with
   `subagent_type: "codex:codex-rescue"`. Best for diagnosis, a
   second-opinion implementation pass, root-cause investigation, or
   handing off a substantial coding task through the shared runtime.
   The `codex:rescue` skill explains the contract; the
   `codex:setup` skill verifies that the local Codex CLI is ready.
2. **Headless Codex CLI** for one-shot tasks. For complex,
   multi-step objectives, framing the task as a `/goal` lets Codex
   plan and execute end to end. Reach for this when the work is
   well-scoped enough that you can write a self-contained brief —
   then verify the output before reporting back to Kros.

How to brief Codex well (the same rules apply to either path):

- State the goal, the relevant file paths, and the success criteria
  (what files should change, what tests should pass, what the build
  should produce).
- Quote the non-negotiables from `AGENTS.md` §3 if the task touches
  content, voice, or visuals.
- Spell out anything Codex would otherwise need this conversation to
  understand — it lands cold.
- Ask for short, verifiable output (a diff + a one-line summary), not
  a narrative.

After Codex returns, **verify before claiming done**: read the diff,
re-run the validator / build, spot-check 1–2 changed files. Codex's
summary describes intent; you check actuality.

### When NOT to delegate

- Tiny edits (one-line tweaks, a single import).
- Tasks that need this conversation's accumulated context that you
  haven't yet written into `AGENTS.md` or `docs/`.
- Anything that requires Kros's manual action (Cloudflare auth, domain
  DNS, GitHub settings).
