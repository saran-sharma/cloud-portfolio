import type { EnvironmentId } from "@/city/types";

const SKY = (id: string, stops: [string, string, string]) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={stops[0]} />
    <stop offset="0.7" stopColor={stops[1]} />
    <stop offset="1" stopColor={stops[2]} />
  </linearGradient>
);

const grid = (cols: number, rows: number, x: number, y: number, w: number, h: number, seed: number, color: string) => {
  const cells = [];
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      if (((c * 7 + r * 13 + seed) % 5) < 3) cells.push(<rect key={`${c}-${r}`} x={x + 6 + c * ((w - 12) / cols)} y={y + 8 + r * ((h - 16) / rows)} width="5" height="6" fill={color} fillOpacity="0.8" />);
    }
  }
  return cells;
};

const gearPath = (cx: number, cy: number, radius: number, teeth: number) => {
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i += 1) {
    const angle = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 ? radius * 0.82 : radius;
    points.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
  }
  return `M${points.join(" L")} Z`;
};

const Docks = () => (
  <>
    <defs>{SKY("env-docks", ["#06122e", "#0e4b8a", "#ff7a59"])}</defs>
    <rect width="1600" height="700" fill="url(#env-docks)" />
    <circle cx="1180" cy="400" r="86" fill="#ffb36b" opacity="0.75" />
    <rect y="470" width="1600" height="230" fill="#061a3d" />
    {[120, 360, 640, 920].map((x, index) => (
      <g key={x} stroke="#0a0f2c" strokeWidth="6" fill="none">
        <path d={`M${x},470 L${x},300 L${x + 120},300 L${x + 120},340`} />
        <path d={`M${x},300 L${x - 36},470 M${x + 120},300 L${x + 150},470`} strokeWidth="3" />
        <circle cx={x + 120} cy={346 + index} r="4" fill="#22e6ff" stroke="none" />
      </g>
    ))}
    {[1100, 1220, 1340, 1460].map((x, index) => (
      <g key={x}>
        <rect x={x} y={360 - index * 8} width="90" height={110 + index * 8} rx="8" fill="#0b2757" stroke="#22e6ff" strokeOpacity="0.6" />
        <ellipse cx={x + 45} cy={360 - index * 8} rx="45" ry="10" fill="#14407f" stroke="#22e6ff" strokeOpacity="0.6" />
        <rect x={x} y={400 - index * 8} width="90" height="6" fill="#22e6ff" fillOpacity="0.6" />
      </g>
    ))}
    <path className="sc-dash" d="M0,520 C300,500 500,560 800,520 S1300,490 1600,530" stroke="#22e6ff" strokeWidth="5" fill="none" strokeDasharray="14 14" />
    <path className="sc-dash is-slow" d="M0,560 C300,540 560,600 880,560 S1320,540 1600,580" stroke="#ff2e93" strokeWidth="3" fill="none" strokeDasharray="8 16" />
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={40 + i * 74} y={430 - (i % 3) * 22} width="62" height={40 + (i % 3) * 22} fill={["#2b7fff", "#ff7a59", "#22e6ff"][i % 3]} fillOpacity="0.55" />)}
    <path d="M0,610 q40,-12 80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0 t80,0" className="sc-wave" stroke="#5ad7ff" strokeOpacity="0.4" fill="none" strokeWidth="2" />
  </>
);

