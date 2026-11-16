import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetworkBackdrop } from "@/components/NetworkBackdrop";
import { buildScene, calmFactor, nodeCountFor } from "@/components/network-scene";

describe("network backdrop scene", () => {
  it("is deterministic for a seed and stays inside the canvas", () => {
    const a = buildScene(40, 5);
    const b = buildScene(40, 5);
    expect(a).toEqual(b);
    expect(a.nodes.length).toBeGreaterThan(30);
    a.nodes.forEach((node) => {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(1);
      expect(node.y).toBeGreaterThanOrEqual(0);
      expect(node.y).toBeLessThanOrEqual(1);
    });
    a.edges.forEach(({ a: from, b: to }) => expect(from).not.toBe(to));
  });

  it("keeps the headline and copy area calmer than open sky", () => {
    expect(calmFactor(0.3, 0.5)).toBeLessThan(0.5);
    expect(calmFactor(0.85, 0.5)).toBeGreaterThan(0.95);
    expect(calmFactor(0.3, 0.05)).toBeGreaterThan(0.95);
    const nodes = buildScene(300, 3).nodes;
    const inText = nodes.filter((node) => node.x > 0.1 && node.x < 0.5 && node.y > 0.28 && node.y < 0.72).length;
    const inOpen = nodes.filter((node) => node.x > 0.64 && node.x < 1 && node.y > 0.28 && node.y < 0.72).length;
    // Per unit of area, the text zone must hold clearly fewer nodes than the open zone.
    expect(inText / 0.4 / 0.44).toBeLessThan((inOpen / 0.36 / 0.44) * 0.6);
  });

  it("scales node count with the viewport within sane limits", () => {
    expect(nodeCountFor(390, 800)).toBeGreaterThanOrEqual(24);
    expect(nodeCountFor(2560, 1440)).toBeLessThanOrEqual(72);
  });
});

describe("NetworkBackdrop", () => {
  it("renders a decorative canvas and survives environments without canvas support", () => {
    const { container, unmount } = render(<NetworkBackdrop />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    fireEvent(window, new Event("resize"));
    expect(() => unmount()).not.toThrow();
  });
});
