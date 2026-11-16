import { useEffect, type RefObject } from "react";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const SPOTLIGHT =
  ".feature, .more-item > article, .skill-row, .experience-role, .experience-themes, .credential, .cert-list, .journey";

/**
 * Scroll-linked motion for Recruiter Mode, written as CSS custom properties so the
 * animation itself stays in CSS and only transform/opacity change.
 *
 *  - data-scroll="page"  gets --sp, the whole-page progress (0 to 1)
 *  - data-scroll="hero"  gets --hp, how far the hero has scrolled away (0 to 1)
 *  - data-progress       gets --ep, how far the element has travelled through the viewport
 *
 * Variables are written only to those small subtrees, never the page root, so a scroll
 * frame does not restyle the whole document. Nothing runs for prefers-reduced-motion.
 */
export function useScrollEffects(host: RefObject<HTMLElement>) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = host.current;
    if (!root || reduced || typeof window === "undefined") return;

    const pageEls = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll="page"]'));
    const heroEls = Array.from(root.querySelectorAll<HTMLElement>('[data-scroll="hero"]'));
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-progress]"));
    const last = new WeakMap<HTMLElement, string>();

    const write = (el: HTMLElement, name: string, value: number) => {
      const text = value.toFixed(3);
      if (last.get(el) === text) return;
      last.set(el, text);
      el.style.setProperty(name, text);
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - vh;
      const page = max > 0 ? clamp(y / max) : 0;
      pageEls.forEach((el) => write(el, "--sp", page));
      heroEls.forEach((el) => write(el, "--hp", clamp(y / Math.max(el.offsetHeight, vh * 0.6))));
      // 0 as the element's top reaches 85% of the viewport, 1 once its bottom passes 45%.
      const start = vh * 0.85;
      const end = vh * 0.45;
      items.forEach((el) => {
        const rect = el.getBoundingClientRect();
        write(el, "--ep", clamp((start - rect.top) / (rect.height + start - end)));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Cursor spotlight on panels, only for a real mouse.
    const fine = typeof window.matchMedia === "function" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let spotFrame = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;
    const flush = () => {
      spotFrame = 0;
      if (!pending) return;
      const rect = pending.el.getBoundingClientRect();
      pending.el.style.setProperty("--mx", `${(pending.x - rect.left).toFixed(0)}px`);
      pending.el.style.setProperty("--my", `${(pending.y - rect.top).toFixed(0)}px`);
      pending = null;
    };
    const onMove = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>(SPOTLIGHT);
      if (!el) return;
      pending = { el, x: event.clientX, y: event.clientY };
      if (!spotFrame) spotFrame = requestAnimationFrame(flush);
    };
    if (fine) root.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (spotFrame) cancelAnimationFrame(spotFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.removeEventListener("pointermove", onMove);
      pageEls.forEach((el) => el.style.removeProperty("--sp"));
      heroEls.forEach((el) => el.style.removeProperty("--hp"));
      items.forEach((el) => el.style.removeProperty("--ep"));
    };
  }, [host, reduced]);
}
