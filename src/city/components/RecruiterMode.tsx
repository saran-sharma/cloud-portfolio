import { Suspense, lazy, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { useCity } from "@/city/state/CityProvider";

const Portfolio = lazy(() => import("@/pages/Index"));

/** Moves to the saved scroll position, or to a requested section, once the page has content. */
const RestorePosition = () => {
  const { takeScrollTarget } = useCity();
  useEffect(() => {
    const target = takeScrollTarget("recruiter");
    let frames = 0;
    let frame = 0;
    const attempt = () => {
      if (target.anchor) {
        const element = document.getElementById(target.anchor);
        if (element) {
          element.scrollIntoView();
          return;
        }
      } else if (target.y > 0) {
        window.scrollTo(0, target.y);
        if (Math.abs(window.scrollY - target.y) < 4) return;
      } else {
        return;
      }
      frames += 1;
      if (frames < 30) frame = requestAnimationFrame(attempt);
    };
    frame = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(frame);
  }, [takeScrollTarget]);
  return null;
};

/** Recruiter Mode is the conventional portfolio, unchanged, with a way back into the game. */
export const RecruiterMode = () => {
  const { setMode } = useCity();
  return (
    <>
      <Suspense fallback={<p className="sc-loading is-page" role="status">Loading portfolio...</p>}>
        <Portfolio />
        <RestorePosition />
      </Suspense>
      <button type="button" className="sc-switch" onClick={() => setMode("game")}>
        <Gamepad2 size={16} aria-hidden="true" /> <span>Explore Saran City</span>
      </button>
    </>
  );
};
