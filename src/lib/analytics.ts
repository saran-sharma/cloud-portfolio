import { track } from "@vercel/analytics";
import type { MissionId } from "@/city/types";

/**
 * Custom events for Vercel Web Analytics. Properties are short, fixed labels only:
 * never names, emails, messages or anything a visitor typed.
 * Custom events require a Vercel plan that includes them; on other plans the calls are ignored.
 */
const send = (name: string, properties?: Record<string, string | number | boolean>) => {
  const run = () => {
    try {
      track(name, properties);
    } catch {
      // Analytics must never break the page.
    }
  };
  // track() silently drops events until the Analytics component has initialised window.va. Effects of
  // children run before it does, so an event fired on first render waits one tick.
  if (typeof window !== "undefined" && !(window as { va?: unknown }).va) window.setTimeout(run, 0);
  else run();
};

export type ResumeSource = "recruiter_hero" | "contact" | "assistant" | "game_hud" | "game_intro" | "game_hq" | "game_dossier" | "game_tour";

export const trackResumeDownload = (source: ResumeSource) => send("resume_download", { source });

export type RecruiterSource = "direct_link" | "game";

export const trackRecruiterModeOpen = (source: RecruiterSource, from?: string) => send("recruiter_mode_open", from ? { source, from } : { source });

export const trackMissionComplete = (mission: MissionId) => send("mission_complete", { mission });
