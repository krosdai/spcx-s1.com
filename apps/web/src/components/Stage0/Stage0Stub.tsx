"use client";

import type { ContentNode } from "@spcx/content";

import { useLocale, useStageEyebrow, useUiString } from "../../hooks/useLocalized";
import { dualText } from "../../lib/localized";

interface Stage0StubProps {
  nodes: ContentNode[];
}

// Stage 0's anchor section. Renders the briefing copy inline so a
// reader who dismissed the modal (or arrived via a deep link or
// chapter-index jump) still has the full context here instead of an
// empty "this stage opened as a modal" placeholder. The modal in
// MissionBriefing.tsx remains the first-visit attention surface; the
// stub is the same content surfaced in the scroll flow.
export const Stage0Stub = ({ nodes }: Stage0StubProps) => {
  const locale = useLocale();
  const title = useUiString("stage.title.0");
  const intro = useUiString("stage0.intro");
  const eyebrow = useStageEyebrow(0);

  return (
    <section
      id="stage-0"
      aria-labelledby="stage-0-title"
      className="flex min-h-screen items-center px-6 py-28"
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
          {eyebrow}
        </p>
        <h1 id="stage-0-title" className="mt-4 text-5xl font-semibold">
          {title}
        </h1>
        <div className="mt-8 max-w-[60ch] space-y-4 text-muted-white">
          {nodes.map((node) => {
            const { primary, secondary } = dualText(node, locale);
            return (
              <p key={node.id}>
                {primary}
                {secondary ? (
                  <span lang="zh" className="mt-1 block text-muted-white/80">
                    {secondary}
                  </span>
                ) : null}
              </p>
            );
          })}
        </div>
        <p className="mt-8 max-w-[60ch] font-telemetry text-xs uppercase tracking-[0.18em] text-muted-white/70">
          {intro}
        </p>
      </div>
    </section>
  );
};
