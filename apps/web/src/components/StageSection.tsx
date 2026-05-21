import type { ReactNode } from "react";

interface StageSectionProps {
  id: number;
  title: string;
  eyebrow?: string;
  lede?: ReactNode;
  children: ReactNode;
}

export const StageSection = ({ id, title, eyebrow, lede, children }: StageSectionProps) => {
  const sectionId = `stage-${String(id)}`;
  const titleId = `${sectionId}-title`;
  const eyebrowText = eyebrow ?? `Stage ${String(id).padStart(2, "0")}`;

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
          {title}
        </h2>
        {lede ? <div className="mt-6 max-w-prose text-muted-white">{lede}</div> : null}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
};
