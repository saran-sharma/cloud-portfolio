import { memo } from "react";
import { DISTRICTS, START_POINT } from "@/city/data/districts";
import type { District } from "@/city/types";

const ROADS: { id: string; d: string }[] = [
  { id: "r-plaza-docks", d: `M${START_POINT.x},${START_POINT.y} Q320,525 170,440` },
  { id: "r-plaza-works", d: `M${START_POINT.x},${START_POINT.y} Q565,520 620,430` },
  { id: "r-docks-heights", d: "M170,440 Q200,300 330,200" },
  { id: "r-heights-ops", d: "M330,200 Q430,190 540,250" },
  { id: "r-ops-works", d: "M540,250 Q600,330 620,430" },
  { id: "r-ops-labs", d: "M540,250 Q700,175 840,190" },
  { id: "r-works-hq", d: "M620,430 Q740,440 860,460" },
  { id: "r-labs-hq", d: "M840,190 Q905,320 860,460" },
  { id: "r-docks-ops", d: "M170,440 Q340,385 540,250" },
];

function random(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const HEIGHT_RANGE: Record<District["environment"], [number, number]> = {
  docks: [8, 18],
  heights: [26, 64],
  works: [14, 32],
  labs: [18, 44],
  ops: [22, 52],
  hq: [20, 48],
};

type Block = { x: number; y: number; w: number; h: number; d: number; windows: { x: number; y: number }[] };

function blocksFor(district: District, index: number): Block[] {
  const next = random(index * 977 + 13);
  const [minH, maxH] = HEIGHT_RANGE[district.environment];
  const blocks: Block[] = [];
  for (let i = 0; i < 9; i += 1) {
    const angle = next() * Math.PI * 2;
    const radius = 34 + next() * 58;
    const w = 14 + next() * 14;
    const h = minH + next() * (maxH - minH);
    const x = district.x + Math.cos(angle) * radius - w / 2;
    const y = district.y + Math.sin(angle) * radius * 0.7 + 12;
    const windows = Array.from({ length: 5 }, () => ({ x: x + 2 + next() * (w - 6), y: y - h + 3 + next() * (h - 8) }));
    blocks.push({ x, y, w, h, d: 7, windows });
  }
  return blocks.sort((a, b) => a.y - b.y);
}

function pointOnRoad(t: number, from: [number, number], control: [number, number], to: [number, number]) {
  const u = 1 - t;
  return { x: u * u * from[0] + 2 * u * t * control[0] + t * t * to[0], y: u * u * from[1] + 2 * u * t * control[1] + t * t * to[1] };
}

const PALMS = [
  ...[0.12, 0.28, 0.44, 0.6, 0.76, 0.9].map((t) => pointOnRoad(t, [START_POINT.x, START_POINT.y], [320, 525], [170, 440])),
  ...[0.18, 0.36, 0.54, 0.72, 0.88].map((t) => pointOnRoad(t, [START_POINT.x, START_POINT.y], [565, 520], [620, 430])),
].map((point, index) => ({ x: point.x + (index % 2 ? 14 : -14), y: point.y + (index % 2 ? 10 : 6) }));

const STARS = Array.from({ length: 26 }, (_, index) => {
  const next = random(index * 31 + 5);
  return { x: next() * 1000, y: next() * 58, r: 0.6 + next() * 1.1, delay: next() * 4 };
});

const SKYLINE = "M0,76 L0,60 L26,60 L26,44 L46,44 L46,58 L70,58 L70,36 L92,36 L92,52 L128,52 L128,64 L160,64 L160,40 L182,40 L182,56 L230,56 L230,66 L270,66 L270,48 L292,48 L292,60 L340,60 L340,70 L1000,70 L1000,76 Z M640,70 L640,50 L664,50 L664,38 L686,38 L686,56 L720,56 L720,44 L748,44 L748,62 L790,62 L790,34 L812,34 L812,52 L850,52 L850,64 L900,64 L900,46 L924,46 L924,58 L1000,58 L1000,70 Z";

const Palm = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0,0 Q3,-14 -1,-26" stroke="#2a1745" strokeWidth="3" fill="none" strokeLinecap="round" />
    {[[-16, -10], [14, -10], [-12, 2], [12, 2], [0, -18]].map(([dx, dy], index) => (
      <path key={index} d={`M-1,-26 Q${dx / 2 - 1},${-26 + dy - 6} ${dx - 1},${-26 + dy + 8}`} stroke="#19e3b0" strokeOpacity="0.7" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    ))}
  </g>
);

