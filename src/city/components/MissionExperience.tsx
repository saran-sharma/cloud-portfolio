import { Suspense, lazy, useCallback, type ComponentType } from "react";
import { ArrowLeft, Map as MapIcon } from "lucide-react";
import { MISSIONS, districtForMission } from "@/city/data/districts";
import { MiniMap } from "@/city/components/MiniMap";
import { XP } from "@/city/state/game-state";
import { useCity } from "@/city/state/CityProvider";
import type { MissionId } from "@/city/types";

type MissionProps = { onComplete: () => void };

const MISSION_COMPONENTS: Record<MissionId, ComponentType<MissionProps>> = {
  pipeline: lazy(() => import("@/city/missions/PipelineMission").then((module) => ({ default: module.PipelineMission }))),
  cost: lazy(() => import("@/city/missions/CostMission").then((module) => ({ default: module.CostMission }))),
  incident: lazy(() => import("@/city/missions/IncidentMission").then((module) => ({ default: module.IncidentMission }))),
  storage: lazy(() => import("@/city/missions/StorageMission").then((module) => ({ default: module.StorageMission }))),
  pim: lazy(() => import("@/city/missions/PimMission").then((module) => ({ default: module.PimMission }))),
  mcp: lazy(() => import("@/city/missions/McpMission").then((module) => ({ default: module.McpMission }))),
  engineer: lazy(() => import("@/city/missions/EngineerMission").then((module) => ({ default: module.EngineerMission }))),
};

export const MissionExperience = ({ id }: { id: MissionId }) => {
  const info = MISSIONS[id];
  const district = districtForMission(id);
  const { progress, completeMission, go, home } = useCity();
  const Mission = MISSION_COMPONENTS[id];
  const done = progress.missions.includes(id);
  const onComplete = useCallback(() => completeMission(id), [completeMission, id]);

  return (
    <section className="sc-mission" style={{ ["--accent" as string]: district.accent }} aria-labelledby="sc-mission-title">
      <header className="sc-mission-head">
        <p className="sc-kicker">MISSION {info.number} · {district.name.toUpperCase()}</p>
        <h1 id="sc-mission-title">{info.title}</h1>
        <p>{info.objective}</p>
        {id !== "engineer" && <p className="sc-sim-badge">Simulation · synthetic data · nothing here is real or confidential</p>}
      </header>

      <Suspense fallback={<p className="sc-loading" role="status">Loading mission...</p>}>
        <Mission onComplete={onComplete} />
      </Suspense>

      {done && (
        <div className="sc-complete" role="status">
          <strong>MISSION COMPLETE</strong>
          <span>+{id === "engineer" ? XP.engineer : XP.mission} exploration XP</span>
        </div>
      )}

      <footer className="sc-mission-foot">
        <button type="button" className="sc-btn is-quiet" onClick={() => go({ name: "district", id: district.id, intro: false })}><ArrowLeft size={16} /> Back to {district.name}</button>
        <button type="button" className="sc-btn is-quiet" onClick={home}><MapIcon size={16} /> City map</button>
      </footer>

      <MiniMap current={district.id} />
    </section>
  );
};
