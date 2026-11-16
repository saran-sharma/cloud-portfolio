/**
 * Layout model for the Recruiter Mode network backdrop. It is pure so it can be tested: the same
 * seed always gives the same scene, and nodes are deliberately thin where the headline, copy and
 * buttons sit (the "calm zone"), so the animation never competes with the text.
 */
export interface NetNode {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
  amp: number;
  /** A larger, hexagon-outlined node that reads as a platform service. */
  service: boolean;
}
export interface NetEdge { a: number; b: number }
export interface NetScene { nodes: NetNode[]; edges: NetEdge[] }

const ASPECT = 16 / 9;

const smooth = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** 1 in open sky, about .28 over the left and centre text block. Inputs are 0 to 1 in canvas space. */
export const calmFactor = (x: number, y: number) => {
  const horizontal = smooth(0.0, 0.07, x) * (1 - smooth(0.5, 0.64, x));
  const vertical = smooth(0.1, 0.26, y) * (1 - smooth(0.74, 0.9, y));
  return 1 - 0.55 * horizontal * vertical;
};

const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export function buildScene(count: number, seed = 11): NetScene {
  const random = mulberry32(seed);
  const nodes: NetNode[] = [];
  let guard = 0;
  while (nodes.length < count && guard < count * 60) {
    guard += 1;
    const x = random();
    const y = random() * 0.92;
    if (random() > calmFactor(x, y)) continue;
    nodes.push({ x, y, r: 1.2 + random() * 1.6, phase: random() * Math.PI * 2, speed: 0.05 + random() * 0.08, amp: 0.004 + random() * 0.008, service: random() < 0.14 });
  }
  const edges: NetEdge[] = [];
  const seen = new Set<string>();
  nodes.forEach((node, a) => {
    const near = nodes
      .map((other, b) => ({ b, d: Math.hypot((node.x - other.x) * ASPECT, node.y - other.y) }))
      .filter(({ b, d }) => b !== a && d < 0.27)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    near.forEach(({ b }) => {
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!seen.has(key)) { seen.add(key); edges.push({ a, b }); }
    });
  });
  return { nodes, edges };
}

export const nodeCountFor = (width: number, height: number) => Math.round(Math.min(72, Math.max(24, (width * height) / 19000)));
