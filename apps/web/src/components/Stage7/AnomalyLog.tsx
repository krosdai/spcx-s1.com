"use client";

import type { ContentNode, RiskCategory } from "@spcx/content";

import { useLocale } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";
import { cleanProse } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";

interface AnomalyLogProps {
  nodes: ContentNode[];
}

const CATEGORY_ORDER: { key: RiskCategory; label: string }[] = [
  { key: "mission", label: "Mission" },
  { key: "operational", label: "Operational" },
  { key: "regulatory", label: "Regulatory" },
  { key: "financial", label: "Financial" },
  { key: "governance", label: "Governance" },
  { key: "sector-ai", label: "Sector — AI" },
];

const SEVERITY_LABEL: Record<
  NonNullable<NonNullable<ContentNode["risk"]>["severity"]>,
  string
> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const TITLE_OVERRIDES: Record<string, string> = {
  "stage7.summary.principal-risk-factors": "Principal risk factors (summary)",
  "stage7.taxonomy.mission-starship": "Mission — Starship dependency",
  "stage7.taxonomy.regulatory-approvals": "Regulatory — approvals & spectrum",
  "stage7.taxonomy.operational-space-systems": "Operational — space systems",
  "stage7.taxonomy.sector-ai-infrastructure": "Sector — AI infrastructure",
  "stage7.taxonomy.financial-capital-markets": "Financial — capital markets",
  "stage7.taxonomy.governance-ownership": "Governance — ownership structure",
  "stage7.highlight.in-orbit-satellites-uninsured": "In-orbit satellites uninsured by policy",
  "stage7.highlight.no-key-person-insurance-musk": "No key-person life insurance on Mr. Musk",
  "stage7.highlight.musk-not-full-time": "Mr. Musk does not devote full time to the business",
  "stage7.highlight.musk-senior-advisor":
    "Mr. Musk previously served as Senior Advisor to the President",
  "stage7.highlight.cursor-fees": "Cursor — $1.5B termination + $8.5B deferred services fee",
  "stage7.highlight.tesla-macrohard-terafab-unfinalized":
    "Tesla / Macrohard / Terafab terms not yet finalized",
  "stage7.caveat.commercial-viability-crosslink": "Commercial-viability caveat (cross-link)",
};

const RiskCard = ({ node, dense = false }: { node: ContentNode; dense?: boolean }) => {
  const risk = node.risk;
  const title = TITLE_OVERRIDES[node.id] ?? node.id;
  const locale = useLocale();
  const { primary, secondary } = dualText(node, locale);

  return (
    <details className="border border-white/10 bg-panel-black/60">
      <summary className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 hover:bg-white/[0.04]">
        {risk?.severity ? (
          <span
            aria-label={`Severity ${SEVERITY_LABEL[risk.severity]}`}
            className="font-telemetry text-[10px] uppercase tracking-[0.16em] text-accent-coral"
          >
            {SEVERITY_LABEL[risk.severity]}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
        <span className={dense ? "text-sm text-body-white" : "text-base text-body-white"}>
          {title}
        </span>
        {risk?.category ? (
          <span className="font-telemetry text-[10px] uppercase tracking-[0.16em] text-muted-white">
            {risk.category}
          </span>
        ) : (
          <span aria-hidden="true" />
        )}
      </summary>
      <div className="border-t border-white/10 px-5 py-4">
        <pre className="whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
          {cleanProse(primary)}
        </pre>
        {secondary ? (
          <pre className="mt-4 whitespace-pre-wrap border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80">
            {cleanProse(secondary)}
          </pre>
        ) : null}
        <SourceRef source={node.source} />
      </div>
    </details>
  );
};

export const AnomalyLog = ({ nodes }: AnomalyLogProps) => {
  const locale = useLocale();
  const summary = nodes.find((node) => node.id === "stage7.summary.principal-risk-factors");
  const highlights = nodes.filter((node) => node.tags?.includes("highlighted-disclosure"));
  const taxonomy = nodes.filter((node) => node.id.startsWith("stage7.taxonomy."));
  const caveat = nodes.find(
    (node) => node.id === "stage7.caveat.commercial-viability-crosslink",
  );
  const summaryDual = summary ? dualText(summary, locale) : null;
  const caveatDual = caveat ? dualText(caveat, locale) : null;

  const byCategory = new Map<RiskCategory, ContentNode[]>();
  for (const node of taxonomy) {
    const category = node.risk?.category;
    if (!category) continue;
    const existing = byCategory.get(category) ?? [];
    existing.push(node);
    byCategory.set(category, existing);
  }

  return (
    <StageSection id={7}>
      <div className="space-y-16">
        {summary && summaryDual ? (
          <section aria-labelledby="stage-7-summary-title">
            <h3
              id="stage-7-summary-title"
              className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-coral"
            >
              Principal risk factors
            </h3>
            <details className="mt-4 border border-white/10 bg-panel-black/60">
              <summary className="cursor-pointer px-5 py-4 font-telemetry text-xs uppercase tracking-[0.16em] text-body-white hover:text-accent-coral">
                Read the summary
              </summary>
              <div className="border-t border-white/10 px-5 py-4">
                <pre className="whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
                  {cleanProse(summaryDual.primary)}
                </pre>
                {summaryDual.secondary ? (
                  <pre className="mt-4 whitespace-pre-wrap border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80">
                    {cleanProse(summaryDual.secondary)}
                  </pre>
                ) : null}
                <SourceRef source={summary.source} />
              </div>
            </details>
          </section>
        ) : null}

        <section aria-labelledby="stage-7-highlighted-title">
          <h3
            id="stage-7-highlighted-title"
            className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-coral"
          >
            Highlighted disclosures
          </h3>
          <p className="mt-3 max-w-[68ch] text-sm text-muted-white">
            Six specific items the S-1 calls out and we surface verbatim. Each links back to the
            exact line range of the filing.
          </p>
          <div className="mt-6 space-y-3">
            {highlights.map((node) => (
              <RiskCard key={node.id} node={node} />
            ))}
          </div>
        </section>

        <section aria-labelledby="stage-7-taxonomy-title">
          <h3
            id="stage-7-taxonomy-title"
            className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-coral"
          >
            Risk taxonomy
          </h3>
          <div className="mt-6 space-y-8">
            {CATEGORY_ORDER.map(({ key, label }) => {
              const items = byCategory.get(key) ?? [];
              if (items.length === 0) return null;
              return (
                <div key={key}>
                  <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-muted-white">
                    {label}
                  </p>
                  <div className="mt-3 space-y-3">
                    {items.map((node) => (
                      <RiskCard key={node.id} node={node} dense />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {caveat && caveatDual ? (
          <section
            aria-labelledby="stage-7-caveat-title"
            className="border-l-2 border-accent-amber bg-panel-black/40 p-6"
          >
            <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-amber">
              Cross-link — Commercial viability caveat
            </p>
            <h3
              id="stage-7-caveat-title"
              className="mt-3 text-2xl font-semibold text-body-white"
            >
              Commercial viability of new markets is uncertain
            </h3>
            <pre className="mt-5 whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
              {cleanProse(caveatDual.primary)}
            </pre>
            {caveatDual.secondary ? (
              <pre className="mt-4 whitespace-pre-wrap border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80">
                {cleanProse(caveatDual.secondary)}
              </pre>
            ) : null}
            <SourceRef source={caveat.source} />
          </section>
        ) : null}
      </div>
    </StageSection>
  );
};
