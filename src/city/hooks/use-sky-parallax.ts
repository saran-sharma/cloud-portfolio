import { useEffect, useRef } from "react";

const FINE_POINTER = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/**
 * Background parallax: eases --px / --py (-1..1) on the element from the local pointer position.
 * It only listens on the element itself, never runs for touch, small screens or reduced motion,
 * and its animation frame stops as soon as the values have settled.
 */
export function useSkyParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.matchMedia?.(FINE_POINTER)?.matches || window.matchMedia(REDUCED_MOTION)?.matches) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let frame = 0;

    const step = () => {
      frame = 0;
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      element.style.setProperty("--px", cx.toFixed(3));
      element.style.setProperty("--py", cy.toFixed(3));
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) frame = requestAnimationFrame(step);
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      tx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
      start();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      start();
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
