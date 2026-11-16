/** Building footprints in the skyline path below: [left, right, roof height]. */
const BUILDINGS: [number, number, number][] = [
  [0, 60, 210], [60, 110, 140], [110, 150, 180], [150, 196, 70], [196, 266, 220], [266, 322, 160], [322, 402, 250],
  [402, 442, 120], [442, 532, 220], [532, 592, 170], [702, 756, 200], [756, 802, 80], [802, 872, 230], [872, 932, 150],
  [932, 1018, 260], [1018, 1058, 110], [1128, 1184, 220],
];

/** A fixed, sparse pattern of lit windows, so the lights are the same on every render. */
const WINDOWS = BUILDINGS.flatMap(([left, right, roof], building) => {
  const lit: { x: number; y: number; delay: number; duration: number; warm: boolean }[] = [];
  for (let column = 0, x = left + 8; x <= right - 14; x += 14, column += 1) {
    for (let row = 0, y = roof + 12; y < Math.min(roof + 96, 292); y += 16, row += 1) {
      if ((column * 5 + row * 3 + building * 7) % 4 === 0) {
        lit.push({ x, y, delay: ((column * 3 + row * 5 + building * 2) % 9) * 0.7, duration: 4 + ((column + row + building) % 4) * 1.6, warm: (column + row + building) % 3 !== 0 });
      }
    }
  }
  return lit;
});

/** The coastal skyline silhouette shared by the Saran Universe intro and the Recruiter Mode hero. */
export const CitySkyline = () => (
  <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true">
    <path d="M0,300 V210 h60 v-70 h50 v40 h40 v-110 h46 v150 h70 v-60 h56 v90 h80 v-130 h40 v100 h90 v-50 h60 v120 h110 v-90 h54 v-120 h46 v150 h70 v-80 h60 v110 h86 v-150 h40 v180 h70 v-70 h56 v100 h80 V300 Z" fill="#0b0720" />
    <g className="sc-lights">
      {WINDOWS.map((lit, index) => (
        <rect key={index} className="sc-window" x={lit.x} y={lit.y} width="5" height="7" rx="1" fill={lit.warm ? "#ffd36a" : "#22e6ff"} style={{ animationDelay: `${lit.delay}s`, animationDuration: `${lit.duration}s` }} />
      ))}
    </g>
    {[160, 420, 1180].map((x) => (
      <g key={x} transform={`translate(${x} 300)`}>
        <path d="M0,0 Q8,-80 -4,-150" stroke="#08041a" strokeWidth="10" fill="none" />
        {[[-70, -30], [70, -30], [-56, 12], [56, 12], [0, -64]].map(([dx, dy], index) => <path key={index} d={`M-4,-150 Q${dx / 2},${-150 + dy - 20} ${dx},${-150 + dy + 28}`} stroke="#08041a" strokeWidth="7" fill="none" />)}
      </g>
    ))}
  </svg>
);
