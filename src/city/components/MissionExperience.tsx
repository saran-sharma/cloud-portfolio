import { Suspense, lazy, useCallback, type ComponentType } from "react";
import { ArrowLeft, Map as MapIcon } from "lucide-react";
import { MISSIONS, districtForMission } from "@/city/data/districts";
import { MiniMap } from "@/city/components/MiniMap";
import { XP } from "@/city/state/game-state";
import { useCity } from "@/city/state/CityProvider";
import type { MissionId, ScenarioMissionId } from "@/city/types";

type MissionProps = { onComplete: () => void };

const MISSION_COMPONENTS: Record<Exclude<MissionId, ScenarioMissionId>, ComponentType<MissionProps>> = {
  pipeline: lazy(() => import("@/city/missions/PipelineMission").then((module) => ({ default: module.PipelineMission }))),
  cost: lazy(() => import("@/city/missions/CostMission").then((module) => ({ default: module.CostMission }))),
  incident: lazy(() => import("@/city/missions/IncidentMission").then((module) => ({ default: module.IncidentMission }))),
  storage: lazy(() => import("@/city/missions/StorageMission").then((module) => ({ default: module.StorageMission }))),
  pim: lazy(() => import("@/city/missions/PimMission").then((module) => ({ default: module.PimMission }))),
  mcp: lazy(() => import("@/city/missions/McpMission").then((module) => ({ default: module.McpMission }))),
  "harbor-dispatch": lazy(() => import("@/city/missions/HarborDispatchMission").then((module) => ({ default: module.HarborDispatchMission }))),
  engineer: lazy(() => import("@/city/missions/EngineerMission").then((module) => ({ default: module.EngineerMission }))),
};

const OperationsMission = lazy(() => import("@/city/missions/OperationsMission").then((module) => ({ default: module.OperationsMission })));
const isScenario = (id: MissionId): id is ScenarioMissionId => !Object.prototype.hasOwnProperty.call(MISSION_COMPONENTS, id);

export const MissionExperience = ({ id }: { id: MissionId }) => {
  const info = MISSIONS[id];
  const district = districtForMission(id);
  const { progress, completeMission, go, goToMap } = useCity();
  const done = progress.missions.includes(id);
  const onComplete = useCallback(() => completeMission(id), [completeMission, id]);
  const scenario = isScenario(id);
  const Mission = scenario ? null : MISSION_COMPONENTS[id];

  return (
    <section className="sc-mission" style={{ ["--accent" as string]: district.accent }} aria-labelledby="sc-mission-title">
      <header className="sc-mission-head">
        <p className="sc-kicker">MISSION {info.number} · {district.name.toUpperCase()}</p>
        <h1 id="sc-mission-title">{info.title}</h1>
        <p>{info.objective}</p>
        {id !== "engineer" && <p className="sc-sim-badge">Simulation · synthetic data · nothing here is real or confidential</p>}
      </header>

      <Suspense fallback={<p className="sc-loading" role="status">Loading mission...</p>}>
        {scenario ? <OperationsMission id={id} onComplete={onComplete} onExit={() => go({ name: "tour" })} /> : Mission && <Mission onComplete={onComplete} />}
      </Suspense>

      {done && !scenario && id !== "harbor-dispatch" && (
        <div className="sc-complete" role="status">
          <strong>MISSION COMPLETE</strong>
          <span>+{id === "engineer" ? XP.engineer : XP.mission} exploration XP</span>
        </div>
      )}

      <footer className="sc-mission-foot">
        <button type="button" className="sc-btn is-quiet" onClick={() => go({ name: "district", id: district.id, intro: false })}><ArrowLeft size={16} /> Back to {district.name}</button>
        <button type="button" className="sc-btn is-quiet" onClick={goToMap}><MapIcon size={16} /> City map</button>
      </footer>

      <MiniMap current={district.id} />
    </section>
  );
};
