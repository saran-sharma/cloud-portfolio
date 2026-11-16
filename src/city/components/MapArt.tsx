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

const accentOf = (id: string) => DISTRICTS.find((district) => district.id === id)?.accent ?? "#22e6ff";

type Lot = { x: number; y: number; w: number; h: number; dense: boolean };

/** Flat street lots for a district, like a city-plan map. Deterministic, with a clear plaza under the marker. */
function lotsFor(district: District, index: number): Lot[] {
  const next = random(index * 977 + 13);
  const cols = 8;
  const rows = 6;
  const cw = 24;
  const ch = 16;
  const gap = 5;
  const width = cols * (cw + gap) - gap;
  const height = rows * (ch + gap) - gap;
  const lots: Lot[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = district.x - width / 2 + col * (cw + gap);
      const y = district.y + 8 - height / 2 + row * (ch + gap);
      const skip = next() < 0.16;
      const w = cw - next() * 5;
      const h = ch - next() * 4;
      const dense = next() < 0.3;
      if (skip || Math.hypot(x + cw / 2 - district.x, (y + ch / 2 - district.y) * 1.3) < 30) continue;
      lots.push({ x, y, w, h, dense });
    }
  }
  return lots;
}

const PARKS = [
  { x: 432, y: 345, rx: 52, ry: 24 },
  { x: 732, y: 325, rx: 44, ry: 22 },
  { x: 722, y: 528, rx: 62, ry: 18 },
];

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

const CONTAINERS: [number, number, string][] = [[70, 436, "#ff9a3c"], [82, 436, "#ff2e93"], [94, 436, "#ffd36a"], [106, 436, "#22e6ff"], [76, 428, "#ffd36a"], [88, 428, "#ff9a3c"]];

