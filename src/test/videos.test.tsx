import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CityProvider } from "@/city/state/CityProvider";
import { CityApp } from "@/city/components/CityApp";
import { SaranOSIntro } from "@/city/components/SaranOSIntro";
import { Hero } from "@/components/sections/Hero";
import { STORAGE_KEY } from "@/city/state/game-state";
import { gameIntroVideo, recruiterIntroVideo, shouldPlayIntroVideo } from "@/city/videos";

vi.mock("@emailjs/browser", () => ({ default: { send: vi.fn() } }));

const originalMatchMedia = window.matchMedia;
const originalConnection = (navigator as Navigator & { connection?: unknown }).connection;

const mockMedia = (matching: (query: string) => boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: matching(query),
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
    onchange: null,
  })) as typeof window.matchMedia;
};

const desktop = (query: string) => query.includes("min-width: 768px");
const wide = (query: string) => query.includes("min-width: 768px") || query.includes("min-width: 901px");
const progress = () => JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
const findVideo = (container: HTMLElement) => container.querySelector<HTMLVideoElement>("video.sc-intro-video");

const renderIntro = () => render(<CityProvider><SaranOSIntro /></CityProvider>);

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  Object.defineProperty(navigator, "connection", { configurable: true, value: originalConnection });
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("video asset and playback guards", () => {
  it("points the opening clip at public/ and keeps the Recruiter clip optional and absent", () => {
    expect(gameIntroVideo.src).toMatch(/videos\/saran-universe-intro\.mp4$/);
    expect(gameIntroVideo.poster).toMatch(/videos\/saran-universe-intro-poster\.jpg$/);
    expect(recruiterIntroVideo.hasVideo).toBe(false);
  });

  it("blocks intro video on reduced motion, save-data, and narrow viewports", () => {
    mockMedia(desktop);
    expect(shouldPlayIntroVideo()).toBe(true);

    mockMedia((q) => q.includes("reduce") || desktop(q));
    expect(shouldPlayIntroVideo()).toBe(false);

    mockMedia(desktop);
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    expect(shouldPlayIntroVideo()).toBe(false);

    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: false } });
    mockMedia(() => false);
    expect(shouldPlayIntroVideo()).toBe(false);
    expect(shouldPlayIntroVideo({ allowSmallViewport: true })).toBe(true);
  });
});

