"use client";

import type { ContentNode } from "@spcx/content";

import { useLocale } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";
import { Kpi } from "./Kpi";

interface WhoWeAreProps {
  nodes: ContentNode[];
}

export const WhoWeAre = ({ nodes }: WhoWeAreProps) => {
  const locale = useLocale();
  const prose = nodes.filter((node) => node.kind === "prose");
  const kpis = nodes.filter((node) => node.kind === "kpi");
  const milestones = nodes
    .filter((node) => node.kind === "milestone")
    .sort((a, b) => (a.milestone?.year ?? 0) - (b.milestone?.year ?? 0));

  return (
    <StageSection id={2}>
      <div className="space-y-20">
        <div
          className="grid gap-4 md:grid-cols-3"
          role="list"
          aria-label="Headline scale metrics"
        >
          {kpis.map((node) => (
            <div key={node.id} role="listitem">
              <Kpi node={node} />
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {prose.map((node) => {
            const { primary, secondary } = dualText(node, locale);
            return (
              <article key={node.id} className="space-y-4">
                <p className="whitespace-pre-wrap font-body text-base leading-7 text-body-white">
                  {primary}
                </p>
                {secondary ? (
                  <p
                    lang="zh"
                    className="whitespace-pre-wrap border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80"
                  >
                    {secondary}
                  </p>
                ) : null}
                <SourceRef source={node.source} />
              </article>
            );
          })}
        </div>

        <div>
          <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-amber">
            Milestones
          </p>
          <ol className="mt-6 space-y-5 border-l border-white/15 pl-6">
            {milestones.map((node) => (
              <li key={node.id} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[34px] top-2 h-2.5 w-2.5 border border-accent-teal bg-space-black"
                />
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                  <span className="font-telemetry text-sm tabular-nums text-accent-teal">
                    {node.milestone?.year ?? "—"}
                  </span>
                  <span className="text-body-white">{node.milestone?.label ?? ""}</span>
                </div>
                <SourceRef source={node.source} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </StageSection>
  );
};
