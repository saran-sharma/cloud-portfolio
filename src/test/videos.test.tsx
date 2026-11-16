import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CityProvider } from "@/city/state/CityProvider";
import { SaranOSIntro } from "@/city/components/SaranOSIntro";
import { Hero } from "@/components/sections/Hero";
import { gameIntroVideo, recruiterIntroVideo, shouldPlayIntroVideo } from "@/city/videos";

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

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  Object.defineProperty(navigator, "connection", { configurable: true, value: originalConnection });
  localStorage.clear();
});

describe("video asset resolution and playback guards", () => {
  it("reports missing video assets without throwing or mounting broken video tags", () => {
    expect(gameIntroVideo.hasVideo).toBe(false);
    expect(recruiterIntroVideo.hasVideo).toBe(false);
  });

  it("blocks intro video on reduced motion, save-data, and narrow viewports", () => {
    mockMedia((q) => q.includes("min-width: 768px"));
    expect(shouldPlayIntroVideo()).toBe(true);

    mockMedia((q) => q.includes("reduce") || q.includes("min-width: 768px"));
    expect(shouldPlayIntroVideo()).toBe(false);

    mockMedia((q) => q.includes("min-width: 768px"));
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    expect(shouldPlayIntroVideo()).toBe(false);

    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: false } });
    mockMedia(() => false);
    expect(shouldPlayIntroVideo()).toBe(false);
    expect(shouldPlayIntroVideo({ allowSmallViewport: true })).toBe(true);
  });
});

describe("SaranOSIntro skip, replay, and fallback", () => {
  it("falls back to character portrait and supports Skip intro and Replay intro", () => {
    mockMedia((q) => q.includes("min-width: 768px"));
    const { container } = render(
      <CityProvider>
        <SaranOSIntro />
      </CityProvider>,
    );

    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByRole("img", { name: /Saran S\./i })).toBeInTheDocument();

    const skip = screen.getByRole("button", { name: /Skip intro/i });
    fireEvent.click(skip);

    const replay = screen.getByRole("button", { name: /Replay intro/i });
    expect(replay).toBeInTheDocument();

    fireEvent.click(replay);
    expect(screen.getByRole("button", { name: /Skip intro/i })).toBeInTheDocument();
  });

  it("hides Replay intro when prefers-reduced-motion is active", () => {
    mockMedia((q) => q.includes("reduce"));
    render(
      <CityProvider>
        <SaranOSIntro />
      </CityProvider>,
    );

    expect(screen.queryByRole("button", { name: /Replay intro/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Skip intro/i })).toBeNull();
  });
});

describe("Recruiter Hero fallback", () => {
  it("renders name, title, and resume download without mounting a missing video", () => {
    mockMedia((q) => q.includes("min-width: 768px"));
    const { container } = render(<Hero />);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getAllByText(/Saran S\./i).length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Download Resume/i })).toBeInTheDocument();
  });
});
