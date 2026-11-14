import type { BadgeId, DistrictId, MissionId, Mode } from "@/city/types";

export const STORAGE_KEY = "saran-city:progress:v1";

/** Exploration points. They measure how much of this site has been explored, nothing else. */
export const XP = { district: 50, project: 20, mission: 150, engineer: 100 } as const;

export type Progress = {
  version: 1;
  introSeen: boolean;
  discovered: DistrictId[];
  projects: string[];
  missions: MissionId[];
  announced: BadgeId[];
};

export type Badge = {
  id: BadgeId;
  name: string;
  description: string;
  earned: (progress: Progress) => boolean;
};

export const initialProgress: Progress = {
  version: 1,
  introSeen: false,
  discovered: [],
  projects: [],
  missions: [],
  announced: [],
};

const has = (progress: Progress, id: MissionId) => progress.missions.includes(id);

export const BADGES: Badge[] = [
  { id: "data-explorer", name: "Data Explorer", description: "Complete Mission 01 in the Data Docks.", earned: (p) => has(p, "pipeline") },
  { id: "cloud-navigator", name: "Cloud Navigator", description: "Complete Mission 04 in Cloud Heights.", earned: (p) => has(p, "storage") },
  { id: "automation-specialist", name: "Automation Specialist", description: "Complete Mission 05 in Automation Works.", earned: (p) => has(p, "pim") },
  { id: "ai-explorer", name: "AI Explorer", description: "Complete Missions 03 and 06 in Neon AI Labs.", earned: (p) => has(p, "incident") && has(p, "mcp") },
  { id: "platform-investigator", name: "Platform Investigator", description: "Complete Mission 02 in Operations HQ.", earned: (p) => has(p, "cost") },
  {
    id: "journey-complete",
    name: "Engineering Journey Complete",
    description: "Earn the five badges above and meet the engineer in HQ.",
    earned: (p) => has(p, "pipeline") && has(p, "storage") && has(p, "pim") && has(p, "incident") && has(p, "mcp") && has(p, "cost") && has(p, "engineer"),
  },
];

export type Action =
  | { type: "intro-seen" }
  | { type: "discover"; id: DistrictId }
  | { type: "project"; id: string }
  | { type: "complete"; id: MissionId }
  | { type: "announce"; ids: BadgeId[] }
  | { type: "reset" };

const addUnique = <T,>(list: T[], value: T) => (list.includes(value) ? list : [...list, value]);

export function progressReducer(state: Progress, action: Action): Progress {
  switch (action.type) {
    case "intro-seen":
      return state.introSeen ? state : { ...state, introSeen: true };
    case "discover":
      return state.discovered.includes(action.id) ? state : { ...state, discovered: addUnique(state.discovered, action.id) };
    case "project":
      return state.projects.includes(action.id) ? state : { ...state, projects: addUnique(state.projects, action.id) };
    case "complete":
      return state.missions.includes(action.id) ? state : { ...state, missions: addUnique(state.missions, action.id) };
    case "announce":
      return { ...state, announced: action.ids.reduce((list, id) => addUnique(list, id), state.announced) };
    case "reset":
      return { ...initialProgress, introSeen: state.introSeen };
    default:
      return state;
  }
}

export const earnedBadges = (progress: Progress): BadgeId[] => BADGES.filter((badge) => badge.earned(progress)).map((badge) => badge.id);

export function totalXp(progress: Progress): number {
  const missions = progress.missions.reduce((sum, id) => sum + (id === "engineer" ? XP.engineer : XP.mission), 0);
  return progress.discovered.length * XP.district + progress.projects.length * XP.project + missions;
}

export function maxXp(districtCount: number, projectCount: number, missionCount: number): number {
  return districtCount * XP.district + projectCount * XP.project + (missionCount - 1) * XP.mission + XP.engineer;
}

const asList = <T extends string>(value: unknown, allowed: readonly T[]): T[] =>
  Array.isArray(value) ? value.filter((item): item is T => typeof item === "string" && (allowed as readonly string[]).includes(item)) : [];

const DISTRICT_IDS: DistrictId[] = ["data-docks", "cloud-heights", "automation-works", "neon-ai-labs", "operations-hq", "headquarters"];
const MISSION_IDS: MissionId[] = ["pipeline", "cost", "incident", "storage", "pim", "mcp", "engineer"];
const BADGE_IDS: BadgeId[] = BADGES.map((badge) => badge.id);

/** Reads stored progress defensively: anything unexpected falls back to a fresh start. */
export function parseProgress(raw: string | null, knownProjects: string[]): Progress {
  if (!raw) return initialProgress;
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return initialProgress;
    return {
      version: 1,
      introSeen: data.introSeen === true,
      discovered: asList(data.discovered, DISTRICT_IDS),
      projects: asList(data.projects, knownProjects),
      missions: asList(data.missions, MISSION_IDS),
      announced: asList(data.announced, BADGE_IDS),
    };
  } catch {
    return initialProgress;
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadProgress(knownProjects: string[], storage: Pick<Storage, "getItem"> | undefined = safeStorage()): Progress {
  try {
    return parseProgress(storage?.getItem(STORAGE_KEY) ?? null, knownProjects);
  } catch {
    return initialProgress;
  }
}

export function saveProgress(progress: Progress, storage: Pick<Storage, "setItem"> | undefined = safeStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable (private mode, quota). Progress then lasts for the session only.
  }
}

export const readModeFromUrl = (): Mode => {
  if (typeof window === "undefined") return "game";
  const params = new URLSearchParams(window.location.search);
  return params.get("mode") === "recruiter" ? "recruiter" : "game";
};
