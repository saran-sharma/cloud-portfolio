import { DISTRICTS, getDistrict } from "@/city/data/districts";
import { useCity } from "@/city/state/CityProvider";
import type { DistrictId } from "@/city/types";

/** Compact district navigator shown while inside a district or mission. */
export const MiniMap = ({ current }: { current: DistrictId }) => {
  const { go, progress } = useCity();
  const here = getDistrict(current);
  return (
    <nav className="sc-minimap" aria-label="District navigator">
      <svg viewBox="0 0 1000 600" aria-hidden="true" focusable="false">
        <rect width="1000" height="600" fill="#0a0a22" />
        <path d="M0,380 C60,400 90,470 140,520 C190,570 300,590 380,600 L0,600 Z" fill="#0b3b78" />
        {DISTRICTS.map((district) => (
          <circle key={district.id} cx={district.x} cy={district.y} r={district.id === current ? 46 : 30} fill={district.accent} fillOpacity={district.id === current ? 1 : progress.discovered.includes(district.id) ? 0.75 : 0.35} />
        ))}
      </svg>
      <ul>
        {DISTRICTS.map((district) => (
          <li key={district.id}>
            <button
              type="button"
              aria-current={district.id === current ? "page" : undefined}
              aria-label={`Go to ${district.name}`}
              title={district.name}
              style={{ left: `${district.x / 10}%`, top: `${district.y / 6}%`, ["--accent" as string]: district.accent }}
              onClick={() => district.id !== current && go({ name: "district", id: district.id })}
            >
              <span aria-hidden="true">{district.number}</span>
            </button>
          </li>
        ))}
      </ul>
      <p>{here.number} · {here.name}</p>
    </nav>
  );
};
