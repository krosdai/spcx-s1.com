"use client";

import dynamic from "next/dynamic";

import { useCanCinematic } from "../../hooks/useCanCinematic";

const ForwardField = dynamic(
  () => import("./ForwardField").then((mod) => ({ default: mod.ForwardField })),
  { ssr: false },
);

export const RoadmapCinematic = () => {
  const cinematic = useCanCinematic();
  if (!cinematic) return null;

  // Sticky container pinned to the viewport while the reader scrolls
  // through Stage 5's content. Negative bottom margin removes the
  // sticky block from the flow so the content below it sits on top.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 -mb-[100vh] h-screen w-full"
    >
      <div className="relative h-full w-full">
        <ForwardField />
      </div>
    </div>
  );
};