export const MapArt = memo(function MapArt({ animate }: { animate: boolean }) {
  return (
    <svg className={`sc-map-art ${animate ? "" : "is-still"}`} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0620" />
          <stop offset="0.55" stopColor="#4a0f58" />
          <stop offset="0.85" stopColor="#c2306f" />
          <stop offset="1" stopColor="#ff8a3d" />
        </linearGradient>
        <linearGradient id="map-sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd36a" />
          <stop offset="1" stopColor="#ff4f8b" />
        </linearGradient>
        <linearGradient id="map-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15123a" />
          <stop offset="1" stopColor="#0a0a22" />
        </linearGradient>
        <linearGradient id="map-sea" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b4a8a" />
          <stop offset="1" stopColor="#0a1d52" />
        </linearGradient>
        <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#7a6cff" strokeOpacity="0.07" />
        </pattern>
        <clipPath id="map-sun-clip"><rect x="0" y="0" width="1000" height="72" /></clipPath>
        {DISTRICTS.map((district) => (
          <radialGradient key={district.id} id={`map-glow-${district.id}`}>
            <stop offset="0" stopColor={district.accent} stopOpacity="0.34" />
            <stop offset="1" stopColor={district.accent} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="map-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <rect width="1000" height="600" fill="url(#map-sky)" />
      {STARS.map((star, index) => <circle key={index} className="sc-star" cx={star.x} cy={star.y} r={star.r} fill="#fff" style={{ animationDelay: `${star.delay}s` }} />)}
      <g clipPath="url(#map-sun-clip)">
        <circle cx="500" cy="66" r="58" fill="url(#map-sun)" />
        {[18, 34, 46, 56].map((y) => <rect key={y} x="430" y={y + 20} width="140" height={y / 14} fill="#c2306f" />)}
      </g>
      <path d={SKYLINE} fill="#120a30" opacity="0.95" />

      <rect y="70" width="1000" height="530" fill="url(#map-land)" />
      <rect y="70" width="1000" height="530" fill="url(#map-grid)" />

      <path d="M0,380 C60,400 90,470 140,520 C190,570 300,590 380,600 L0,600 Z" fill="url(#map-sea)" />
      <rect y="588" width="1000" height="12" fill="url(#map-sea)" />
      <g className="sc-waves" stroke="#5ad7ff" strokeOpacity="0.35" fill="none" strokeWidth="1.5">
        <path d="M10,500 q14,-8 28,0 t28,0 t28,0" />
        <path d="M60,552 q14,-8 28,0 t28,0 t28,0" />
        <path d="M20,585 q14,-8 28,0 t28,0 t28,0" />
        <path d="M560,594 q14,-6 28,0 t28,0 t28,0 t28,0" />
      </g>

      {DISTRICTS.map((district) => (
        <g key={`zone-${district.id}`}>
          <circle cx={district.x} cy={district.y} r="112" fill={`url(#map-glow-${district.id})`} />
          <ellipse cx={district.x} cy={district.y + 10} rx="98" ry="70" fill="none" stroke={district.accent} strokeOpacity="0.45" strokeDasharray="5 6" />
        </g>
      ))}

      <g filter="url(#map-blur)" opacity="0.8">
        {ROADS.map((road) => <path key={`glow-${road.id}`} d={road.d} stroke="#ff2e93" strokeWidth="5" fill="none" strokeLinecap="round" />)}
      </g>
      {ROADS.map((road) => <path key={road.id} id={road.id} d={road.d} stroke="#1c1b4a" strokeWidth="11" fill="none" strokeLinecap="round" />)}
      {ROADS.map((road) => <path key={`mid-${road.id}`} d={road.d} stroke="#9aa0ff" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="7 9" fill="none" />)}

      <g>
        <rect x="70" y="448" width="64" height="9" fill="#0d2a63" stroke="#22e6ff" strokeOpacity="0.5" />
        <rect x="96" y="474" width="52" height="8" fill="#0d2a63" stroke="#22e6ff" strokeOpacity="0.5" />
        {[[206, 470], [224, 476], [242, 468]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="9" fill="#0d3a73" stroke="#22e6ff" strokeOpacity="0.7" />)}
        <path d="M150,425 L150,392 L170,392" stroke="#22e6ff" strokeWidth="2" fill="none" strokeOpacity="0.6" />
        <rect x="660" y="372" width="9" height="30" fill="#2a1c3d" stroke="#ff9a3c" strokeOpacity="0.6" />
        <rect x="676" y="380" width="7" height="22" fill="#2a1c3d" stroke="#ff9a3c" strokeOpacity="0.6" />
      </g>

      {DISTRICTS.map((district, index) =>
        blocksFor(district, index).map((block, blockIndex) => (
          <g key={`${district.id}-${blockIndex}`}>
            <rect x={block.x} y={block.y - block.h} width={block.w} height={block.h} fill="#0b0a26" stroke={district.accent} strokeOpacity="0.45" />
            <polygon points={`${block.x},${block.y - block.h} ${block.x + block.w},${block.y - block.h} ${block.x + block.w + block.d},${block.y - block.h - block.d * 0.6} ${block.x + block.d},${block.y - block.h - block.d * 0.6}`} fill={district.accent} fillOpacity="0.3" />
            <polygon points={`${block.x + block.w},${block.y - block.h} ${block.x + block.w + block.d},${block.y - block.h - block.d * 0.6} ${block.x + block.w + block.d},${block.y - block.d * 0.6} ${block.x + block.w},${block.y}`} fill="#04041a" />
            {block.windows.map((window, windowIndex) => <rect key={windowIndex} x={window.x} y={window.y} width="2.4" height="2.4" fill={district.accent} fillOpacity="0.85" />)}
          </g>
        )),
      )}

      {PALMS.map((palm, index) => <Palm key={index} x={palm.x} y={palm.y} />)}

      {animate &&
        [
          { road: "r-plaza-docks", dur: "9s", color: "#ffd36a", begin: "0s" },
          { road: "r-ops-labs", dur: "7s", color: "#ff2e93", begin: "1s" },
          { road: "r-works-hq", dur: "6s", color: "#22e6ff", begin: "2s" },
          { road: "r-docks-heights", dur: "8s", color: "#ffffff", begin: "0.5s" },
          { road: "r-ops-works", dur: "5s", color: "#ff9a3c", begin: "3s" },
        ].map((car) => (
          <circle key={car.road} r="3.2" fill={car.color}>
            <animateMotion dur={car.dur} begin={car.begin} repeatCount="indefinite"><mpath href={`#${car.road}`} /></animateMotion>
          </circle>
        ))}

      <text x="470" y="568" className="sc-map-label" textAnchor="middle">ARRIVAL PLAZA</text>
    </svg>
  );
});
