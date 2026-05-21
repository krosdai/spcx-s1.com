# The 11 stages

A self-contained map of every stage, its voice, its content, and where
to find that content in the S-1. Use this as your daily reference for
extraction work — you should not need to open PLAN.md.

If a line range here disagrees with what you actually find in
`sources/20260520_SpaceX_S-1_SEC-Filing.md`, raise it with Kros before
extracting — the S-1 may have been amended.

## Persistent UI shell (above every stage)

Lives above every stage except Stage 0's modal and the Cold Open of
Stage 1 (until the reader scrolls):

1. **Top progress bar.** Full-width hairline with a mono `T - HH:MM:SS`
   countdown that decrements visually with scroll position. Cosmetic
   only.
2. **Bottom-left chapter index.** Collapsed by default; expands to a
   list of stages on click; jump-to with smooth scroll.
3. **Bottom-right controls.** `[ S ]` source toggle (reveals line refs
   beside every content block), `[ ♪ ]` audio toggle (default OFF),
   `[ EN | 中 ]` language toggle, `[ ⓘ ]` reopens the Stage 0 modal.

Treat the shell as a thin telemetry layer over the content, not chrome.

---

## Stage 0 — Mission Briefing modal

**Phase:** 1
**Voice:** third-person, by the site authors
**Source:** authored (no S-1 ref)
**Render:** `<dialog>` modal on first visit; dismiss persists in
localStorage; reopen via `[ ⓘ ]` button.

Up-front disclaimer that this is a fan-made visualization sourced from
the public SEC filing; not affiliated with SpaceX; nothing is
investment advice. Briefly explains the conceit (read the S-1 as a
launch sequence), the source toggle, the audio toggle, and reduced
motion.

ContentNodes: all `kind: 'authored'`, `source: null`.

---

## Stage 1 — Cold Open

**Phase:** 3 (cinematic)
**Voice:** the Musk quote retains attribution; surrounding UI text is
ambient
**Source ranges:**

- Musk quote: **l.577–580** (also repeated at l.6028)

Black screen. The single direct Musk quote from the filing types in
character by character. Starfield reveals behind. Reader scrolls to
begin. Persistent UI fades in once movement starts.

ContentNodes:

- `stage1.cold-open.musk-quote` — `kind: 'quote'`, `verbatim: true`,
  tags `['musk-quote', 'verbatim-required']`.

---

## Stage 2 — Who We Are

**Phase:** 2
**Voice:** first-person SpaceX
**Source ranges:**

- Founding context: **l.589–599**, **l.1219–1221**
- Scale stats: **l.589–664**, **l.774–779**, **l.832–841**, **l.860–873**
- Milestone timeline (~12 entries 2008–2026): **l.914–928**

Make scale feel tangible: number count-ups for headline stats,
clickable milestones revealing source detail. Stage 2 is the warm-up
for the data-heavy stages.

ContentNodes (sketch):

- A handful of `kind: 'kpi'` nodes for the headline stats (launches,
  subscribers, Falcon reuses, etc.).
- A `kind: 'prose'` block for the founding paragraph.
- Twelve `kind: 'milestone'` nodes, one per timeline entry, each
  carrying `milestone: { year, label }`.

---

## Stage 3 — The Three Pillars

**Phase:** 2
**Voice:** first-person SpaceX
**Source ranges:**

- Space (Falcon 9, Falcon Heavy, Dragon, Starship):
  **l.786–808**, **l.627–636**, **l.4681–4750**
- Connectivity (Starlink Consumer, Enterprise, Government /
  Starshield, Starlink Mobile): **l.830–858**, **l.4760–4810**,
  **l.7709–7791**
- AI (COLOSSUS / COLOSSUS II, Grok, X platform, Macrohard, Terafab):
  **l.859–898**, **l.929–1040**, **l.7792–7932**

Let the reader pick a pillar and drill in. Each sub-product gets its
own card with a verbatim or near-verbatim S-1 description and a
source toggle.

---

## Stage 4 — The Algorithm

**Phase:** 2
**Voice:** first-person SpaceX
**Source ranges:**

- Musk's 5-step engineering principle: **l.906**
- Surrounding "Repeatable Business Model" 7-point frame: **l.899–909**

Short, philosophical interlude. Likely a single screen with seven
points stepping in sequentially (with reduced-motion path showing them
all at once).

ContentNodes: 7 prose-style nodes (one per business-model principle)
plus a single quote node for "make less dumb, delete, optimize,
accelerate, automate" at l.906.

---

## Stage 5 — The Roadmap

**Phase:** 3 (cinematic)
**Voice:** first-person SpaceX
**Source ranges:**

- Mission framing / why this matters: **l.700–758**
- Growth Strategies summary: **l.1049–1072**
- Full Growth Strategies in Business: **l.7635–7932**
- Future Markets list: **l.1065–1072**, **l.7938–7962**
- Commercial-viability caveat (mandatory surface): **l.1086–1118**

