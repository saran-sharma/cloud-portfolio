const base = import.meta.env.BASE_URL ?? "/";

/** Frames extracted evenly from public/videos/saran-universe-intro.mp4 (first to last frame). */
export const FILM_FRAME_COUNT = 36;

export const filmFrameUrl = (index: number) => `${base}videos/scroll/frame-${String(index + 1).padStart(3, "0")}.webp`;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Which two frames to blend for a scroll progress of 0 to 1, and how far between them (t, 0 to 1). */
export function frameAt(progress: number, count = FILM_FRAME_COUNT) {
  const position = clamp01(progress) * (count - 1);
  const a = Math.min(count - 1, Math.floor(position));
  const b = Math.min(count - 1, a + 1);
  return { a, b, t: position - a };
}

/** Destination rectangle that reproduces object-fit: cover for a source drawn into a canvas. */
export function coverRect(srcW: number, srcH: number, dstW: number, dstH: number, posX = 0.5, posY = 0) {
  const scale = Math.max(dstW / srcW, dstH / srcH);
  const w = srcW * scale;
  const h = srcH * scale;
  return { x: (dstW - w) * posX, y: (dstH - h) * posY, w, h };
}

/**
 * Progress of a card passing through the viewport: 0 as its top reaches 85% of the viewport height (just
 * entering), 1 once its bottom has risen to 40% (almost gone). The page keeps scrolling normally throughout.
 */
export function passageProgress(top: number, height: number, viewportHeight: number) {
  const start = viewportHeight * 0.85;
  const end = viewportHeight * 0.4;
  const span = height + start - end;
  return span > 0 ? clamp01((start - top) / span) : 0;
}

/** The closest index to `wanted` that is in `loaded`, or -1 when nothing has loaded yet. */
export function nearestLoaded(wanted: number, loaded: ReadonlySet<number>) {
  if (loaded.has(wanted)) return wanted;
  let best = -1;
  let bestDistance = Infinity;
  loaded.forEach((index) => {
    const distance = Math.abs(index - wanted);
    if (distance < bestDistance) { best = index; bestDistance = distance; }
  });
  return best;
}
