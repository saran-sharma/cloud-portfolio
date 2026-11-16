import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TechMarquee } from "@/components/TechMarquee";
import { ScrollProgress, ScrollSky } from "@/components/ScrollSky";
import { useScrollEffects } from "@/hooks/use-scroll-effects";
import { portfolio } from "@/data/portfolio";

const mockMedia = (matching: (query: string) => boolean) => {
  window.matchMedia = ((query: string) => ({ matches: matching(query), media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false, onchange: null })) as typeof window.matchMedia;
};

const Host = () => {
  const ref = useRef<HTMLDivElement>(null);
  useScrollEffects(ref);
  return (
    <div ref={ref}>
      <div data-testid="page" data-scroll="page" />
      <section data-testid="hero" data-scroll="hero" />
      <div data-testid="item" data-progress="" />
    </div>
  );
};

const scrollTo = (y: number) => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
  act(() => { window.dispatchEvent(new Event("scroll")); });
};

describe("scroll-linked motion", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 4000 });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, top: 300, width: 400, height: 200, right: 400, bottom: 500, x: 0, y: 300, toJSON: () => ({}) });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("writes page, hero and element progress as the page scrolls", () => {
    mockMedia(() => false);
    render(<Host />);
    scrollTo(1616);
    const page = Number(screen.getByTestId("page").style.getPropertyValue("--sp"));
    expect(page).toBeGreaterThan(0.4);
    expect(page).toBeLessThanOrEqual(1);
    expect(Number(screen.getByTestId("hero").style.getPropertyValue("--hp"))).toBeGreaterThan(0);
    expect(Number(screen.getByTestId("item").style.getPropertyValue("--ep"))).toBeGreaterThan(0);
  });

  it("writes nothing and removes its variables with prefers-reduced-motion", () => {
    mockMedia((query) => query.includes("reduce"));
    render(<Host />);
    scrollTo(1600);
    expect(screen.getByTestId("page").style.getPropertyValue("--sp")).toBe("");
    expect(screen.getByTestId("hero").style.getPropertyValue("--hp")).toBe("");
    expect(screen.getByTestId("item").style.getPropertyValue("--ep")).toBe("");
  });

  it("keeps the backdrop and progress bar hidden from assistive tech", () => {
    const { container } = render(<><ScrollProgress /><ScrollSky /></>);
    container.querySelectorAll(".scroll-progress, .scroll-sky").forEach((element) => expect(element).toHaveAttribute("aria-hidden", "true"));
  });
});

describe("technology ribbon", () => {
  it("only lists tools that already appear in the Toolkit data", () => {
    const { container } = render(<TechMarquee />);
    const known = new Set(portfolio.skills.flatMap((group) => group.items));
    const names = Array.from(container.querySelectorAll("li")).map((item) => item.textContent ?? "");
    expect(names.length).toBeGreaterThan(8);
    names.forEach((name) => expect(known.has(name)).toBe(true));
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("marks the repeated half as duplicate so static layouts can hide it", () => {
    const { container } = render(<TechMarquee />);
    container.querySelectorAll("ul").forEach((row) => {
      const items = row.querySelectorAll("li");
      expect(row.querySelectorAll("li[data-dup]").length).toBe(items.length / 2);
    });
  });
});
