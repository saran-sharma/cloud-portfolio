import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/sections/Hero";
import { characterAlt, characterImage } from "@/city/character";
import { createTiltEngine } from "@/hooks/use-pointer-tilt";

let queue: FrameRequestCallback[] = [];
let clock = 0;

const step = (frames = 1) => {
  for (let i = 0; i < frames; i += 1) {
    const callbacks = queue;
    queue = [];
    clock += 16;
    callbacks.forEach((callback) => callback(clock));
  }
};

const mockMedia = (fine: boolean, reduced: boolean) => {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : fine,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
};

const readVar = (element: HTMLElement, name: string) => parseFloat(element.style.getPropertyValue(name));

beforeEach(() => {
  queue = [];
  clock = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    queue.push(callback);
    return queue.length;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {
    queue = [];
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0, top: 0, right: 400, bottom: 400, x: 0, y: 0, width: 400, height: 400, toJSON: () => ({}),
  } as DOMRect);
  class TestPointerEvent extends MouseEvent {
    pointerType: string;
    constructor(type: string, init: MouseEventInit & { pointerType?: string } = {}) {
      super(type, init);
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  mockMedia(false, false);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("tilt engine", () => {
  const setup = () => {
    const element = document.createElement("div");
    return { element, engine: createTiltEngine(() => element) };
  };

  it("eases towards the cursor instead of jumping", () => {
    const { element, engine } = setup();
    engine.move(400, 200);
    step(1);
    const first = readVar(element, "--nx");
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(0.5);
    step(80);
    expect(readVar(element, "--nx")).toBeGreaterThan(0.99);
    expect(Math.abs(readVar(element, "--ny"))).toBeLessThan(0.01);
    expect(readVar(element, "--m")).toBeGreaterThan(0.99);
  });

  it("moves the atmosphere the opposite way and the light with the cursor", () => {
    const { element, engine } = setup();
    engine.move(400, 100);
    step(120);
    expect(readVar(element, "--bx")).toBeLessThan(-0.95);
    expect(readVar(element, "--by")).toBeGreaterThan(0.45);
    expect(readVar(element, "--lx")).toBeGreaterThan(99);
    expect(readVar(element, "--ly")).toBeCloseTo(25, 0);
    expect(readVar(element, "--lo")).toBeGreaterThan(0.98);
  });

  it("stays within -1..1 when the pointer is outside the container", () => {
    const { element, engine } = setup();
    engine.move(-900, 4000);
    step(120);
    expect(readVar(element, "--nx")).toBeGreaterThanOrEqual(-1);
    expect(readVar(element, "--nx")).toBeLessThan(-0.99);
    expect(readVar(element, "--ny")).toBeLessThanOrEqual(1);
  });

  it("settles smoothly on leave, fades the light and stops the frame loop", () => {
    const { element, engine } = setup();
    engine.move(0, 400);
    step(80);
    engine.leave();
    step(2);
    expect(Math.abs(readVar(element, "--nx"))).toBeGreaterThan(0.1);
    step(200);
    expect(Math.abs(readVar(element, "--nx"))).toBeLessThan(0.001);
    expect(Math.abs(readVar(element, "--ny"))).toBeLessThan(0.001);
    expect(readVar(element, "--lo")).toBeLessThan(0.01);
    expect(queue).toHaveLength(0);
  });

  it("goes idle when the pointer is still and removes its properties on reset", () => {
    const { element, engine } = setup();
    engine.move(300, 300);
    step(150);
    expect(queue).toHaveLength(0);
    engine.reset();
    expect(element.style.getPropertyValue("--nx")).toBe("");
    expect(element.style.getPropertyValue("--lo")).toBe("");
  });
});

describe("hero portrait", () => {
  const portrait = () => screen.getByRole("img", { name: characterAlt }).closest("figure") as HTMLElement;

  it("shows the character artwork with decorative layers hidden from assistive tech", () => {
    render(<Hero />);
    const figure = portrait();
    expect(screen.getByRole("img", { name: characterAlt }).getAttribute("src")).toBe(characterImage);
    ["photo-ambient", "photo-light", "photo-ruler"].forEach((name) => {
      expect(figure.querySelector(`.${name}`)).toHaveAttribute("aria-hidden", "true");
    });
    expect(figure).not.toHaveClass("is-interactive");
  });

  it("tilts with a mouse, ignores touch and settles back on leave", () => {
    mockMedia(true, false);
    render(<Hero />);
    const figure = portrait();
    expect(figure).toHaveClass("is-interactive");

    fireEvent.pointerMove(figure, { clientX: 400, clientY: 200, pointerType: "touch" });
    step(5);
    expect(figure.style.getPropertyValue("--nx")).toBe("");

    fireEvent.pointerMove(figure, { clientX: 400, clientY: 200, pointerType: "mouse" });
    act(() => step(80));
    expect(readVar(figure, "--nx")).toBeGreaterThan(0.99);

    fireEvent.pointerLeave(figure);
    act(() => step(220));
    expect(Math.abs(readVar(figure, "--nx"))).toBeLessThan(0.001);
    expect(readVar(figure, "--lo")).toBeLessThan(0.01);
  });

  it("stays static when reduced motion is requested", () => {
    mockMedia(true, true);
    render(<Hero />);
    const figure = portrait();
    expect(figure).not.toHaveClass("is-interactive");
    fireEvent.pointerMove(figure, { clientX: 400, clientY: 200, pointerType: "mouse" });
    step(10);
    expect(figure.style.getPropertyValue("--nx")).toBe("");
  });

  it("does not change the hero text or calls to action", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("I build data platforms. I automate what slows them down.");
    expect(screen.getByRole("link", { name: "Explore My Work" })).toHaveAttribute("href", "#projects");
    expect(screen.getByRole("link", { name: "Download Resume" })).toHaveAttribute("href", "/resume.pdf");
  });
});
