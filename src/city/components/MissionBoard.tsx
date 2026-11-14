import { ArrowRight, Check, Swords } from "lucide-react";
import { MISSIONS } from "@/city/data/districts";
import { useCity } from "@/city/state/CityProvider";
import type { District } from "@/city/types";

export const MissionBoard = ({ district }: { district: District }) => {
  const { go, progress } = useCity();
  return (
    <section className="sc-missions" aria-labelledby={`missions-${district.id}`}>
      <h2 id={`missions-${district.id}`}>Mission: {district.missionHeadline}</h2>
      <ul>
        {district.missionIds.map((id) => {
          const mission = MISSIONS[id];
          const done = progress.missions.includes(id);
          return (
            <li key={id} className={done ? "is-done" : ""}>
              <span className="sc-mission-number">{mission.number}</span>
              <div>
                <h3>{mission.title}</h3>
                <p>{mission.objective}</p>
                <p className="sc-status">{done ? <><Check size={14} /> Complete</> : <><Swords size={14} /> Available</>}{id !== "engineer" ? " · simulation with synthetic data" : ""}</p>
              </div>
              <button type="button" className="sc-btn" onClick={() => go({ name: "mission", id })}>
                {done ? "Replay mission" : "Start mission"} <ArrowRight size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
