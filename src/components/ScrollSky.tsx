import { CitySkyline } from "@/city/components/CitySkyline";

/**
 * A fixed backdrop that follows a day as the page is scrolled: sunrise at the top, then
 * daylight, dusk and finally night with stars and a moon. It is purely decorative: --sp is
 * written onto this element by useScrollEffects.
 */
export const ScrollSky = () => (
  <div className="scroll-sky" data-scroll="page" aria-hidden="true">
    <div className="scroll-sky-day" />
    <div className="scroll-sky-dusk" />
    <div className="scroll-sky-dawn" />
    <div className="scroll-sky-glow" />
    <div className="scroll-sky-stars is-far" />
    <div className="scroll-sky-stars is-near" />
    <i className="scroll-sky-sun" />
    <i className="scroll-sky-moon" />
    <div className="scroll-sky-city"><CitySkyline /></div>
  </div>
);

export const ScrollProgress = () => (
  <div className="scroll-progress" data-scroll="page" aria-hidden="true"><i /></div>
);
