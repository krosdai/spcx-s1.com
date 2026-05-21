# Content pipeline

The content layer is the contract that keeps the site honest. Every
piece of body copy on the site is a typed record with a source ref.
The build fails on any drift.

## Where content lives

```
packages/content/
├── src/
│   ├── schema.ts              # Zod schemas (ContentNode, Manifest, enums)
│   ├── stages/                # one TS file per stage
│   │   ├── stage0.ts          # Mission Briefing modal (authored)
│   │   ├── stage1.ts          # Cold Open
│   │   ├── stage2.ts          # Who We Are
│   │   ├── stage3.ts          # The Three Pillars
│   │   ├── stage4.ts          # The Algorithm
│   │   ├── stage5.ts          # The Roadmap
│   │   ├── stage6.ts          # The Numbers
│   │   ├── stage7.ts          # The Anomaly Log (risks)
│   │   ├── stage8.ts          # Who Steers the Ship
│   │   ├── stage9.ts          # The Horizon
│   │   └── stage10.ts         # End Credits + Glossary
│   ├── manifest.ts            # generated build-time source manifest
│   ├── validator.ts           # programmatic validator (used by bin + tests)
│   └── index.ts               # public exports: allNodes, byStage(), etc.
├── bin/
│   └── validate.ts            # CLI: `pnpm --filter @spcx/content validate`
└── tests/                     # Vitest suite
```

## The ContentNode shape

Defined in `packages/content/src/schema.ts`. Field by field:

```ts
{
  id: string;
  //   ^ stable, lowercase, dot-separated. Pattern:
  //     stage{N}.{slug}    e.g. 'stage6.kpi.revenue-2025'
  //   Used as React keys, anchor IDs, source-toggle map keys.

  stage: 0 | 1 | 2 | ... | 10;

  kind: 'prose' | 'kpi' | 'milestone' | 'risk' | 'glossary'
      | 'quote' | 'table' | 'list' | 'caveat' | 'authored';
  //   ^ determines which renderer the UI picks, and which extra
  //     metadata block (risk, glossary, kpi, milestone) is required.

  text: {
    en: string;   // REQUIRED. The English text shown on the site.
    zh?: string;  // OPTIONAL in Phase 1; required by Phase 4.
  };

  verbatim: boolean;
  //   ^ true  = text.en is the exact wording from the S-1 (whitespace
  //             normalized). Validator will diff against the source
  //             lines and fail the build if they disagree.
  //     false = text.en has been edited for voice/flow. Must also
  //             supply `originalText` (the unedited S-1 text), so the
  //             source toggle can show it.

  originalText?: string;
  //   ^ Required when verbatim === false AND source !== null.

  source: {
    file: 'sources/20260520_SpaceX_S-1_SEC-Filing.md';
    lineStart: number;
    lineEnd: number;     // >= lineStart
    sectionTitle?: string;
  } | null;
  //   ^ null is ONLY allowed when kind === 'authored' (Stage 0 modal +
  //     Stage 10 authored credits). Everything else MUST have a source.

  tags?: string[];
  //   ^ Free-form. Conventions:
  //     - 'musk-quote'              the single direct Musk quote
  //     - 'highlighted-disclosure'  Stage 7 pin-icon items
  //     - 'verbatim-required'       Use of Proceeds, Dividend Policy,
  //                                 Forward-Looking caveat
  //     - 'caveat:commercial-viability'   surfaces l.1086–1118 caveat

  risk?: {
    category: 'mission' | 'operational' | 'regulatory'
            | 'financial' | 'governance' | 'sector-ai';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    highlightedDisclosure?: boolean;
  };
  //   ^ Required when kind === 'risk'.

  glossary?: {
    term: string;
  };
  //   ^ Required when kind === 'glossary'. `term` is the headword;
  //     `text.en` is the definition.

  kpi?: {
    value: string | number;
    unit?: string;
    label?: string;
    asOf?: string;        // YYYY-MM-DD or 'FY2025' etc.
  };
  //   ^ Optional sidecar for kind === 'kpi' nodes (count-ups, big stats).

  milestone?: {
    year: number;
    label: string;
  };
  //   ^ Optional sidecar for kind === 'milestone' nodes (Stage 2 timeline).
}
```

## Validator rules

Run by `pnpm --filter @spcx/content validate` and as part of
`packages/content`'s build. Implemented in
`packages/content/src/validator.ts`.

1. **Schema parses cleanly.** Every node in every stage file matches
   the Zod schema. (Zod handles type-level checks; superRefine handles
   cross-field rules.)
2. **IDs are unique repo-wide.** Duplicates fail.
3. **Source line ranges exist.** For each node with `source !== null`,
   load `sources/20260520_SpaceX_S-1_SEC-Filing.md` and confirm that
   `lineStart` and `lineEnd` are both `>= 1` and `<=` the file's line
   count.
4. **Verbatim text matches.** For nodes with `verbatim === true`, the
   `text.en` must equal the joined source lines after whitespace
   normalization (collapse runs of whitespace to a single space; trim
   ends). Fail on mismatch — print a unified diff in the error.
5. **`originalText` required when needed.** If `verbatim === false`
   and `source !== null`, `originalText` must be present and non-empty.
