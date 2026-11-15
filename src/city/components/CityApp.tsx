import { Suspense, lazy, useEffect, useRef } from "react";
import { CityWorldMap } from "@/city/components/CityWorldMap";
import { DistrictScene } from "@/city/components/DistrictScene";
import { GameNavigation } from "@/city/components/GameHud";
import { MissionExperience } from "@/city/components/MissionExperience";
import { PlayerProfile } from "@/city/components/PlayerProfile";
import { SaranOSIntro } from "@/city/components/SaranOSIntro";
import { ToastStack } from "@/city/components/AchievementSystem";
import { RecruiterMode } from "@/city/components/RecruiterMode";
import { CityProvider, useCity } from "@/city/state/CityProvider";
import "@/city/city.css";
import "@/city/recruiter.css";

const SaranAI = lazy(() => import("@/components/SaranAI").then((module) => ({ default: module.SaranAI })));

const GameShell = () => {
  const { scene, back, takeScrollTarget } = useCity();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const { y } = takeScrollTarget("game");
    window.scrollTo(0, y);
  }, [takeScrollTarget]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [scene]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || scene.name === "intro" || scene.name === "map") return;
      if (document.querySelector('[role="dialog"]')) return;
      back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scene, back]);

  const key = scene.name === "district" || scene.name === "mission" ? `${scene.name}-${scene.id}` : scene.name;

  return (
    <div className={`saran-city is-${scene.name}`}>
      <a className="sc-skip-link" href="#sc-main">Skip to content</a>
      {scene.name !== "intro" && <GameNavigation />}
      <main id="sc-main" tabIndex={-1} ref={main} key={key} className="sc-scene">
        {scene.name === "intro" && <SaranOSIntro />}
        {scene.name === "profile" && <PlayerProfile />}
        {scene.name === "map" && <CityWorldMap />}
        {scene.name === "district" && <DistrictScene id={scene.id} intro={scene.intro !== false} />}
        {scene.name === "mission" && <MissionExperience id={scene.id} />}
      </main>
      <ToastStack />
      <Suspense fallback={null}><SaranAI /></Suspense>
    </div>
  );
};

const Shell = () => {
  const { mode } = useCity();
  return mode === "recruiter" ? <RecruiterMode /> : <GameShell />;
};

/** Saran City: the game layer. Recruiter Mode renders the conventional portfolio. */
export const CityApp = () => (
  <CityProvider>
    <Shell />
  </CityProvider>
);

export default CityApp;
