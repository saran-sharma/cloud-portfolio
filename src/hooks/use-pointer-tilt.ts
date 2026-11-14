import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const INTERACTIVE_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 768px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const CSS_VARS = ["--nx", "--ny", "--bx", "--by", "--lx", "--ly", "--lo", "--m"];

type Frame = { nx: number; ny: number; bx: number; by: number; lx: number; ly: number; lo: number };

const REST: Frame = { nx: 0, ny: 0, bx: 0, by: 0, lx: 68, ly: 30, lo: 0 };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Drives the portrait's CSS custom properties from a local pointer position.
 * Values are eased towards their targets inside one requestAnimationFrame loop,
 * so the portrait follows smoothly, settles smoothly, and the loop stops when idle.
 *
 * --nx / --ny: portrait and decorative depth, -1..1
 * --bx / --by: atmosphere layer, mirrored and slower
 * --lx / --ly: spotlight position, follows the cursor most directly
 * --lo: spotlight opacity, --m: tilt magnitude used to keep photo edges covered
 */
export function createTiltEngine(getElement: () => HTMLElement | null) {
  const current: Frame = { ...REST };
  const target: Frame = { ...REST };
  let pointer: { x: number; y: number } | null = null;
  let frame = 0;
  let last = 0;

  const write = () => {
    const style = getElement()?.style;
    if (!style) return;
    style.setProperty("--nx", current.nx.toFixed(4));
    style.setProperty("--ny", current.ny.toFixed(4));
    style.setProperty("--bx", current.bx.toFixed(4));
    style.setProperty("--by", current.by.toFixed(4));
    style.setProperty("--lx", `${current.lx.toFixed(2)}%`);
    style.setProperty("--ly", `${current.ly.toFixed(2)}%`);
    style.setProperty("--lo", current.lo.toFixed(3));
    style.setProperty("--m", Math.max(Math.abs(current.nx), Math.abs(current.ny)).toFixed(4));
  };

  const tick = (now: number) => {
    frame = 0;
    const element = getElement();
    if (!element) return;
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
    last = now;

    if (pointer) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const x = clamp01((pointer.x - rect.left) / rect.width);
        const y = clamp01((pointer.y - rect.top) / rect.height);
        target.nx = (x - 0.5) * 2;
        target.ny = (y - 0.5) * 2;
        target.bx = -target.nx;
        target.by = -target.ny;
        target.lx = x * 100;
        target.ly = y * 100;
        target.lo = 1;
      }
    } else {
      target.nx = target.ny = target.bx = target.by = target.lo = 0;
    }

    const ease = (rate: number) => 1 - Math.exp(-rate * dt);
    const tiltRate = pointer ? 9 : 6;
    current.nx += (target.nx - current.nx) * ease(tiltRate);
    current.ny += (target.ny - current.ny) * ease(tiltRate);
    current.bx += (target.bx - current.bx) * ease(pointer ? 4 : 3);
    current.by += (target.by - current.by) * ease(pointer ? 4 : 3);
    current.lx += (target.lx - current.lx) * ease(18);
    current.ly += (target.ly - current.ly) * ease(18);
    current.lo += (target.lo - current.lo) * ease(target.lo > current.lo ? 10 : 5);

    const settled =
      Math.abs(target.nx - current.nx) < 0.0005 &&
      Math.abs(target.ny - current.ny) < 0.0005 &&
      Math.abs(target.bx - current.bx) < 0.0005 &&
      Math.abs(target.by - current.by) < 0.0005 &&
      Math.abs(target.lx - current.lx) < 0.05 &&
      Math.abs(target.ly - current.ly) < 0.05 &&
      Math.abs(target.lo - current.lo) < 0.002;

    if (settled) {
      Object.assign(current, target);
      write();
      last = 0;
      return;
    }
    write();
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  return {
    move(x: number, y: number) {
      pointer = { x, y };
      start();
    },
    leave() {
      pointer = null;
      start();
    },
    reset() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      pointer = null;
      Object.assign(current, REST);
      Object.assign(target, REST);
      const style = getElement()?.style;
      CSS_VARS.forEach((name) => style?.removeProperty(name));
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}

/**
 * Local pointer-driven tilt. Only a fine, hovering pointer on a wide viewport
 * without reduced-motion enabled activates it; touch, pen-less tablets and
 * reduced-motion users get the static composition.
 */
export function usePointerTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const engine = useRef<ReturnType<typeof createTiltEngine>>();
  if (!engine.current) engine.current = createTiltEngine(() => ref.current);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia(INTERACTIVE_QUERY);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY);
    const update = () => setInteractive(fine.matches && !reduced.matches);
    update();
    fine.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const instance = engine.current;
    if (!interactive) instance?.reset();
    return () => instance?.destroy();
  }, [interactive]);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<T>) => {
      if (!interactive || event.pointerType === "touch") return;
      engine.current?.move(event.clientX, event.clientY);
    },
    [interactive],
  );
  const onPointerLeave = useCallback(() => engine.current?.leave(), []);

  return {
    ref,
    interactive,
    handlers: { onPointerEnter: onPointerMove, onPointerMove, onPointerLeave, onPointerCancel: onPointerLeave },
  };
}
