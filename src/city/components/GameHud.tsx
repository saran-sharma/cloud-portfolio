import { useState } from "react";
import { ArrowLeft, ChevronDown, Download, Home, Map, Users } from "lucide-react";
import { DISTRICTS } from "@/city/data/districts";
import { ProgressTracker } from "@/city/components/AchievementSystem";
import { useCity } from "@/city/state/CityProvider";
import { portfolio } from "@/data/portfolio";
import { trackResumeDownload } from "@/lib/analytics";

/** Persistent in-game navigation. Recruiter Mode is always one click away. */
export const GameNavigation = () => {
  const { scene, canGoBack, back, goHome, goToMap, go, setMode } = useCity();
  const [open, setOpen] = useState(false);

  return (
    <header className="sc-hud">
      <div className="sc-hud-left">
        <button type="button" className="sc-hud-btn is-home" onClick={goHome} title="Back to the title screen">
          <span className="sc-hud-brand" aria-hidden="true">SARAN<span>.OS</span></span>
          <Home size={16} aria-hidden="true" />
          <span className="sc-hud-home-label">Home</span>
        </button>
        {scene.name !== "map" && (
          <>
            <button type="button" className="sc-hud-btn" aria-label={canGoBack ? "Back to the previous screen" : "Back to the city map"} onClick={canGoBack ? back : goToMap}><ArrowLeft size={16} aria-hidden="true" /> <span>Back</span></button>
            <button type="button" className="sc-hud-btn" aria-label="Map" title="City map" onClick={goToMap}><Map size={16} aria-hidden="true" /> <span>Map</span></button>
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
        <a className="sc-hud-btn is-resume" href={portfolio.profile.resumeUrl} download aria-label="Download resume" onClick={() => trackResumeDownload("game_hud")}><Download size={16} aria-hidden="true" /> <span>Resume</span></a>
        <button type="button" className="sc-recruiter" aria-label="Recruiter Mode" onClick={() => setMode("recruiter")}><Users size={16} aria-hidden="true" /> <span>Recruiter<span className="sc-hud-mode-label"> Mode</span></span></button>
      </div>
    </header>
  );
};
