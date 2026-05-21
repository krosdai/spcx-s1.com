"use client";

import { useEffect, useRef } from "react";
import type { ContentNode } from "@spcx/content";

import { useUIStore } from "../../stores/uiStore";

interface MissionBriefingProps {
  nodes: ContentNode[];
}

export const MissionBriefing = ({ nodes }: MissionBriefingProps) => {
  const open = useUIStore((state) => state.modalOpen);
  const hasHydrated = useUIStore((state) => state.hasHydrated);
  const dismiss = useUIStore((state) => state.dismissModal);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    // Wait for the persisted store to hydrate before deciding whether to
    // open the dialog — otherwise returning visitors with `modalDismissed:
    // true` would see the modal flash open during hydration before the
    // store rehydrates and closes it.
    if (!hasHydrated) return;

    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [hasHydrated, open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="mission-briefing-title"
      className="w-[min(42rem,calc(100vw-2rem))] border border-white/20 bg-panel-black p-0 text-body-white backdrop:bg-black/80"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className="p-6 sm:p-8">
        <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
          Stage 00
        </p>
        <h1 id="mission-briefing-title" className="mt-3 text-3xl font-semibold leading-tight">
          Mission Briefing
        </h1>
        <div className="mt-6 space-y-4 text-sm text-muted-white sm:text-base">
          {nodes.map((node) => (
            <p key={node.id}>{node.text.en}</p>
          ))}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-8 border border-white/25 px-4 py-2 font-telemetry text-xs uppercase tracking-[0.14em] text-body-white hover:border-accent-teal"
        >
          Begin
        </button>
      </div>
    </dialog>
  );
};
