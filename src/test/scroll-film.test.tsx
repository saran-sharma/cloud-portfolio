import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollFilm } from "@/components/ScrollFilm";
import { FILM_FRAME_COUNT, coverRect, filmFrameUrl, frameAt, nearestLoaded, passageProgress } from "@/components/film-frames";

const originalMatchMedia = window.matchMedia;
const originalConnection = (navigator as Navigator & { connection?: unknown }).connection;
const mockMedia = (matching: (query: string) => boolean) => {
  window.matchMedia = ((query: string) => ({ matches: matching(query), media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false, onchange: null })) as typeof window.matchMedia;
};
const desktop = (query: string) => query.includes("min-width: 768px");

describe("film frame maths", () => {
  it("maps scroll progress to the two frames to blend", () => {
    expect(frameAt(0)).toEqual({ a: 0, b: 1, t: 0 });
    const end = frameAt(1);
    expect(end.a).toBe(FILM_FRAME_COUNT - 1);
    expect(end.b).toBe(FILM_FRAME_COUNT - 1);
    const half = frameAt(0.5);
    expect(half.a).toBeGreaterThanOrEqual(16);
    expect(half.a).toBeLessThanOrEqual(17);
    expect(half.t).toBeGreaterThanOrEqual(0);
    expect(half.t).toBeLessThan(1);
    expect(frameAt(-3).a).toBe(0);
    expect(frameAt(9).a).toBe(FILM_FRAME_COUNT - 1);
  });

  it("names frames 1-based with padding and keeps them under public/videos/scroll", () => {
    expect(filmFrameUrl(0)).toMatch(/videos\/scroll\/frame-001\.webp$/);
    expect(filmFrameUrl(FILM_FRAME_COUNT - 1)).toMatch(new RegExp(`frame-0${FILM_FRAME_COUNT}\\.webp$`));
  });

  it("reproduces object-fit: cover, anchored to the top", () => {
    const wide = coverRect(1024, 576, 1440, 900, 0.5, 0);
    expect(wide.h).toBeCloseTo(900);
    expect(wide.w).toBeGreaterThan(1440);
    expect(wide.y).toBe(0);
    expect(wide.x).toBeLessThan(0);
    const tall = coverRect(1024, 576, 400, 900, 0.5, 0);
    expect(tall.h).toBeCloseTo(900);
    expect(tall.w).toBeGreaterThanOrEqual(400);
  });

  it("measures progress of a card passing through the viewport", () => {
    // Below the viewport: not started. Just entering at 85%: 0.
    expect(passageProgress(900, 500, 900)).toBe(0);
    expect(passageProgress(765, 500, 900)).toBe(0);
    // Fully scrolled past (bottom above 40% of the viewport): done.
    expect(passageProgress(-400, 500, 900)).toBe(1);
    expect(passageProgress(-9000, 500, 900)).toBe(1);
    const mid = passageProgress(200, 500, 900);
    expect(mid).toBeGreaterThan(0.3);
    expect(mid).toBeLessThan(0.8);
    // Monotonic as the card moves up.
    expect(passageProgress(100, 500, 900)).toBeGreaterThan(passageProgress(300, 500, 900));
  });

  it("falls back to the closest loaded frame", () => {
    expect(nearestLoaded(5, new Set())).toBe(-1);
    expect(nearestLoaded(5, new Set([5, 9]))).toBe(5);
    expect(nearestLoaded(6, new Set([0, 9, 35]))).toBe(9);
  });
});

describe("ScrollFilm", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal("cancelAnimationFrame", () => {});
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(navigator, "connection", { configurable: true, value: originalConnection });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("shows the still final frame, with the caption and call to action, for reduced motion", () => {
    mockMedia((q) => q.includes("reduce") || desktop(q));
    const onExplore = vi.fn();
    const { container } = render(<ScrollFilm onExploreCity={onExplore} />);
    expect(container.querySelector("#film")).toHaveClass("is-static");
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelector("img.film-still")).toHaveAttribute("src", expect.stringMatching(/saran-universe-home\.jpg$/));
    // Decorative: the hero already announces the portrait and the caption names Saran.
    expect(container.querySelector("img.film-still")).toHaveAttribute("alt", "");
    expect(screen.queryByRole("img", { name: /Illustrated portrait/ })).toBeNull();
    expect(screen.getByRole("heading", { level: 2, name: /Explore the work as a world/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Enter Saran Universe/ }));
    expect(onExplore).toHaveBeenCalledTimes(1);
  });

  it("uses the still on phones and with Save-Data instead of downloading frames", () => {
    mockMedia(() => false);
    const phone = render(<ScrollFilm />);
    expect(phone.container.querySelector("canvas")).toBeNull();
    expect(phone.container.querySelector("img.film-still")).not.toBeNull();
    phone.unmount();

    mockMedia(desktop);
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    const saver = render(<ScrollFilm />);
    expect(saver.container.querySelector("canvas")).toBeNull();
  });

  it("renders a hidden canvas for scrubbing on capable screens and downloads nothing until it is near", () => {
    mockMedia(desktop);
    const context = { setTransform() {}, clearRect() {}, drawImage() {}, globalAlpha: 1 };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    const images: string[] = [];
    vi.stubGlobal("Image", class { decoding = ""; onload: (() => void) | null = null; onerror: (() => void) | null = null; set src(value: string) { images.push(value); } });
    const { container } = render(<ScrollFilm />);
    expect(container.querySelector("#film")).toHaveClass("is-live");
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("img.film-still")).toBeNull();
    expect(images).toHaveLength(0);
  });

  it("starts loading the frames, three key frames first, once the section is near", () => {
    mockMedia(desktop);
    const context = { setTransform() {}, clearRect() {}, drawImage() {}, globalAlpha: 1 };
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    const images: string[] = [];
    vi.stubGlobal("Image", class { decoding = ""; onload: (() => void) | null = null; onerror: (() => void) | null = null; set src(value: string) { images.push(value); } });
    let notify: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
    vi.stubGlobal("IntersectionObserver", class { constructor(callback: (entries: { isIntersecting: boolean }[]) => void) { notify = callback; } observe() {} unobserve() {} disconnect() {} });
    render(<ScrollFilm />);
    expect(images).toHaveLength(0);
    act(() => { notify?.([{ isIntersecting: true }]); });
    expect(images.length).toBeGreaterThanOrEqual(3);
    expect(images[0]).toMatch(/frame-001\.webp$/);
    expect(images[1]).toMatch(new RegExp(`frame-0${FILM_FRAME_COUNT}\\.webp$`));
    expect(images[2]).toMatch(/frame-019\.webp$/);
  });

  it("drops to the still when no canvas context is available", () => {
    mockMedia(desktop);
    const { container } = render(<ScrollFilm />);
    expect(container.querySelector("#film")).toHaveClass("is-static");
    expect(container.querySelector("img.film-still")).not.toBeNull();
  });
});
