import { useCallback, useEffect, useState } from "react";
import { Compass, Download, Play, RotateCcw, Users } from "lucide-react";
import { Portrait } from "@/city/components/Portrait";
import { CitySkyline } from "@/city/components/CitySkyline";
import { useSkyParallax } from "@/city/hooks/use-sky-parallax";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import { useCity } from "@/city/state/CityProvider";
import { gameIntroVideo, shouldPlayIntroVideo } from "@/city/videos";
import { portfolio } from "@/data/portfolio";
import { trackResumeDownload } from "@/lib/analytics";

const CINEMATIC_MS = 4200;
const VIDEO_MAX_MS = 8000;

export const SaranOSIntro = () => {
  const { progress, markIntroSeen, go, setMode } = useCity();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"cinematic" | "menu">(() => (progress.introSeen ? "menu" : "cinematic"));
  const [returning, setReturning] = useState(progress.introSeen);
  const showMenu = phase === "menu" || reduced;
  const sky = useSkyParallax<HTMLElement>();
  const videoCinematic = !showMenu && gameIntroVideo.hasVideo && shouldPlayIntroVideo();

  const finish = useCallback(() => {
    markIntroSeen();
    setPhase("menu");
  }, [markIntroSeen]);

  const replay = useCallback(() => {
    if (reduced) return;
    setReturning(false);
    setPhase("cinematic");
  }, [reduced]);

  useEffect(() => {
    if (phase !== "cinematic") return;
    if (reduced) {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, videoCinematic ? VIDEO_MAX_MS : CINEMATIC_MS);
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, reduced, finish, videoCinematic]);

  return (
    <section ref={sky} className={`sc-intro ${showMenu ? "is-menu" : "is-cinematic"} ${returning ? "is-returning" : ""}`} aria-labelledby="sc-title" onPointerDown={showMenu ? undefined : finish}>
      <div className="sc-intro-sky" aria-hidden="true">
        <i className="sc-sun" />
        <CitySkyline />
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
            <a href={portfolio.profile.resumeUrl} download onClick={() => trackResumeDownload("game_intro")}><Download size={18} /> Download resume</a>
          </nav>
          <div className="sc-menu-foot">
            <p className="sc-menu-note">Click-to-explore. No keyboard controls needed, and no sound.</p>
            {showMenu && !reduced && (
              <button type="button" className="sc-replay" onClick={replay}>
                <RotateCcw size={14} /> Replay intro
              </button>
            )}
          </div>
        </div>

        <Portrait className="is-intro" caption="SARAN S. · DATA PLATFORM ENGINEER" videoActive={!showMenu && !reduced} onVideoEnd={finish} />
      </div>

      {!showMenu && <button type="button" className="sc-skip" onPointerDown={(event) => event.stopPropagation()} onClick={finish}>Skip intro</button>}
      {!showMenu && <button type="button" className="sc-recruiter is-floating" onPointerDown={(event) => event.stopPropagation()} onClick={() => setMode("recruiter")}><Users size={16} /> <span>Recruiter Mode</span></button>}
      <div className="sc-letterbox" aria-hidden="true" />
    </section>
  );
};
