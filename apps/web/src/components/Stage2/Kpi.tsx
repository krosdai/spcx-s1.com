"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ContentNode } from "@spcx/content";

import { useReducedMotion } from "../../hooks/useReducedMotion";
import { formatNumericValue, parseNumericValue } from "../../lib/textHelpers";
import { SourceRef } from "../SourceRef";

interface KpiProps {
  node: ContentNode;
}

const COUNT_DURATION_MS = 1400;

export const Kpi = ({ node }: KpiProps) => {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const meta = node.kpi;
  const rawValue = meta?.value;
  const parsed = useMemo(
    () => (rawValue !== undefined ? parseNumericValue(rawValue) : null),
    [rawValue],
  );
  // SSR and no-JS readers see the verbatim value; clients with motion
  // briefly reset to 0 inside the IntersectionObserver callback before
  // counting up. Static export's initial paint always carries truth.
  const [display, setDisplay] = useState<string>(() => (meta ? String(meta.value) : ""));

  useEffect(() => {
    if (!parsed || rawValue === undefined) return;
    const finalDisplay = String(rawValue);

    if (reducedMotion) {
      setDisplay(finalDisplay);
      return;
    }

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setDisplay(finalDisplay);
      return;
    }

    let raf = 0;
    let started = false;

    const run = () => {
      setDisplay(formatNumericValue(0, parsed));
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
        const eased = 1 - Math.pow(1 - progress, 3);
        const next = eased * parsed.target;
        setDisplay(progress < 1 ? formatNumericValue(next, parsed) : finalDisplay);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            run();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [parsed, rawValue, reducedMotion]);

  if (!meta) return null;

  return (
    <div
      ref={containerRef}
      className="border border-white/10 bg-panel-black/60 p-6"
      aria-label={`${String(meta.value)}${meta.unit ? ` ${meta.unit}` : ""} ${meta.label ?? ""}`}
    >
      <p className="font-telemetry text-[10px] uppercase tracking-[0.18em] text-muted-white">
        {meta.label}
      </p>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-5xl font-semibold tabular-nums text-body-white">
          {display}
        </span>
        {meta.unit ? (
          <span className="font-telemetry text-sm text-muted-white">{meta.unit}</span>
        ) : null}
      </p>
      {meta.asOf ? (
        <p className="mt-3 font-telemetry text-[11px] uppercase tracking-[0.12em] text-muted-white">
          As of {meta.asOf}
        </p>
      ) : null}
      <SourceRef source={node.source} />
    </div>
  );
};
