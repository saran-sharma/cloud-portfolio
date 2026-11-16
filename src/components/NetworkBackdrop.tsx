import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import { buildScene, calmFactor, nodeCountFor, type NetScene } from "@/components/network-scene";

const CYAN = "34, 230, 255";
const BLUE = "70, 120, 255";
const GOLD = "255, 200, 120";
const FRAME_MS = 1000 / 24;

const smooth = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};
/** Fades the scene out toward the skyline so the lower hero stays clean. */
const lowerFade = (y: number) => 1 - smooth(0.6, 0.92, y);

const draw = (ctx: CanvasRenderingContext2D, scene: NetScene, width: number, height: number, t: number) => {
  ctx.clearRect(0, 0, width, height);

  // Golden sunrise reflection from the horizon, low and wide so it never reaches the text.
  const glow = ctx.createRadialGradient(width * 0.66, height * 1.04, 0, width * 0.66, height * 1.04, width * 0.62);
  glow.addColorStop(0, `rgba(${GOLD}, .16)`);
  glow.addColorStop(1, `rgba(${GOLD}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const at = scene.nodes.map((node) => {
    const x = node.x + Math.sin(t * node.speed + node.phase) * node.amp;
    const y = node.y + Math.cos(t * node.speed * 0.8 + node.phase) * node.amp * 1.4;
    return { x: x * width, y: y * height, calm: calmFactor(node.x, node.y) * lowerFade(y) };
  });

  ctx.lineWidth = 1;
  scene.edges.forEach(({ a, b }, index) => {
    const p = at[a];
    const q = at[b];
    ctx.strokeStyle = `rgba(${index % 2 === 0 ? CYAN : BLUE}, ${0.36 * Math.min(p.calm, q.calm)})`;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  });

  // Data particles slide slowly along every third connection.
  scene.edges.forEach(({ a, b }, index) => {
    if (index % 3 !== 0) return;
    const p = at[a];
    const q = at[b];
    const progress = (t * 0.045 + index * 0.37) % 1;
    const x = p.x + (q.x - p.x) * progress;
    const y = p.y + (q.y - p.y) * progress;
    const strength = Math.min(p.calm, q.calm) * Math.sin(progress * Math.PI);
    const tint = index % 2 === 0 ? CYAN : GOLD;
    ctx.fillStyle = `rgba(${tint}, ${0.26 * strength})`;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(${tint}, ${0.95 * strength})`;
    ctx.beginPath();
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  scene.nodes.forEach((node, index) => {
    const { x, y, calm } = at[index];
    const pulse = 0.75 + 0.25 * Math.sin(t * 0.35 + node.phase);
    if (node.service) {
      const size = node.r * 4.4;
      ctx.strokeStyle = `rgba(${CYAN}, ${0.5 * calm})`;
      ctx.beginPath();
      for (let k = 0; k < 6; k += 1) {
        const angle = (Math.PI / 3) * k + Math.PI / 6;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(${CYAN}, ${0.9 * pulse * calm})`;
    ctx.beginPath();
    ctx.arc(x, y, node.r, 0, Math.PI * 2);
    ctx.fill();
  });
};

/**
 * A quiet network of nodes, links and slow data particles for the Recruiter Mode hero. It is code,
 * not a video: it runs at about 30 fps, pauses when the hero is off screen or the tab is hidden, and
 * with prefers-reduced-motion it draws a single still frame.
 */
export const NetworkBackdrop = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = element.getContext("2d"); } catch { ctx = null; }
    if (!ctx) return;
    const context = ctx;

    let scene: NetScene = { nodes: [], edges: [] };
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let visible = true;
    const started = performance.now();

    const render = (t: number) => draw(context, scene, width, height, t);

    const resize = () => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      scene = buildScene(nodeCountFor(width, height));
      render(reduced ? 6 : (performance.now() - started) / 1000);
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      render((now - started) / 1000);
    };
    const start = () => { if (!frame && !reduced && visible && !document.hidden) frame = requestAnimationFrame(tick); };
    const stop = () => { if (frame) cancelAnimationFrame(frame); frame = 0; };

    resize();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    observer?.observe(element);
    const io = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start(); else stop(); })
      : null;
    io?.observe(element);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      observer?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return <canvas ref={canvas} className="network-backdrop" aria-hidden="true" />;
};
