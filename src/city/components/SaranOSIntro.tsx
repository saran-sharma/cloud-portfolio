import { useCallback, useEffect, useRef, useState } from "react";
import { Compass, Download, Play, RotateCcw, Users } from "lucide-react";
import { Portrait } from "@/city/components/Portrait";
import { CitySkyline } from "@/city/components/CitySkyline";
import { useSkyParallax } from "@/city/hooks/use-sky-parallax";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import { useCity } from "@/city/state/CityProvider";
import { characterAlt } from "@/city/character";
import { FILM_HOME_QUERY, gameIntroVideo, shouldPlayIntroVideo } from "@/city/videos";
import { portfolio } from "@/data/portfolio";
import { trackResumeDownload } from "@/lib/analytics";

const CINEMATIC_MS = 4200;
// The clip is about 8 s. This only guards against an `ended` event that never arrives.
const VIDEO_MAX_MS = 12000;
// If playback has not started by then (slow network, autoplay refused, missing file), use the code-based intro.
const VIDEO_START_MS = 5000;
const FADE_MS = 900;

type Phase = "video" | "cinematic" | "menu";

const firstPhase = (introSeen: boolean): Phase => (introSeen ? "menu" : shouldPlayIntroVideo() ? "video" : "cinematic");

const matchesWide = () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(FILM_HOME_QUERY).matches;

/** True on screens wide enough for the film home. It follows the window, so rotating or resizing re-lays out. */
function useWideScreen() {
  const [wide, setWide] = useState(matchesWide);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(FILM_HOME_QUERY);
    const update = () => setWide(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return wide;
}

export const SaranOSIntro = () => {
  const { progress, markIntroSeen, go, setMode } = useCity();
  const reduced = useReducedMotion();
  const wide = useWideScreen();
  const [stillFailed, setStillFailed] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => firstPhase(progress.introSeen));
  const [returning, setReturning] = useState(progress.introSeen);
  const [run, setRun] = useState(0);
  // The clip dissolves into the interface instead of cutting, so it stays mounted briefly after it ends.
  const [fading, setFading] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const showMenu = phase === "menu" || reduced;
  const playing = phase === "video" && !reduced;
  // The home screen is the clip's final frame with the title and menu over it. Without the still, or on narrow
  // screens, the original sunset and portrait-card layout is used.
  const film = wide && !stillFailed;
  const sky = useSkyParallax<HTMLElement>();

  const finish = useCallback(() => {
    markIntroSeen();
    if (phase === "video") setFading(true);
    setPhase("menu");
  }, [markIntroSeen, phase]);

  const fallBack = useCallback(() => setPhase((current) => (current === "video" ? "cinematic" : current)), []);

  const replay = useCallback(() => {
    if (reduced) return;
    setReturning(false);
    setFading(false);
    setRun((count) => count + 1);
    setPhase(shouldPlayIntroVideo() ? "video" : "cinematic");
  }, [reduced]);

  useEffect(() => {
    if (phase === "menu") return;
    if (reduced) {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, phase === "video" ? VIDEO_MAX_MS : CINEMATIC_MS);
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [phase, reduced, finish]);

  useEffect(() => {
    if (phase !== "video") return;
    const element = video.current;
    if (!element) return;
    element.muted = true;
    const watchdog = window.setTimeout(fallBack, VIDEO_START_MS);
    const onPlaying = () => {
      window.clearTimeout(watchdog);
      // Once it has actually played, later navigation must not replay it.
      markIntroSeen();
    };
    element.addEventListener("playing", onPlaying, { once: true });
    const attempt = element.play?.();
    if (attempt && typeof attempt.catch === "function") attempt.catch(fallBack);
    return () => {
      window.clearTimeout(watchdog);
      element.removeEventListener("playing", onPlaying);
    };
  }, [phase, run, fallBack, markIntroSeen]);

  useEffect(() => {
    if (!fading) return;
    const timer = window.setTimeout(() => setFading(false), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [fading]);

  const classes = ["sc-intro", showMenu ? "is-menu" : "is-cinematic", returning && "is-returning", playing && "is-video", fading && "is-reveal", film && "is-film"].filter(Boolean).join(" ");

  return (
    <section ref={sky} className={classes} aria-labelledby="sc-title" onPointerDown={showMenu ? undefined : finish}>
      <div className="sc-intro-sky" aria-hidden="true">
        <i className="sc-sun" />
        <CitySkyline />
      </div>

      {film && (
        <img
          className="sc-intro-still"
          src={gameIntroVideo.home}
          alt={characterAlt}
          width={1280}
          height={720}
          decoding="async"
          draggable={false}
          onError={() => setStillFailed(true)}
        />
      )}

      {(playing || fading) && (
        <video
          key={run}
          ref={video}
          className={`sc-intro-video ${fading ? "is-fading" : ""}`}
          src={gameIntroVideo.src}
          poster={gameIntroVideo.poster}
          width={1280}
          height={720}
          muted
          playsInline
          autoPlay
          preload="auto"
          tabIndex={-1}
          aria-hidden="true"
          onEnded={finish}
          onError={fallBack}
        />
      )}

      {film && <div className="sc-intro-scrim" aria-hidden="true" />}

      <div className="sc-intro-grid">
        <div className="sc-intro-copy">
          <p className="sc-presents">SARAN.OS PRESENTS</p>
          <h1 id="sc-title">SARAN UNIVERSE</h1>
          <p className="sc-subtitle">THE ENGINEERING CHRONICLES</p>
          <p className="sc-quote">&ldquo;Every system has a story. Explore mine.&rdquo;</p>

          <nav className="sc-menu" aria-label="Main menu">
            <button type="button" onClick={() => go({ name: "profile" })}><Play size={18} /> Start your journey</button>
            <button type="button" onClick={() => go({ name: "map" })}><Compass size={18} /> Enter Saran Universe</button>
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

        {!film && <Portrait className="is-intro" caption="SARAN S. · DATA PLATFORM ENGINEER" />}
      </div>

      {!showMenu && <button type="button" className="sc-skip" onPointerDown={(event) => event.stopPropagation()} onClick={finish}>Skip intro</button>}
      {!showMenu && <button type="button" className="sc-recruiter is-floating" onPointerDown={(event) => event.stopPropagation()} onClick={() => setMode("recruiter")}><Users size={16} /> <span>Recruiter Mode</span></button>}
      <div className="sc-letterbox" aria-hidden="true" />
    </section>
  );
};