describe("Saran Universe opening video", () => {
  it("plays a muted, inline, autoplaying clip with a poster behind the interface", () => {
    mockMedia(desktop);
    const { container } = renderIntro();
    const video = findVideo(container);
    expect(video).not.toBeNull();
    expect(video).toHaveAttribute("src", gameIntroVideo.src);
    expect(video).toHaveAttribute("poster", gameIntroVideo.poster);
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("aria-hidden", "true");
    expect(video?.autoplay).toBe(true);
    expect(video?.muted).toBe(true);
    expect(video?.getAttribute("preload")).toBe("auto");
    expect(video).toHaveAttribute("width", "1280");
    expect(video).toHaveAttribute("height", "720");
    expect(container.querySelector("source")).toBeNull();
    expect(screen.getByRole("button", { name: /Skip intro/ })).toBeInTheDocument();
    expect(container.querySelector(".sc-intro")).toHaveClass("is-video");
    expect(screen.getAllByRole("button", { name: /Recruiter Mode/ }).length).toBeGreaterThan(0);
  });

  it("dissolves into the interface when the clip ends, then removes the video", async () => {
    mockMedia(desktop);
    const { container } = renderIntro();
    fireEvent.ended(findVideo(container) as HTMLVideoElement);
    expect(container.querySelector(".sc-intro")).toHaveClass("is-menu", "is-reveal");
    expect(container.querySelector(".sc-intro")).not.toHaveClass("is-video");
    expect(findVideo(container)).toHaveClass("is-fading");
    expect(screen.getByRole("navigation", { name: "Main menu" })).toBeInTheDocument();
    await waitFor(() => expect(findVideo(container)).toBeNull(), { timeout: 3000 });
    expect(screen.getByRole("button", { name: /Replay intro/ })).toBeInTheDocument();
  });

  it("supports Skip intro and Replay intro, and replays the clip", async () => {
    mockMedia(desktop);
    const { container } = renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /Skip intro/ }));
    await waitFor(() => expect(findVideo(container)).toBeNull(), { timeout: 3000 });
    fireEvent.click(screen.getByRole("button", { name: /Replay intro/ }));
    expect(findVideo(container)).not.toBeNull();
    expect(screen.getByRole("button", { name: /Skip intro/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Replay intro/ })).toBeNull();
  });

  it("remembers the clip has played, so it does not start again on later visits", () => {
    mockMedia(desktop);
    const { container, unmount } = renderIntro();
    expect(progress().introSeen).not.toBe(true);
    fireEvent.playing(findVideo(container) as HTMLVideoElement);
    expect(progress().introSeen).toBe(true);
    unmount();

    const again = renderIntro();
    expect(findVideo(again.container)).toBeNull();
    expect(screen.getByRole("navigation", { name: "Main menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Replay intro/ })).toBeInTheDocument();
  });

  it("opens the title without autoplay from a first-visit mission link and still offers replay", async () => {
    mockMedia(desktop);
    window.history.replaceState(null, "", "/?mission=platform-day&source=share");
    const { container } = render(<CityApp />);
    expect(await screen.findByRole("heading", { level: 1, name: "Platform Day" })).toBeInTheDocument();
    expect(progress().introSeen).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByRole("navigation", { name: "Main menu" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
    expect(window.location.search).toBe("?source=share");
    expect(findVideo(container)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Replay intro" }));
    expect(findVideo(container)).not.toBeNull();
  });

  it("falls back to the code-based intro with the character art when the file fails", () => {
    mockMedia(desktop);
    const { container } = renderIntro();
    fireEvent.error(findVideo(container) as HTMLVideoElement);
    expect(findVideo(container)).toBeNull();
    expect(container.querySelector(".sc-intro")).toHaveClass("is-cinematic");
    expect(container.querySelector(".sc-intro")).not.toHaveClass("is-video");
    expect(screen.getByRole("img", { name: /Saran S\./i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Skip intro/ })).toBeInTheDocument();
  });

  it("falls back when the browser refuses to autoplay", async () => {
    mockMedia(desktop);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(new DOMException("blocked", "NotAllowedError"));
    const { container } = renderIntro();
    await waitFor(() => expect(findVideo(container)).toBeNull());
    expect(container.querySelector(".sc-intro")).toHaveClass("is-cinematic");
  });

  it("falls back when playback never starts", () => {
    vi.useFakeTimers();
    try {
      mockMedia(desktop);
      const { container } = renderIntro();
      expect(findVideo(container)).not.toBeNull();
      act(() => { vi.advanceTimersByTime(5100); });
      expect(findVideo(container)).toBeNull();
      expect(container.querySelector(".sc-intro")).toHaveClass("is-cinematic");
    } finally {
      vi.useRealTimers();
    }
  });

  it("uses the static experience for reduced motion: no video, Skip or Replay", () => {
    mockMedia((q) => q.includes("reduce"));
    const { container } = renderIntro();
    expect(findVideo(container)).toBeNull();
    expect(screen.queryByRole("button", { name: /Skip intro/ })).toBeNull();
    expect(screen.queryByRole("button", { name: /Replay intro/ })).toBeNull();
    expect(screen.getByRole("navigation", { name: "Main menu" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Saran S\./i })).toBeInTheDocument();
  });

  it("skips the clip on narrow screens and with Save-Data, using the existing intro", () => {
    mockMedia(() => false);
    const narrow = renderIntro();
    expect(findVideo(narrow.container)).toBeNull();
    expect(narrow.container.querySelector(".sc-intro")).toHaveClass("is-cinematic");
    narrow.unmount();

    window.localStorage.clear();
    mockMedia(desktop);
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    const saver = renderIntro();
    expect(findVideo(saver.container)).toBeNull();
  });

  it("starts Replay as the code-based intro when the clip is not allowed", () => {
    mockMedia(() => false);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, introSeen: true }));
    const { container } = renderIntro();
    fireEvent.click(screen.getByRole("button", { name: /Replay intro/ }));
    expect(findVideo(container)).toBeNull();
    expect(container.querySelector(".sc-intro")).toHaveClass("is-cinematic");
  });
});

describe("Saran Universe film home", () => {
  it("uses the clip's final frame as the home screen, with no second portrait card", () => {
    mockMedia(wide);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, introSeen: true }));
    const { container } = renderIntro();
    const intro = container.querySelector(".sc-intro");
    expect(intro).toHaveClass("is-film", "is-menu");
    const still = container.querySelector<HTMLImageElement>("img.sc-intro-still");
    expect(still).toHaveAttribute("src", gameIntroVideo.home);
    expect(still).toHaveAttribute("alt", expect.stringMatching(/Saran S\./));
    expect(container.querySelector(".sc-intro-scrim")).not.toBeNull();
    expect(container.querySelector(".sc-portrait")).toBeNull();
    expect(findVideo(container)).toBeNull();
    expect(screen.getByRole("navigation", { name: "Main menu" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Replay intro/ })).toBeInTheDocument();
  });

  it("plays the clip over the same still, then lands on the home without a layout change", async () => {
    mockMedia(wide);
    const { container } = renderIntro();
    expect(container.querySelector(".sc-intro")).toHaveClass("is-film", "is-video");
    expect(container.querySelector("img.sc-intro-still")).not.toBeNull();
    fireEvent.ended(findVideo(container) as HTMLVideoElement);
    expect(container.querySelector("img.sc-intro-still")).not.toBeNull();
    expect(container.querySelector(".sc-portrait")).toBeNull();
    await waitFor(() => expect(findVideo(container)).toBeNull(), { timeout: 3000 });
    expect(container.querySelector(".sc-intro")).toHaveClass("is-film", "is-menu");
  });

  it("is also the static home for reduced motion", () => {
    mockMedia((q) => q.includes("reduce") || q.includes("min-width: 901px"));
    const { container } = renderIntro();
    expect(container.querySelector(".sc-intro")).toHaveClass("is-film");
    expect(findVideo(container)).toBeNull();
    expect(screen.queryByRole("button", { name: /Replay intro/ })).toBeNull();
  });

  it("keeps the original sunset and portrait-card layout when the still fails to load", () => {
    mockMedia(wide);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, introSeen: true }));
    const { container } = renderIntro();
    fireEvent.error(container.querySelector("img.sc-intro-still") as HTMLImageElement);
    expect(container.querySelector(".sc-intro")).not.toHaveClass("is-film");
    expect(container.querySelector("img.sc-intro-still")).toBeNull();
    expect(container.querySelector(".sc-portrait")).not.toBeNull();
  });

  it("keeps the original layout on screens narrower than the film home", () => {
    mockMedia(desktop);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, introSeen: true }));
    const { container } = renderIntro();
    expect(container.querySelector(".sc-intro")).not.toHaveClass("is-film");
    expect(container.querySelector("img.sc-intro-still")).toBeNull();
    expect(container.querySelector(".sc-portrait")).not.toBeNull();
  });
});

describe("Recruiter Mode and the video", () => {
  it("never mounts or requests the opening clip when opened directly", async () => {
    mockMedia(desktop);
    window.history.replaceState(null, "", "/?mode=recruiter");
    const { container } = render(<CityApp />);
    expect(await screen.findByRole("link", { name: "Download Resume" }, { timeout: 10000 })).toBeInTheDocument();
    expect(container.querySelector("video")).toBeNull();
    expect(document.querySelector(`[src*="saran-universe-intro"]`)).toBeNull();
  });

  it("renders the hero name, title and resume without a video", () => {
    mockMedia(desktop);
    const { container } = render(<Hero />);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getAllByText(/Saran S\./i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Download Resume/i })).toBeInTheDocument();
  });
});