const Heights = () => (
  <>
    <defs>{SKY("env-heights", ["#050a2a", "#1b2f8f", "#7b4bd6"])}</defs>
    <rect width="1600" height="700" fill="url(#env-heights)" />
    {[200, 520, 1000].map((x) => <ellipse key={x} cx={x} cy="150" rx="170" ry="26" fill="#9fb4ff" opacity="0.12" />)}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const x = 80 + i * 220;
      const h = 220 + ((i * 97) % 5) * 54;
      return (
        <g key={i}>
          <rect x={x} y={700 - h} width="130" height={h} fill="#0a1238" stroke="#3b6cff" strokeOpacity="0.6" />
          {grid(6, Math.floor(h / 32), x, 700 - h, 130, h, i, "#7fb0ff")}
          <rect x={x + 55} y={690 - h} width="20" height="12" fill="#22e6ff" />
        </g>
      );
    })}
    {[[145, 480, 365, 410], [365, 410, 585, 470], [585, 470, 805, 360], [805, 360, 1025, 450], [1025, 450, 1245, 380]].map(([x1, y1, x2, y2], index) => (
      <path key={index} className="sc-dash" d={`M${x1},${y1} Q${(x1 + x2) / 2},${Math.min(y1, y2) - 80} ${x2},${y2}`} stroke="#22e6ff" strokeWidth="3" fill="none" strokeDasharray="6 12" />
    ))}
  </>
);

const Works = () => (
  <>
    <defs>{SKY("env-works", ["#1a0a1e", "#7a2a3a", "#ff9a3c"])}</defs>
    <rect width="1600" height="700" fill="url(#env-works)" />
    <path d="M100,520 L100,330 L260,400 L260,330 L420,400 L420,330 L580,400 L580,330 L740,400 L740,520 Z" fill="#1a0f26" stroke="#ff9a3c" strokeOpacity="0.6" />
    {[820, 900].map((x) => <rect key={x} x={x} y="260" width="38" height="260" fill="#1f1230" stroke="#ff9a3c" strokeOpacity="0.5" />)}
    {[0, 1, 2].map((i) => <circle key={i} className="sc-smoke" cx={839 + i * 8} cy={240 - i * 36} r={14 + i * 8} fill="#ffd9b0" opacity={0.22 - i * 0.05} style={{ animationDelay: `${i * 0.9}s` }} />)}
    {[[1080, 300, 90, 10], [1250, 360, 60, 8], [1390, 270, 70, 9]].map(([cx, cy, r, teeth], index) => (
      <path key={index} className={`sc-spin ${index % 2 ? "is-reverse" : ""}`} d={gearPath(cx, cy, r, teeth)} fill="#2a1830" stroke="#ff9a3c" strokeWidth="3" style={{ transformOrigin: `${cx}px ${cy}px` }} />
    ))}
    <rect y="520" width="1600" height="30" fill="#2a1830" />
    <rect y="548" width="1600" height="10" fill="#ff9a3c" fillOpacity="0.4" />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} className="sc-belt" x={80 + i * 320} y="486" width="60" height="34" rx="4" fill="#ff9a3c" style={{ animationDelay: `${i * -1.4}s` }} />)}
    <path className="sc-dash" d="M0,600 L1600,600" stroke="#22e6ff" strokeWidth="3" strokeDasharray="20 14" />
  </>
);

const NODES: [number, number][] = [[300, 260], [480, 180], [480, 340], [680, 120], [680, 260], [680, 400], [900, 200], [900, 340], [1120, 270]];

