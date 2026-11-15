/** The coastal skyline silhouette shared by the Saran City intro and the Recruiter Mode hero. */
export const CitySkyline = () => (
  <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true">
    <path d="M0,300 V210 h60 v-70 h50 v40 h40 v-110 h46 v150 h70 v-60 h56 v90 h80 v-130 h40 v100 h90 v-50 h60 v120 h110 v-90 h54 v-120 h46 v150 h70 v-80 h60 v110 h86 v-150 h40 v180 h70 v-70 h56 v100 h80 V300 Z" fill="#0b0720" />
    {[160, 420, 1180].map((x) => (
      <g key={x} transform={`translate(${x} 300)`}>
        <path d="M0,0 Q8,-80 -4,-150" stroke="#08041a" strokeWidth="10" fill="none" />
        {[[-70, -30], [70, -30], [-56, 12], [56, 12], [0, -64]].map(([dx, dy], index) => <path key={index} d={`M-4,-150 Q${dx / 2},${-150 + dy - 20} ${dx},${-150 + dy + 28}`} stroke="#08041a" strokeWidth="7" fill="none" />)}
      </g>
    ))}
  </svg>
);
