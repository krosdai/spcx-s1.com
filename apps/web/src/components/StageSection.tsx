"use client";

import type { ReactNode } from "react";

import { useUiString } from "../hooks/useLocalized";
import { stageTitleId, type StageWithTitle } from "../lib/uiStrings";

interface StageSectionProps {
  id: StageWithTitle;
  // Optional override — otherwise the title is looked up from the
  // UI-string registry by stage id so locale switching is automatic.
  title?: string;
  eyebrow?: string;
  lede?: ReactNode;
  children: ReactNode;
}

export const StageSection = ({ id, title, eyebrow, lede, children }: StageSectionProps) => {
  const sectionId = `stage-${String(id)}`;
  const titleId = `${sectionId}-title`;
  const eyebrowText = eyebrow ?? `Stage ${String(id).padStart(2, "0")}`;
  const localizedTitle = useUiString(stageTitleId(id));
  const renderedTitle = title ?? localizedTitle;

  return (
    <section
      id={sectionId}
      aria-labelledby={titleId}
      className="min-h-screen border-t border-white/5 px-6 py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
          {eyebrowText}
        </p>
        <h2 id={titleId} className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          {renderedTitle}
        </h2>
        {lede ? <div className="mt-6 max-w-prose text-muted-white">{lede}</div> : null}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
};
