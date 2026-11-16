import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/city/hooks/use-reduced-motion";
import { gameIntroVideo, shouldPlayIntroVideo } from "@/city/videos";
import { FILM_FRAME_COUNT, coverRect, filmFrameUrl, frameAt, nearestLoaded, passageProgress } from "@/components/film-frames";

// The card sits far down the page, so frames are requested only when it is within about two screens. Opening
// Recruiter Mode downloads none of them. The first, middle and last frames arrive first.
const WARM_UP_MARGIN = "1800px 0px";
const CONCURRENCY = 6;

/**
 * A framed cinematic card near the end of the page that invites the visitor into Saran Universe. As it passes
 * through the viewport a canvas blends between 36 frames taken from the opening clip, so the clip plays with the
 * scroll while the page keeps moving normally (nothing is pinned). Reduced motion, Save-Data and phones get the
 * still final frame instead and download no frames.
 */
export const ScrollFilm = ({ onExploreCity }: { onExploreCity?: () => void }) => {
  const reduced = useReducedMotion();
  const [scrub] = useState(() => shouldPlayIntroVideo());
  const [failed, setFailed] = useState(false);
  const track = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = scrub && !reduced && !failed;

  useEffect(() => {
    const section = track.current;
    const element = canvas.current;
    const frameBox = element?.parentElement;
    if (!live || !section || !element || !frameBox) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = element.getContext("2d"); } catch { ctx = null; }
    if (!ctx) { setFailed(true); return; }
    const context = ctx;

    const images: (HTMLImageElement | undefined)[] = new Array(FILM_FRAME_COUNT);
    const loaded = new Set<number>();
    let started = false;
    let progress = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let dead = false;

    const draw = () => {
      frame = 0;
      if (!width || !height) return;
      const { a, b, t } = frameAt(progress);
      const first = nearestLoaded(a, loaded);
      if (first < 0) return;
      context.globalAlpha = 1;
      context.clearRect(0, 0, width, height);
      const paint = (index: number, alpha: number) => {
        const image = images[index];
        if (!image) return;
        const r = coverRect(image.naturalWidth, image.naturalHeight, width, height, 0.5, 0);
        context.globalAlpha = alpha;
        context.drawImage(image, r.x, r.y, r.w, r.h);
      };
      paint(first, 1);
      const second = nearestLoaded(b, loaded);
      if (second >= 0 && second !== first && t > 0.01) paint(second, t);
      context.globalAlpha = 1;
    };
    const schedule = () => { if (!frame && !dead) frame = requestAnimationFrame(draw); };

    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = rect.width;
      height = rect.height;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      schedule();
    };

    const onScroll = () => {
      const rect = frameBox.getBoundingClientRect();
      progress = passageProgress(rect.top, rect.height, window.innerHeight);
      schedule();
    };

    const load = () => {
      if (started) return;
      started = true;
      // First, middle and last frames first so any scroll position has something close to show.
      const order = [0, FILM_FRAME_COUNT - 1, Math.floor(FILM_FRAME_COUNT / 2)];
      for (let i = 0; i < FILM_FRAME_COUNT; i += 1) if (!order.includes(i)) order.push(i);
      let cursor = 0;
      let errors = 0;
      const next = () => {
        if (dead || cursor >= order.length) return;
        const index = order[cursor];
        cursor += 1;
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          images[index] = image;
          loaded.add(index);
          schedule();
          next();
        };
        image.onerror = () => {
          errors += 1;
          if (errors >= 3 && loaded.size === 0) setFailed(true);
          next();
        };
        image.src = filmFrameUrl(index);
      };
      for (let i = 0; i < CONCURRENCY; i += 1) next();
    };

    measure();
    onScroll();
    const observer = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => { if (entry.isIntersecting) load(); }, { rootMargin: WARM_UP_MARGIN })
      : null;
    if (observer) observer.observe(section); else load();
    const resize = typeof ResizeObserver === "function" ? new ResizeObserver(() => { measure(); onScroll(); }) : null;
    resize?.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      dead = true;
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
      resize?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [live]);

  return (
    <section ref={track} id="film" className={`film-section section-space page-shell ${live ? "is-live" : "is-static"}`} aria-label="Saran Universe">
      <div className="film-card">
        {live ? <canvas ref={canvas} className="film-canvas" aria-hidden="true" /> : (
          <img className="film-still" src={gameIntroVideo.home} alt="" width={1280} height={720} loading="lazy" decoding="async" draggable={false} />
        )}
        <div className="film-shade" aria-hidden="true" />
        <div className="film-caption">
          <p className="eyebrow">Beyond the resume</p>
          <h2>Explore the work <em>as a world.</em></h2>
          <p className="film-copy">Saran Universe turns the same projects and case studies into districts, missions and a map you can walk around.</p>
          {onExploreCity && (
            <button type="button" className="action-button action-primary" onClick={onExploreCity}>
              Enter Saran Universe <ArrowRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
