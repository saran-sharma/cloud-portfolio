import { Suspense, lazy, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { useCity } from "@/city/state/CityProvider";

const Portfolio = lazy(() => import("@/pages/Index"));

/** Moves to the saved scroll position, or to a requested section, once the page has content. */
const RestorePosition = () => {
  const { takeScrollTarget } = useCity();
  useEffect(() => {
    const target = takeScrollTarget("recruiter");
    const started = performance.now();
    let frame = 0;
    const attempt = () => {
      if (target.anchor) {
        const element = document.getElementById(target.anchor);
        if (element) {
          element.scrollIntoView({ behavior: "instant" });
          return;
        }
      } else if (target.y > 0) {
        window.scrollTo({ top: target.y, behavior: "instant" });
        if (Math.abs(window.scrollY - target.y) < 4) return;
      } else {
        return;
      }
      // Lazy sections and fonts can still be laying out, so keep trying for a short while.
      if (performance.now() - started < 2000) frame = requestAnimationFrame(attempt);
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [takeScrollTarget]);
  return null;
};

/** Recruiter Mode is the conventional portfolio in the Saran City look, with a way back into the game. */
export const RecruiterMode = () => {
  const { setMode } = useCity();
  return (
    <div className="recruiter-city">
      <Suspense fallback={<p className="sc-loading is-page" role="status">Loading portfolio...</p>}>
        <Portfolio onExploreCity={() => setMode("game")} />
        <RestorePosition />
      </Suspense>
      <button type="button" className="sc-switch" onClick={() => setMode("game")}>
        <Gamepad2 size={16} aria-hidden="true" /> <span>Explore Saran City</span>
      </button>
    </div>
  );
};
