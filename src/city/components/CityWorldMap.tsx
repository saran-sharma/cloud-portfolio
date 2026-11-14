import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { DISTRICTS, MISSIONS, START_POINT, getDistrict } from "@/city/data/districts";
import { MapArt } from "@/city/components/MapArt";
import { PlayerFace } from "@/city/components/PlayerFace";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import { useCity } from "@/city/state/CityProvider";
import type { District, DistrictId } from "@/city/types";
import { useIsMobile } from "@/hooks/use-mobile";

const missionsDone = (district: District, completed: string[]) => district.missionIds.filter((id) => completed.includes(id)).length;

export const CityWorldMap = () => {
  const { go, progress, playerAt } = useCity();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [hover, setHover] = useState<DistrictId | null>(null);
  const [zoom, setZoom] = useState<DistrictId | null>(null);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const player = playerAt ? getDistrict(playerAt) : START_POINT;
  const active = hover ? getDistrict(hover) : null;
  const zoomed = zoom ? getDistrict(zoom) : null;

  const enter = (district: District) => {
    if (zoom) return;
    if (reduced || isMobile) {
      go({ name: "district", id: district.id });
      return;
    }
    setZoom(district.id);
    timer.current = window.setTimeout(() => go({ name: "district", id: district.id }), 720);
  };

  const routePath = active ? `M${player.x},${player.y} Q${(player.x + active.x) / 2},${Math.min(player.y, active.y) - 70} ${active.x},${active.y}` : null;
  const target = zoomed ?? player;
  const discovered = progress.discovered.length;

  return (
    <section className="sc-map-screen" aria-labelledby="sc-map-title">
      <header className="sc-map-head">
        <p className="sc-kicker">SARAN CITY</p>
        <h1 id="sc-map-title">Choose a district</h1>
        <p>Six districts, each built around real engineering work. Select one to explore it. {discovered} of {DISTRICTS.length} discovered.</p>
      </header>

      <div className={`sc-map-frame ${zoom ? "is-zooming" : ""}`}>
        <div
          className="sc-map-stage"
          style={{ transformOrigin: `${(target.x / 1000) * 100}% ${(target.y / 600) * 100}%` }}
        >
          <MapArt animate={!reduced} />

          <svg className="sc-route" viewBox="0 0 1000 600" aria-hidden="true">
            {routePath && <path key={hover} d={routePath} className="sc-route-line" style={{ stroke: active?.accent }} />}
          </svg>

          {DISTRICTS.map((district) => {
            const done = missionsDone(district, progress.missions);
            const seen = progress.discovered.includes(district.id);
            return (
              <button
                key={district.id}
                type="button"
                className={`sc-marker ${seen ? "is-seen" : "is-new"} ${hover === district.id ? "is-hover" : ""} ${done === district.missionIds.length ? "is-done" : ""}`}
                style={{ left: `${district.x / 10}%`, top: `${district.y / 6}%`, ["--accent" as string]: district.accent }}
                onMouseEnter={() => setHover(district.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(district.id)}
                onBlur={() => setHover(null)}
                onClick={() => enter(district)}
                aria-label={`${district.name}, district ${district.number}. ${seen ? "Discovered" : "Not yet explored"}. Mission: ${district.missionHeadline}. ${done} of ${district.missionIds.length} complete.`}
              >
                <span className="sc-marker-beam" aria-hidden="true" />
                <span className="sc-marker-ring" aria-hidden="true" />
                <span className="sc-marker-core" aria-hidden="true">{district.number}</span>
                <span className="sc-marker-flag" aria-hidden="true">{done === district.missionIds.length ? <Check size={11} strokeWidth={3} /> : "!"}</span>
                <span className="sc-marker-name" aria-hidden="true">{district.name}</span>
              </button>
            );
          })}

          <div className="sc-player" style={{ left: `${player.x / 10}%`, top: `${player.y / 6}%` }} aria-hidden="true">
            <PlayerFace />
            <span className="sc-player-tag">YOU</span>
          </div>

          {active && (
            <div
              className={`sc-tooltip ${active.x > 700 ? "is-left" : ""} ${active.y < 260 ? "is-below" : ""}`}
              style={{ left: `${active.x / 10}%`, top: `${active.y / 6}%`, ["--accent" as string]: active.accent }}
              role="tooltip"
            >
              <b>{active.number} · {active.name}</b>
              <span>{active.tagline}</span>
              <em>Mission: {active.missionHeadline}</em>
            </div>
          )}
        </div>
        <div className="sc-map-fade" aria-hidden="true" />
      </div>

      <ul className="sc-district-list" aria-label="Districts">
        {DISTRICTS.map((district) => {
          const done = missionsDone(district, progress.missions);
          return (
            <li key={district.id}>
              <button type="button" onClick={() => enter(district)} style={{ ["--accent" as string]: district.accent }}>
                <span className="sc-list-number">{district.number}</span>
                <span className="sc-list-text">
                  <strong>{district.name}</strong>
                  <span>{district.tagline}</span>
                  <em>{district.missionHeadline} · {done}/{district.missionIds.length} complete</em>
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      <p className="sc-footnote">Missions: {Object.values(MISSIONS).filter((mission) => mission.id !== "engineer").length} engineering simulations plus the HQ dossier. Exploration XP shows how much of this site you have explored. It is not a measure of skill.</p>
    </section>
  );
};
