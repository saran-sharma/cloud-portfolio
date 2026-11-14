import { useCallback, useEffect, useState } from "react";
import { Compass, Download, Play, Users } from "lucide-react";
import { Portrait } from "@/city/components/Portrait";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import { useCity } from "@/city/state/CityProvider";
import { portfolio } from "@/data/portfolio";

const CINEMATIC_MS = 4200;

export const SaranOSIntro = () => {
  const { progress, markIntroSeen, go, setMode } = useCity();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"cinematic" | "menu">(() => (progress.introSeen ? "menu" : "cinematic"));
  const showMenu = phase === "menu" || reduced;

  const finish = useCallback(() => {
    markIntroSeen();
    setPhase("menu");
  }, [markIntroSeen]);

  useEffect(() => {
    if (phase !== "cinematic") return;
    if (reduced) {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, CINEMATIC_MS);
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, reduced, finish]);

  return (
    <section className={`sc-intro ${showMenu ? "is-menu" : "is-cinematic"}`} aria-labelledby="sc-title" onPointerDown={showMenu ? undefined : finish}>
      <div className="sc-intro-sky" aria-hidden="true">
        <i className="sc-sun" />
        <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" focusable="false">
          <path d="M0,300 V210 h60 v-70 h50 v40 h40 v-110 h46 v150 h70 v-60 h56 v90 h80 v-130 h40 v100 h90 v-50 h60 v120 h110 v-90 h54 v-120 h46 v150 h70 v-80 h60 v110 h86 v-150 h40 v180 h70 v-70 h56 v100 h80 V300 Z" fill="#0b0720" />
          {[160, 420, 1180].map((x) => (
            <g key={x} transform={`translate(${x} 300)`}>
              <path d="M0,0 Q8,-80 -4,-150" stroke="#08041a" strokeWidth="10" fill="none" />
              {[[-70, -30], [70, -30], [-56, 12], [56, 12], [0, -64]].map(([dx, dy], index) => <path key={index} d={`M-4,-150 Q${dx / 2},${-150 + dy - 20} ${dx},${-150 + dy + 28}`} stroke="#08041a" strokeWidth="7" fill="none" />)}
            </g>
          ))}
        </svg>
      </div>

      <div className="sc-intro-grid">
        <div className="sc-intro-copy">
          <p className="sc-presents">SARAN.OS PRESENTS</p>
          <h1 id="sc-title">SARAN CITY</h1>
          <p className="sc-subtitle">THE ENGINEERING CHRONICLES</p>
          <p className="sc-quote">&ldquo;Every system has a story. Explore mine.&rdquo;</p>

          <nav className="sc-menu" aria-label="Main menu">
            <button type="button" onClick={() => go({ name: "profile" })}><Play size={18} /> Start your journey</button>
            <button type="button" onClick={() => go({ name: "map" })}><Compass size={18} /> Enter Saran City</button>
            <button type="button" onClick={() => setMode("recruiter")}><Users size={18} /> Recruiter Mode</button>
            <a href={portfolio.profile.resumeUrl} download><Download size={18} /> Download resume</a>
          </nav>
          <p className="sc-menu-note">Click-to-explore. No keyboard controls needed, and no sound.</p>
        </div>

        <Portrait className="is-intro" caption="SARAN S. · DATA PLATFORM ENGINEER" />
      </div>

      {!showMenu && <button type="button" className="sc-skip" onClick={finish}>Skip intro</button>}
      {!showMenu && <button type="button" className="sc-recruiter is-floating" onClick={() => setMode("recruiter")}><Users size={16} /> <span>Recruiter Mode</span></button>}
      <div className="sc-letterbox" aria-hidden="true" />
    </section>
  );
};
