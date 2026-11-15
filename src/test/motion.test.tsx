import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CitySkyline } from "@/city/components/CitySkyline";
import { useSkyParallax } from "@/city/hooks/use-sky-parallax";

const Sky = () => {
  const ref = useSkyParallax<HTMLDivElement>();
  return <div ref={ref} data-testid="sky" />;
};

const mockMedia = (matching: (query: string) => boolean) => {
  window.matchMedia = ((query: string) => ({ matches: matching(query), media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false, onchange: null })) as typeof window.matchMedia;
};

describe("ambient city lights", () => {
  it("renders twinkling windows that stay hidden from assistive tech", () => {
    const { container } = render(<CitySkyline />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".sc-window").length).toBeGreaterThan(40);
  });
});

describe("background parallax", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 0; });
    vi.stubGlobal("cancelAnimationFrame", () => {});
    vi.stubGlobal("PointerEvent", class extends MouseEvent {});
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 200, height: 200, right: 200, bottom: 200, x: 0, y: 0, toJSON: () => ({}) });
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("follows a fine pointer and settles back to zero when it leaves", () => {
    mockMedia((query) => !query.includes("reduce"));
    render(<Sky />);
    const sky = screen.getByTestId("sky");
    act(() => { fireEvent.pointerMove(sky, { clientX: 200, clientY: 0 }); });
    expect(Number(sky.style.getPropertyValue("--px"))).toBeGreaterThan(0);
    expect(Number(sky.style.getPropertyValue("--py"))).toBeLessThan(0);
    act(() => { fireEvent.pointerLeave(sky); });
    expect(Math.abs(Number(sky.style.getPropertyValue("--px")))).toBeLessThan(0.01);
  });

  it("does nothing with reduced motion", () => {
    mockMedia((query) => query.includes("reduce") || query.includes("hover"));
    render(<Sky />);
    const sky = screen.getByTestId("sky");
    act(() => { fireEvent.pointerMove(sky, { clientX: 200, clientY: 0 }); });
    expect(sky.style.getPropertyValue("--px")).toBe("");
  });

  it("does nothing on touch or coarse pointers", () => {
    mockMedia(() => false);
    render(<Sky />);
    const sky = screen.getByTestId("sky");
    act(() => { fireEvent.pointerMove(sky, { clientX: 200, clientY: 0 }); });
    expect(sky.style.getPropertyValue("--px")).toBe("");
  });
});
