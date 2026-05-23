"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ContentNode } from "@spcx/content";

import { useLocale } from "../../hooks/useLocalized";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { formatNumericValue, parseNumericValue } from "../../lib/textHelpers";
import { UI_STRINGS, uiString, type UiStringId } from "../../lib/uiStrings";
import { SourceRef } from "../SourceRef";

// Stage 6's six KPIs share two label strings between them (the three
// Revenue cards and the three Net income (loss) cards), so the lookup
// can't use `<node.id>.label` directly — strip the trailing `-YYYY`
// year suffix and try the canonical shared key.
const STAGE6_KPI_KEY = /^(stage6\.kpi\.(?:revenue|net-income))(?:-\d+)?$/;

// Resolve the locale-aware KPI label. The schema's `kpi.label` field
// stays English (it doubles as the aria-label fallback); the zh form
// lives in the uiStrings registry. Falls back to the English schema
// label when no registry entry exists, so adding a new KPI keeps
// working without an immediate translation.
const useLocalizedKpiLabel = (nodeId: string, fallback: string): string => {
  const locale = useLocale();
  const stage6 = STAGE6_KPI_KEY.exec(nodeId);
  const candidate = (stage6 ? `${stage6[1]}.label` : `${nodeId}.label`) as UiStringId;
  if (candidate in UI_STRINGS) {
    return uiString(candidate, locale);
  }
  return fallback;
};

interface KpiProps {
  node: ContentNode;
}

const COUNT_DURATION_MS = 1400;

export const Kpi = ({ node }: KpiProps) => {
  const reducedMotion = useReducedMotion();
  const locale = useLocale();
  const asOfLabel = uiString("kpi.as-of", locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const meta = node.kpi;
  const localizedLabel = useLocalizedKpiLabel(node.id, meta?.label ?? "");
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
      aria-label={`${String(meta.value)}${meta.unit ? ` ${meta.unit}` : ""} ${localizedLabel}`}
    >
      <p className="font-telemetry text-[10px] uppercase tracking-[0.18em] text-muted-white">
        {localizedLabel}
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
          {asOfLabel} {meta.asOf}
        </p>
      ) : null}
      <SourceRef source={node.source} />
    </div>
  );
};
