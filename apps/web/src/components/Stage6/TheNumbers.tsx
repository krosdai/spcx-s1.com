"use client";

import type { ContentNode } from "@spcx/content";

import { useLocale } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";
import { cleanProse } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";
import { Kpi } from "../Stage2/Kpi";

interface TheNumbersProps {
  nodes: ContentNode[];
}

const VERBATIM_CALLOUT_IDS = new Set([
  "stage6.financials.use-of-proceeds",
  "stage6.financials.dividend-policy",
]);

const DETAIL_ORDER = [
  "stage6.financials.summary-data",
  "stage6.financials.mda-results",
  "stage6.financials.capitalization",
  "stage6.financials.segment-breakdown-2025",
];

export const TheNumbers = ({ nodes }: TheNumbersProps) => {
  const locale = useLocale();
  const kpis = nodes.filter((node) => node.kind === "kpi");
  const revenueKpis = kpis.filter((node) => node.id.startsWith("stage6.kpi.revenue"));
  const netIncomeKpis = kpis.filter((node) => node.id.startsWith("stage6.kpi.net-income"));

  const callouts = nodes.filter((node) => VERBATIM_CALLOUT_IDS.has(node.id));
  const details = DETAIL_ORDER.map((id) => nodes.find((node) => node.id === id)).filter(
    (node): node is ContentNode => Boolean(node),
  );

  return (
    <StageSection id={6}>
      <div className="space-y-16">
        <section aria-labelledby="stage-6-revenue-title">
          <h3
            id="stage-6-revenue-title"
            className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal"
          >
            Revenue trajectory
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {revenueKpis.map((node) => (
              <Kpi key={node.id} node={node} />
            ))}
          </div>
        </section>

        <section aria-labelledby="stage-6-net-income-title">
          <h3
            id="stage-6-net-income-title"
            className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-coral"
          >
            Net income (loss)
          </h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {netIncomeKpis.map((node) => (
              <Kpi key={node.id} node={node} />
            ))}
          </div>
        </section>

        {callouts.map((node) => {
          const { primary, secondary } = dualText(node, locale);
          return (
            <section
              key={node.id}
              aria-labelledby={`${node.id}-title`}
              className="border-l-2 border-accent-amber bg-panel-black/40 p-6"
            >
              <p className="font-telemetry text-[11px] uppercase tracking-[0.18em] text-accent-amber">
                Verbatim — {node.source?.sectionTitle ?? "Section"}
              </p>
              <h3
                id={`${node.id}-title`}
                className="mt-3 text-2xl font-semibold text-body-white"
              >
                {node.source?.sectionTitle}
              </h3>
              <pre className="mt-5 whitespace-pre-wrap font-body text-sm leading-7 text-muted-white">
                {cleanProse(primary)}
              </pre>
              {secondary ? (
                <pre
                  lang="zh"
                  className="mt-4 whitespace-pre-wrap border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80"
                >
                  {cleanProse(secondary)}
                </pre>
              ) : null}
              <SourceRef source={node.source} />
            </section>
          );
        })}

        <section aria-labelledby="stage-6-tables-title">
          <h3
            id="stage-6-tables-title"
            className="font-telemetry text-xs uppercase tracking-[0.18em] text-muted-white"
          >
            Full financial detail
          </h3>
          <div className="mt-6 space-y-4">
            {details.map((node) => {
              const { primary, secondary } = dualText(node, locale);
              return (
                <details
                  key={node.id}
                  className="group border border-white/10 bg-panel-black/40"
                >
                  <summary className="cursor-pointer px-5 py-4 font-telemetry text-xs uppercase tracking-[0.16em] text-body-white hover:text-accent-teal">
                    {node.source?.sectionTitle ?? node.id}
                  </summary>
                  <div className="border-t border-white/10 px-5 py-4">
                    <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap font-telemetry text-[12px] leading-6 text-muted-white">
                      {cleanProse(primary)}
                    </pre>
                    {secondary ? (
                      <pre
                        lang="zh"
                        className="mt-4 max-h-[60vh] overflow-auto whitespace-pre-wrap border-l border-white/15 pl-3 font-telemetry text-[12px] leading-6 text-muted-white/80"
                      >
                        {cleanProse(secondary)}
                      </pre>
                    ) : null}
                    <SourceRef source={node.source} />
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      </div>
    </StageSection>
  );
};
