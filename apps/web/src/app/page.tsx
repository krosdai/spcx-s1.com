import type { ReactNode } from "react";
import { byStage, glossary } from "@spcx/content";

import { Algorithm } from "../components/Stage4/Algorithm";
import { AnomalyLog } from "../components/Stage7/AnomalyLog";
import { ColdOpen } from "../components/Stage1/ColdOpen";
import { EndCredits } from "../components/Stage10/EndCredits";
import { Horizon } from "../components/Stage9/Horizon";
import { MissionBriefing } from "../components/Stage0/MissionBriefing";
import { Roadmap } from "../components/Stage5/Roadmap";
import { StagePlaceholder } from "../components/StagePlaceholder";
import { TheNumbers } from "../components/Stage6/TheNumbers";
import { ThreePillars } from "../components/Stage3/ThreePillars";
import { WhoSteers } from "../components/Stage8/WhoSteers";
import { WhoWeAre } from "../components/Stage2/WhoWeAre";
import { STAGES } from "../lib/stages";

export default function Home() {
  const stage0 = byStage(0);
  const stage10 = byStage(10);
  const authored = stage10.filter((node) => node.kind === "authored");
  const caveat = stage10.find(
    (node) => node.id === "stage10.caveat.forward-looking-statements",
  );

  if (!caveat) {
    throw new Error("Missing Stage 10 Forward-Looking Statements caveat");
  }

  const stageRenderers: Record<number, ReactNode> = {
    1: <ColdOpen nodes={byStage(1)} />,
    2: <WhoWeAre nodes={byStage(2)} />,
    3: <ThreePillars nodes={byStage(3)} />,
    4: <Algorithm nodes={byStage(4)} />,
    5: <Roadmap nodes={byStage(5)} />,
    6: <TheNumbers nodes={byStage(6)} />,
    7: <AnomalyLog nodes={byStage(7)} />,
    8: <WhoSteers nodes={byStage(8)} />,
    9: <Horizon nodes={byStage(9)} />,
  };

  return (
    <main>
      <MissionBriefing nodes={stage0} />
      <section
        id="stage-0"
        aria-labelledby="stage-0-title"
        className="flex min-h-screen items-center px-6 py-28"
      >
        <div className="mx-auto w-full max-w-5xl">
          <p className="font-telemetry text-xs uppercase tracking-[0.18em] text-accent-teal">
            Stage 00
          </p>
          <h1 id="stage-0-title" className="mt-4 text-5xl font-semibold">
            Mission Briefing
          </h1>
          <p className="mt-6 max-w-prose text-muted-white">
            This stage opens as a modal on first visit and remains reachable from the
            information control.
          </p>
        </div>
      </section>
      {STAGES.slice(1, 10).map((stage) => {
        const rendered = stageRenderers[stage.id];
        if (rendered) {
          return <div key={stage.id}>{rendered}</div>;
        }
        return (
          <StagePlaceholder
            key={stage.id}
            id={stage.id}
            title={stage.title}
            phase={stage.phase}
          />
        );
      })}
      <EndCredits authored={authored} caveat={caveat} glossary={glossary()} />
    </main>
  );
}