Three time horizons: near-term (now → end 2026), medium-term
(2027–2029), long-term (2030+). Every marker the reader clicks must
also surface the relevant caveat from the S-1 ("may not achieve
commercial viability...").

ContentNodes: each marker carries its own content block + a reference
to the canonical caveat node (`tags: ['caveat:commercial-viability']`).

---

## Stage 6 — The Numbers

**Phase:** 2
**Voice:** first-person SpaceX
**Source ranges:**

- Summary Consolidated Financial Data: **l.1412–1556**
- MD&A consolidated results: **l.4885–5371**
- Capitalization table: **l.3620–3700** (reproduce in full)
- Use of Proceeds: **l.3575–3601** (reproduce **verbatim**)
- Dividend Policy: **l.3603–3617** (reproduce **verbatim**)
- Segment breakdown 2025: **l.5210–5371**

Layers: headline KPIs → segment performance → cash flow →
Capitalization → Use of Proceeds → Dividend Policy.

Charts must match the financial PDF palette (see
[`voice-and-visual.md`](./voice-and-visual.md)).

The validator enforces verbatim Use of Proceeds and Dividend Policy
nodes (rules 8 and 9 in `content-pipeline.md`).

---

## Stage 7 — The Anomaly Log

**Phase:** 2
**Voice:** first-person SpaceX (the risks are SpaceX's risks)
**Source ranges:**

- Risk Factors summary: **l.1228–1280**
- Full Risk Factors section: ~**l.1600–3500**

Categories (assign `risk.category` per node):

- `mission` — Starship dependency, technologies that don't exist yet
- `operational` — launch failures, satellite ops, supply chain,
  in-orbit safety
- `regulatory` — FAA, FCC, spectrum, foreign regulators, AI regulation
- `financial` — continuing losses, dilution, debt covenants, capital
  intensity
- `governance` — controlled-company exemptions, Musk dependency,
  conflicts of interest, related-party deals
- `sector-ai` — AI nascent stage, AI competition, AI regulation

**Six highlighted disclosures** (set `risk.highlightedDisclosure: true`
and `tags: ['highlighted-disclosure']`):

1. No key-person life insurance on Mr. Musk — **l.3208**
2. In-orbit satellites uninsured by policy — **l.3143**
3. Musk does not devote full time to the business — **l.3209–3211**
4. Musk previously served as Senior Advisor to the President — **l.3213**
5. Cursor termination fee $1.5B + deferred services fee $8.5B —
   **l.1173–1174**
6. Tesla / Macrohard / Terafab terms not yet finalized —
   **l.3157–3160**

Each risk card expandable to its full S-1 source paragraph.

---

## Stage 8 — Who Steers the Ship

**Phase:** 2
**Voice:** first-person SpaceX
**Source ranges:**

- Founder (CEO / CTO / Chairman; also Tesla Technoking, Neuralink,
  Boring Co., former Senior Advisor): **l.1195–1224**, **l.3197–3218**
- Dual-class structure (Class A 1-vote, Class B 10-vote, no sunset,
  Class C reclassified at IPO, Class D authorized but unused):
  **l.80**, **l.1331**, **l.3257–3262**, **l.3651**
- Controlled-company exemptions: **l.1213–1217**, **l.3254–3300**
- Texas reincorporation + Nasdaq Texas + Texas Business Court forum:
  **l.1219–1221**, **l.3420–3434**
- Related-party transactions (Tesla Macrohard / Terafab, Cursor option,
  Anthropic compute, EchoStar spectrum, Bridge Loan, Valor lease):
  **l.1148–1194**, **l.3157–3193**, **l.14383+**

---

## Stage 9 — The Horizon

**Phase:** 3 (cinematic)
**Voice:** first-person SpaceX
**Source ranges:**

- Why this matters now / Kardashev II framing: **l.715–758**
- Future Markets list: **l.1065–1072**
- Lunar economy detail: **l.7666–7708**
- Future Markets in Business detail: **l.7938–7962**
- Closing line — "We are truly building the infrastructure of the
  future" — **l.626**

Every detail panel must surface the S-1's own caveat from
**l.1086–1118** ("may not achieve commercial viability ... timeline
may be difficult or impossible to determine"). Non-dismissible.

The closing line at l.626 is the final beat of the entire stage flow
before End Credits.

---

## Stage 10 — End Credits

**Phase:** 1
**Voice:** third-person (returns to site-authors voice)
**Source ranges:**

- Forward-Looking Statements caveat: **l.3502–3573** (reproduce
  **verbatim**)
- Full Glossary: ~**l.310–565** (all entries, with search)

Authorship, sources, the full Glossary (every entry searchable), and
the verbatim Forward-Looking caveat.

ContentNodes:

- N glossary entries, each `kind: 'glossary'`, with
  `glossary: { term }` and `text.en` as the definition. `verbatim:
true` for all of them.
- A `kind: 'caveat'` node carrying the full Forward-Looking
  Statements section, `verbatim: true`, `tags:
['verbatim-required']`.
- A small set of `kind: 'authored'` nodes for the credits text
  (Kros's authorship line, MIT license blurb, site source on GitHub,
  contact link).

The Forward-Looking caveat node is one of the two checks the
validator enforces as a non-negotiable (see
`content-pipeline.md` rule 8).
