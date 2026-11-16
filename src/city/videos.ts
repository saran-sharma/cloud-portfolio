import { prefersReducedMotion } from "@/city/hooks/use-reduced-motion";

export interface VideoAsset {
  webm?: string;
  mp4?: string;
  hasVideo: boolean;
}

const base = import.meta.env.BASE_URL ?? "/";

/**
 * The Saran Universe opening clip. It lives in public/ so it is never bundled or imported, and it
 * is only requested when SaranOSIntro mounts the <video>. The poster is its first frame.
 */
export const gameIntroVideo = {
  src: `${base}videos/saran-universe-intro.mp4`,
  poster: `${base}videos/saran-universe-intro-poster.jpg`,
  /** The clip's final frame. It is the Saran Universe home screen, so the intro flows straight into it. */
  home: `${base}videos/saran-universe-home.jpg`,
};

/** Screens at least this wide get the film home. Narrower ones keep the portrait-card layout. */
export const FILM_HOME_QUERY = "(min-width: 901px)";

const recruiterFiles = import.meta.glob("/src/assets/videos/recruiter-tech-intro.{webm,mp4}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function resolveVideo(files: Record<string, string>): VideoAsset {
  const entries = Object.entries(files);
  const webm = entries.find(([path]) => path.endsWith(".webm"))?.[1];
  const mp4 = entries.find(([path]) => path.endsWith(".mp4"))?.[1];
  return {
    webm,
    mp4,
    hasVideo: Boolean(webm || mp4),
  };
}

export const recruiterIntroVideo: VideoAsset = resolveVideo(recruiterFiles);

export function isSaveDataEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

export function shouldPlayIntroVideo({ allowSmallViewport = false }: { allowSmallViewport?: boolean } = {}): boolean {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion() || isSaveDataEnabled()) return false;
  if (allowSmallViewport) return true;
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(min-width: 768px)").matches;
  }
  return window.innerWidth >= 768;
}