/** A few deliberate pictorial landmarks, one cluster per district, drawn flat like a map legend. */
const Landmarks = () => {
  const docks = accentOf("data-docks");
  const heights = accentOf("cloud-heights");
  const works = accentOf("automation-works");
  const labs = accentOf("neon-ai-labs");
  const ops = accentOf("operations-hq");
  const hq = accentOf("headquarters");
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {/* Data Docks: piers, container stacks, a gantry crane and storage tanks */}
      <rect x="70" y="448" width="64" height="9" fill="#0d2a63" stroke={docks} strokeOpacity="0.6" />
      <rect x="96" y="474" width="52" height="8" fill="#0d2a63" stroke={docks} strokeOpacity="0.6" />
      {CONTAINERS.map(([x, y, color]) => <rect key={`${x}-${y}`} x={x} y={y} width="10" height="7" fill={color} fillOpacity="0.85" />)}
      <path d="M122,448 V418 H146 M122,418 L116,430 M146,418 V430" fill="none" stroke={docks} strokeWidth="1.8" strokeOpacity="0.9" />
      {[[206, 470], [224, 476], [242, 468]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="9" fill="#0d3a73" stroke={docks} strokeOpacity="0.7" />)}

      {/* Cloud Heights: a small tower cluster */}
      <g fill="#0b0a26" stroke={heights} strokeOpacity="0.9" strokeWidth="1.3">
        <rect x="258" y="146" width="13" height="40" />
        <rect x="274" y="158" width="11" height="28" />
        <rect x="288" y="152" width="13" height="34" />
        <path d="M264.5,146 V134" fill="none" />
      </g>
      <g stroke={heights} strokeOpacity="0.8" strokeWidth="1.2">
        {[154, 164, 174].map((y) => <path key={y} d={`M262,${y} h5 M292,${y + 2} h5`} />)}
      </g>

      {/* Automation Works: smokestacks and a sawtooth factory roof */}
      <rect x="660" y="372" width="9" height="30" fill="#2a1c3d" stroke={works} strokeOpacity="0.7" />
      <rect x="676" y="380" width="7" height="22" fill="#2a1c3d" stroke={works} strokeOpacity="0.7" />
      <path d="M648,490 V470 L661,460 V470 L674,460 V470 L687,460 V470 L700,460 V490 Z" fill="#2a1c3d" stroke={works} strokeOpacity="0.85" strokeWidth="1.4" />

      {/* Neon AI Labs: research dome and a small network */}
      <path d="M868,172 A18,18 0 0 1 904,172 Z" fill="#1d0b33" stroke={labs} strokeWidth="1.6" strokeOpacity="0.95" />
      <path d="M862,172 H910" stroke={labs} strokeWidth="1.6" strokeOpacity="0.8" fill="none" />
      <path d="M792,154 L812,142 L834,152 L852,140" fill="none" stroke={labs} strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="3 3" />
      {[[792, 154], [812, 142], [834, 152], [852, 140]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3.2" fill={labs} fillOpacity="0.9" />)}

      {/* Operations HQ: radar dish and monitor wall */}
      <path d="M524,216 Q540,190 556,216" fill="none" stroke={ops} strokeWidth="1.8" strokeOpacity="0.95" />
      <path d="M540,204 V220 M534,220 H546" fill="none" stroke={ops} strokeWidth="1.6" strokeOpacity="0.9" />
      <path d="M560,196 q8,6 0,14 M566,192 q12,10 0,22" fill="none" stroke={ops} strokeOpacity="0.5" strokeWidth="1.2" />
      {[0, 1, 2].map((i) => <rect key={i} x={490 + i * 14} y="196" width="11" height="8" fill="#08201f" stroke={ops} strokeOpacity="0.8" />)}

      {/* Saran's Headquarters: tower with a helipad */}
      <rect x="896" y="470" width="18" height="38" fill="#2a0f22" stroke={hq} strokeWidth="1.4" strokeOpacity="0.95" />
      <path d="M905,470 V456" stroke={hq} strokeWidth="1.4" fill="none" />
      <circle cx="938" cy="492" r="14" fill="#2a0f22" stroke={hq} strokeOpacity="0.8" strokeWidth="1.4" />
      <path d="M933,486 V498 M943,486 V498 M933,492 H943" fill="none" stroke={hq} strokeOpacity="0.9" strokeWidth="1.4" />

      {/* Compass */}
      <g transform="translate(948 556)" fill="none" stroke="#c8c2ff" strokeOpacity="0.7" strokeWidth="1.2">
        <circle r="14" />
        <path d="M0,-12 L4,2 L0,0 L-4,2 Z" fill="#c8c2ff" fillOpacity="0.8" />
      </g>
      <text x="948" y="530" className="sc-map-label" textAnchor="middle">N</text>
    </g>
  );
};

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
        {DISTRICTS.map((district) => (
          <clipPath key={`clip-${district.id}`} id={`map-zone-${district.id}`}>
            <ellipse cx={district.x} cy={district.y + 10} rx="98" ry="70" />
          </clipPath>
        ))}
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
      <path d="M0,380 C60,400 90,470 140,520 C190,570 300,590 380,600" fill="none" stroke="#bff4ff" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M0,356 C62,378 100,448 150,496 C206,548 300,570 386,578" fill="none" stroke="#9aa0ff" strokeOpacity="0.4" strokeWidth="1.4" strokeDasharray="3 7" />
      <g className="sc-waves" stroke="#5ad7ff" strokeOpacity="0.35" fill="none" strokeWidth="1.5">
        <path d="M10,500 q14,-8 28,0 t28,0 t28,0" />
        <path d="M60,552 q14,-8 28,0 t28,0 t28,0" />
        <path d="M20,585 q14,-8 28,0 t28,0 t28,0" />
        <path d="M560,594 q14,-6 28,0 t28,0 t28,0 t28,0" />
      </g>
      <g fill="#0d2a63" stroke="#bff4ff" strokeOpacity="0.7" strokeWidth="1.2">
        <path d="M24,540 h20 l-4,7 h-12 z" />
        <path d="M118,568 h18 l-4,6 h-10 z" />
        <path d="M232,588 h18 l-4,6 h-10 z" />
      </g>
      {PARKS.map((park) => (
        <g key={`${park.x}-${park.y}`}>
          <ellipse cx={park.x} cy={park.y} rx={park.rx} ry={park.ry} fill="#1fd18b" fillOpacity="0.1" stroke="#1fd18b" strokeOpacity="0.4" strokeWidth="1.2" />
          {[-0.5, -0.1, 0.3, 0.6].map((offset, index) => <circle key={index} cx={park.x + offset * park.rx} cy={park.y + (index % 2 ? 4 : -4)} r="3.2" fill="#1fd18b" fillOpacity="0.45" />)}
        </g>
      ))}

      {DISTRICTS.map((district, index) => (
        <g key={`zone-${district.id}`}>
          <circle cx={district.x} cy={district.y} r="112" fill={`url(#map-glow-${district.id})`} />
          <ellipse cx={district.x} cy={district.y + 10} rx="98" ry="70" fill={district.accent} fillOpacity="0.06" stroke={district.accent} strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="5 6" />
          <g clipPath={`url(#map-zone-${district.id})`}>
            {lotsFor(district, index).map((lot, lotIndex) => (
              <rect key={lotIndex} x={lot.x} y={lot.y} width={lot.w} height={lot.h} rx="1.5" fill={lot.dense ? district.accent : "#0b0a26"} fillOpacity={lot.dense ? 0.2 : 0.9} stroke={district.accent} strokeOpacity="0.35" strokeWidth="0.8" />
            ))}
          </g>
        </g>
      ))}

      <g filter="url(#map-blur)" opacity="0.8">
        {ROADS.map((road) => <path key={`glow-${road.id}`} d={road.d} stroke="#ff2e93" strokeWidth="5" fill="none" strokeLinecap="round" />)}
      </g>
      {ROADS.map((road) => <path key={road.id} id={road.id} d={road.d} stroke="#1c1b4a" strokeWidth="11" fill="none" strokeLinecap="round" />)}
      {ROADS.map((road) => <path key={`mid-${road.id}`} d={road.d} stroke="#9aa0ff" strokeOpacity="0.55" strokeWidth="1.4" strokeDasharray="7 9" fill="none" />)}

      <Landmarks />

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