6. **Authored discipline.** Only `kind === 'authored'` may have
   `source: null`. Conversely, `kind === 'authored'` MUST have
   `source: null` (it's authored, by definition).
7. **Voice exceptions.** Tags `'musk-quote'`, `'highlighted-disclosure'`,
   and `'verbatim-required'` imply `verbatim === true`. Fail if a
   tagged node is non-verbatim.
8. **Forward-Looking caveat present.** A node tagged
   `'verbatim-required'` with `source.lineStart === 3502` (or a range
   starting at the canonical caveat) must exist in Stage 10. Fail if
   missing. (Belt-and-suspenders check for a non-negotiable.)
9. **Use of Proceeds + Dividend Policy verbatim.** A Stage 6 node
   covering `sources/...:3575-3601` (Use of Proceeds) and another
   covering `3603-3617` (Dividend Policy) must exist and both be
   `verbatim: true`. Fail if missing.
10. **Source SHA-256 hash check.** Recompute the SHA-256 of the source
    file and compare to the value stored in
    `packages/content/src/manifest.ts`. If they differ, exit non-zero
    with instructions to re-run `pnpm --filter @spcx/content
refresh-manifest` and re-verify all content. This catches the
    "Kros pulled an amended S-1" case.
11. **English required everywhere.** Every node's `text.en` is
    non-empty. (Zod enforces this at the type level too.)
12. **Chinese translation key present.** In Phase 4 only, every node
    must have a `text.zh`. In Phase 1, missing `zh` is allowed; empty
    string is allowed.

The validator prints a structured error report on failure: one error
per violation with `id`, `stage`, the offending field, and (where
relevant) a diff.

## Adding a new node

1. Open the relevant stage file in `packages/content/src/stages/`.
2. Find the right line range in the S-1 using the maps in
   [`stages.md`](./stages.md).
3. Decide `verbatim`:
   - Verbatim (preferred when practical) means quoting exactly.
   - Non-verbatim is allowed only when needed for first-person voice
     consistency (e.g., "the Company" → "we"). When you go
     non-verbatim, you MUST store the unedited S-1 wording in
     `originalText` so the source toggle can show it.
4. Pick an ID following the `stage{N}.{slug}` convention. Slug should
   read like a stable identifier ("kpi.starlink-subscribers" not
   "thing-3").
5. Run `pnpm --filter @spcx/content validate`. Fix until clean.
6. Add or extend a Vitest case if the node carries non-trivial
   metadata (a new risk category, a new highlighted disclosure, etc.).

## Examples

A verbatim quote (the Musk cold open):

```ts
{
  id: 'stage1.cold-open.musk-quote',
  stage: 1,
  kind: 'quote',
  text: {
    en: '"You want to wake up in the morning and think the future is going to be great—and that\'s what being a space-faring civilization is all about. It\'s about believing in the future and thinking that the future will be better than the past. And I can\'t think of anything more exciting than going out there and being among the stars." — Elon Musk',
  },
  verbatim: true,
  source: {
    file: 'sources/20260520_SpaceX_S-1_SEC-Filing.md',
    lineStart: 577,
    lineEnd: 580,
    sectionTitle: 'Prospectus Summary',
  },
  tags: ['musk-quote', 'verbatim-required'],
}
```

A non-verbatim prose block (first-person voice edit):

```ts
{
  id: 'stage2.scale.launches-2025',
  stage: 2,
  kind: 'kpi',
  text: {
    en: 'We conducted 138 launches in 2025, more than any other company or country.',
  },
  verbatim: false,
  originalText: 'SpaceX conducted 138 launches in 2025, more than any other company or country.',
  source: {
    file: 'sources/20260520_SpaceX_S-1_SEC-Filing.md',
    lineStart: 832,
    lineEnd: 833,
  },
  kpi: { value: 138, label: 'launches', asOf: 'FY2025' },
}
```

(The exact wording above is illustrative — confirm against the actual
source lines before committing.)

A risk node (Stage 7 highlighted disclosure):

```ts
{
  id: 'stage7.governance.no-key-person-insurance-musk',
  stage: 7,
  kind: 'risk',
  text: {
    en: 'We do not maintain key person life insurance on Mr. Musk.',
  },
  verbatim: false,
  originalText: '...exact wording from l.3208 here...',
  source: {
    file: 'sources/20260520_SpaceX_S-1_SEC-Filing.md',
    lineStart: 3208,
    lineEnd: 3208,
  },
  risk: {
    category: 'governance',
    severity: 'high',
    highlightedDisclosure: true,
  },
  tags: ['highlighted-disclosure'],
}
```

## Refreshing the source file

The S-1 may be amended pre-IPO. To refresh:

```sh
cp "/Users/xdanger/Library/CloudStorage/Dropbox-Personal/@xdanger/resources/2026/20260520_SpaceX_S-1_SEC-Filing.md" \
   sources/20260520_SpaceX_S-1_SEC-Filing.md
pnpm --filter @spcx/content refresh-manifest
pnpm --filter @spcx/content validate
```

Expect failures: amended S-1s often shift line numbers. Walk through
each error, locate the new line range in the updated file, and update
the affected nodes. Then re-run validate until clean.

If the upstream Dropbox file changes but the in-repo file is older, the
SHA-256 check produces a warning but does not fail. Fail-on-mismatch
is reserved for the in-repo file vs. the in-repo manifest pair, so the
build is reproducible.
