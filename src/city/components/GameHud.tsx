import { useState } from "react";
import { ArrowLeft, ChevronDown, Download, Home, Users } from "lucide-react";
import { DISTRICTS } from "@/city/data/districts";
import { ProgressTracker } from "@/city/components/AchievementSystem";
import { useCity } from "@/city/state/CityProvider";
import { portfolio } from "@/data/portfolio";

/** Persistent in-game navigation. Recruiter Mode is always one click away. */
export const GameNavigation = () => {
  const { scene, canGoBack, back, home, go, setMode } = useCity();
  const [open, setOpen] = useState(false);

  return (
    <header className="sc-hud">
      <div className="sc-hud-left">
        <button type="button" className="sc-hud-brand" onClick={home} aria-label="SARAN.OS, go to the city map">SARAN<span>.OS</span></button>
        {scene.name !== "map" && (
          <>
            <button type="button" className="sc-hud-btn" onClick={canGoBack ? back : home}><ArrowLeft size={16} /> <span>Back</span></button>
            <button type="button" className="sc-hud-btn" onClick={home}><Home size={16} /> <span>Map</span></button>
          </>
        )}
        <div className="sc-hud-menu">
          <button type="button" className="sc-hud-btn" aria-label="Districts" aria-expanded={open} aria-controls="sc-district-menu" onClick={() => setOpen((value) => !value)}>
            <span>Districts</span> <ChevronDown size={14} />
          </button>
          {open && (
            <ul id="sc-district-menu" className="sc-hud-dropdown">
              {DISTRICTS.map((district) => (
                <li key={district.id}>
                  <button type="button" style={{ ["--accent" as string]: district.accent }} onClick={() => { setOpen(false); go({ name: "district", id: district.id }); }}>
                    <b>{district.number}</b> {district.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="sc-hud-right">
        <ProgressTracker />
        <a className="sc-hud-btn is-resume" href={portfolio.profile.resumeUrl} download aria-label="Download resume"><Download size={16} /> <span>Resume</span></a>
        <button type="button" className="sc-recruiter" onClick={() => setMode("recruiter")}><Users size={16} /> <span>Recruiter Mode</span></button>
      </div>
    </header>
  );
};
