"use client";

import dynamic from "next/dynamic";

import { useCanCinematic } from "../../hooks/useCanCinematic";

const PlanetHorizon = dynamic(
  () => import("./PlanetHorizon").then((mod) => ({ default: mod.PlanetHorizon })),
  { ssr: false },
);

export const HorizonCinematic = () => {
  const cinematic = useCanCinematic();
  if (!cinematic) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky top-0 -mb-[100vh] h-screen w-full"
    >
      <div className="relative h-full w-full">
        <PlanetHorizon />
      </div>
    </div>
  );
};
