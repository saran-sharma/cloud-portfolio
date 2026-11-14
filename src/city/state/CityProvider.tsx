import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { portfolio } from "@/data/portfolio";
import { DISTRICTS, MISSIONS } from "@/city/data/districts";
import {
  earnedBadges,
  loadProgress,
  maxXp,
  progressReducer,
  readModeFromUrl,
  saveProgress,
  totalXp,
  type Progress,
} from "@/city/state/game-state";
import type { BadgeId, DistrictId, MissionId, Mode, Scene } from "@/city/types";

export type Toast = { key: string; badge: BadgeId };

type CityContextValue = {
  mode: Mode;
  scene: Scene;
  playerAt: DistrictId | null;
  progress: Progress;
  xp: number;
  maxXp: number;
  percent: number;
  badges: BadgeId[];
  toasts: Toast[];
  canGoBack: boolean;
  go: (scene: Scene) => void;
  back: () => void;
  home: () => void;
  setMode: (mode: Mode, anchor?: string) => void;
  takeScrollTarget: (mode: Mode) => { y: number; anchor: string | null };
  discoverDistrict: (id: DistrictId) => boolean;
  openProject: (id: string) => void;
  completeMission: (id: MissionId) => void;
  markIntroSeen: () => void;
  reset: () => void;
  dismissToast: (key: string) => void;
};

const CityContext = createContext<CityContextValue | null>(null);

const projectIds = () => portfolio.projects.map((project) => project.id);
const TOTAL_DISTRICTS = DISTRICTS.length;
const TOTAL_MISSIONS = Object.keys(MISSIONS).length;

export function CityProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(progressReducer, undefined, () => loadProgress(projectIds()));
  const [mode, setModeState] = useState<Mode>(readModeFromUrl);
  const [scene, setScene] = useState<Scene>({ name: "intro" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [playerAt, setPlayerAt] = useState<DistrictId | null>(null);
  const history = useRef<Scene[]>([]);
  const modeRef = useRef(mode);
  const sceneRef = useRef(scene);
  const scroll = useRef<Record<Mode, number>>({ game: 0, recruiter: 0 });
  const pendingAnchor = useRef<string | null>(null);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  sceneRef.current = scene;

  useEffect(() => saveProgress(progress), [progress]);

  useEffect(() => {
    if (scene.name === "district") setPlayerAt(scene.id);
    if (scene.name === "mission") setPlayerAt(MISSIONS[scene.id].districtId);
  }, [scene]);

  useEffect(() => {
    modeRef.current = mode;
    const url = new URL(window.location.href);
    if (mode === "recruiter") url.searchParams.set("mode", "recruiter");
    else url.searchParams.delete("mode");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [mode]);

  useEffect(() => {
    const original = document.title;
    document.body.classList.toggle("sc-active", mode === "game");
    if (mode === "game") document.title = "SARAN CITY | Saran S., Data Platform Engineer";
    return () => {
      document.title = original;
      document.body.classList.remove("sc-active");
    };
  }, [mode]);

  const badges = useMemo(() => earnedBadges(progress), [progress]);

  useEffect(() => {
    const fresh = badges.filter((badge) => !progress.announced.includes(badge));
    if (!fresh.length) return;
    dispatch({ type: "announce", ids: fresh });
    setToasts((list) => [...list, ...fresh.map((badge) => ({ key: `${badge}-${Date.now()}`, badge }))]);
  }, [badges, progress.announced]);

  const go = useCallback((next: Scene) => {
    history.current = [...history.current, sceneRef.current].slice(-20);
    setScene(next);
  }, []);

  const back = useCallback(() => {
    const previous = history.current[history.current.length - 1];
    history.current = history.current.slice(0, -1);
    setScene(previous ? previous : { name: "map" });
  }, []);

  const home = useCallback(() => {
    history.current = [];
    setScene({ name: "map" });
  }, []);

  const setMode = useCallback((next: Mode, anchor?: string) => {
    scroll.current[modeRef.current] = window.scrollY;
    pendingAnchor.current = anchor ?? null;
    setModeState(next);
  }, []);

  const takeScrollTarget = useCallback((target: Mode) => {
    const anchor = pendingAnchor.current;
    pendingAnchor.current = null;
    return { y: scroll.current[target], anchor };
  }, []);

  const discoverDistrict = useCallback((id: DistrictId) => {
    const isNew = !progressRef.current.discovered.includes(id);
    if (isNew) dispatch({ type: "discover", id });
    return isNew;
  }, []);

  const openProject = useCallback((id: string) => dispatch({ type: "project", id }), []);
  const completeMission = useCallback((id: MissionId) => dispatch({ type: "complete", id }), []);
  const markIntroSeen = useCallback(() => dispatch({ type: "intro-seen" }), []);
  const reset = useCallback(() => {
    dispatch({ type: "reset" });
    setToasts([]);
  }, []);
  const dismissToast = useCallback((key: string) => setToasts((list) => list.filter((toast) => toast.key !== key)), []);

  const value = useMemo<CityContextValue>(() => {
    const max = maxXp(TOTAL_DISTRICTS, portfolio.projects.length, TOTAL_MISSIONS);
    const xp = totalXp(progress);
    return {
      mode,
      scene,
      playerAt,
      progress,
      xp,
      maxXp: max,
      percent: Math.min(100, Math.round((xp / max) * 100)),
      badges,
      toasts,
      canGoBack: history.current.length > 0,
      go,
      back,
      home,
      setMode,
      takeScrollTarget,
      discoverDistrict,
      openProject,
      completeMission,
      markIntroSeen,
      reset,
      dismissToast,
    };
  }, [mode, scene, playerAt, progress, badges, toasts, go, back, home, setMode, takeScrollTarget, discoverDistrict, openProject, completeMission, markIntroSeen, reset, dismissToast]);

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity() {
  const context = useContext(CityContext);
  if (!context) throw new Error("useCity must be used inside CityProvider");
  return context;
}