const Labs = () => (
  <>
    <defs>
      {SKY("env-labs", ["#12041f", "#52106a", "#ff2e93"])}
      <linearGradient id="env-labs-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff2e93" stopOpacity="0.4" /><stop offset="1" stopColor="#12041f" /></linearGradient>
    </defs>
    <rect width="1600" height="700" fill="url(#env-labs)" />
    <rect y="470" width="1600" height="230" fill="url(#env-labs-floor)" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${800 + (i - 6) * 40},470 L${800 + (i - 6) * 220},700`} stroke="#ff9ad0" strokeOpacity="0.35" />)}
    {[490, 520, 565, 630].map((y) => <path key={y} d={`M0,${y} H1600`} stroke="#ff9ad0" strokeOpacity="0.25" />)}
    <path d="M1180,470 A160,160 0 0 1 1500,470 Z" fill="#240a3a" stroke="#ff2e93" strokeOpacity="0.7" />
    <path d="M1340,310 V250" stroke="#ff2e93" strokeWidth="3" />
    <circle cx="1340" cy="244" r="6" fill="#22e6ff" className="sc-pulse" />
    {NODES.flatMap(([x1, y1], i) => NODES.slice(i + 1).filter(([x2], j) => Math.abs(x2 - x1) > 0 && Math.abs(x2 - x1) < 260 && (i + j) % 2 === 0).map(([x2, y2], j) => <line key={`${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22e6ff" strokeOpacity="0.45" />))}
    {NODES.map(([x, y], i) => <circle key={i} className="sc-pulse" cx={x} cy={y} r="11" fill="#22e6ff" fillOpacity="0.85" style={{ animationDelay: `${i * 0.35}s` }} />)}
  </>
);

const Ops = () => (
  <>
    <defs>{SKY("env-ops", ["#031a1f", "#06323a", "#0a5a63"])}</defs>
    <rect width="1600" height="700" fill="url(#env-ops)" />
    {Array.from({ length: 6 }, (_, c) => Array.from({ length: 3 }, (_, r) => {
      const x = 90 + c * 250;
      const y = 80 + r * 150;
      return (
        <g key={`${c}-${r}`}>
          <rect x={x} y={y} width="220" height="124" rx="6" fill="#02262c" stroke="#2af5d0" strokeOpacity="0.7" />
          {[0, 1, 2, 3, 4, 5].map((b) => <rect key={b} className="sc-bar" x={x + 16 + b * 32} y={y + 100 - ((c + r + b) % 4) * 20 - 14} width="20" height={((c + r + b) % 4) * 20 + 14} fill="#2af5d0" fillOpacity="0.75" style={{ animationDelay: `${(b + c) * 0.2}s` }} />)}
        </g>
      );
    }))}
    <path className="sc-dash" d="M90,590 L220,560 L360,600 L520,540 L690,580 L860,520 L1040,570 L1200,510 L1380,560 L1500,520" stroke="#ffd36a" strokeWidth="3" fill="none" strokeDasharray="10 8" />
    <rect className="sc-scan" x="0" y="0" width="1600" height="6" fill="#2af5d0" fillOpacity="0.25" />
  </>
);

const Hq = () => (
  <>
    <defs>
      {SKY("env-hq", ["#14051f", "#7a1d5e", "#ff7a59"])}
      <linearGradient id="env-hq-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd36a" /><stop offset="1" stopColor="#ff4f8b" /></linearGradient>
    </defs>
    <rect width="1600" height="700" fill="url(#env-hq)" />
    <circle cx="1100" cy="400" r="120" fill="url(#env-hq-sun)" />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x="980" y={366 + i * 26} width="240" height={i * 2} fill="#7a1d5e" />)}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const h = 120 + ((i * 53) % 5) * 40;
      return <rect key={i} x={i * 210 - 20} y={700 - h} width="150" height={h} fill="#12062a" stroke="#ff6b6b" strokeOpacity="0.35" />;
    })}
    <rect y="560" width="1600" height="140" fill="#0c0420" />
    <path d="M0,560 H1600" stroke="#ff6b6b" strokeOpacity="0.7" />
    {[160, 360, 1380].map((x) => <g key={x} transform={`translate(${x} 560)`}><path d="M0,0 Q10,-70 -4,-130" stroke="#1c0b38" strokeWidth="9" fill="none" />{[[-60, -30], [60, -30], [-48, 10], [48, 10], [0, -60]].map(([dx, dy], i) => <path key={i} d={`M-4,-130 Q${dx / 2},${-130 + dy - 18} ${dx},${-130 + dy + 26}`} stroke="#19e3b0" strokeOpacity="0.55" strokeWidth="6" fill="none" />)}</g>)}
  </>
);

const SCENES: Record<EnvironmentId, () => JSX.Element> = { docks: Docks, heights: Heights, works: Works, labs: Labs, ops: Ops, hq: Hq };

export const DistrictEnvironment = ({ id, animate }: { id: EnvironmentId; animate: boolean }) => {
  const Scene = SCENES[id];
  return (
    <svg className={`sc-env ${animate ? "" : "is-still"}`} viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <Scene />
    </svg>
  );
};
