"use client";

import type { ContentNode } from "@spcx/content";

import { useLocale, useUiString } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";
import { splitReflowedParagraphs } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";
import { StageSection } from "../StageSection";
import { Kpi } from "./Kpi";

interface WhoWeAreProps {
  nodes: ContentNode[];
}

export const WhoWeAre = ({ nodes }: WhoWeAreProps) => {
  const locale = useLocale();
  const kpisAria = useUiString("stage2.kpis.aria");
  const milestonesHeading = useUiString("stage2.milestones.heading");
  const prose = nodes.filter((node) => node.kind === "prose");
  const kpis = nodes.filter((node) => node.kind === "kpi");
  const milestones = nodes
    .filter((node) => node.kind === "milestone")
    .sort((a, b) => (a.milestone?.year ?? 0) - (b.milestone?.year ?? 0));

  return (
    <StageSection id={2}>
      <div className="space-y-20">
        <div className="grid gap-4 md:grid-cols-3" role="list" aria-label={kpisAria}>
          {kpis.map((node) => (
            <div key={node.id} role="listitem">
              <Kpi node={node} />
            </div>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {prose.map((node) => {
            const { primary, secondary } = dualText(node, locale);
            // The S-1 source file hard-wraps every paragraph at ~110
            // chars for the PDF; `splitReflowedParagraphs` collapses
            // those intra-paragraph wraps and returns each paragraph
            // separately so we can emit one `<p>` per paragraph.
            // Rendering everything in a single `<p>` would silently
            // drop the paragraph boundaries (HTML collapses inner
            // newlines), turning multi-paragraph nodes into a run-on
            // wall of text.
            const primaryParagraphs = splitReflowedParagraphs(primary);
            const secondaryParagraphs = secondary ? splitReflowedParagraphs(secondary) : [];
            return (
              <article key={node.id} className="space-y-4">
                <div className="space-y-4 font-body text-base leading-7 text-body-white">
                  {primaryParagraphs.map((paragraph, idx) => (
                    <p key={`${node.id}-en-${String(idx)}`}>{paragraph}</p>
                  ))}
                </div>
                {secondaryParagraphs.length > 0 ? (
                  <div
                    lang="zh"
                    className="space-y-3 border-l border-white/15 pl-3 font-body text-sm leading-7 text-muted-white/80"
                  >
                    {secondaryParagraphs.map((paragraph, idx) => (
                      <p key={`${node.id}-zh-${String(idx)}`}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
                <SourceRef source={node.source} />
              </article>
            );
          })}
        </div>

        <div>
          <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-amber">
            {milestonesHeading}
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
