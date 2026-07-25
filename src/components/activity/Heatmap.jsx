import { useState, useMemo } from "react";
import { C } from "../../constants/theme";
import { parseDate } from "../../utils/dataUtils";

export function Heatmap({ data }) {
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const grid = useMemo(() => {
    const map = {};
    let max = 0;
    data.forEach(r => {
      const d = parseDate(r["Connected On"]);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] = (map[key] || 0) + 1;
      if (map[key] > max) max = map[key];
    });
    const years = [...new Set(Object.keys(map).map(k => +k.split("-")[0]))].sort();
    return { map, max, years };
  }, [data]);

  const [hovered, setHovered] = useState(null);

  if (!grid.years.length) return null;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 3 }}>
          <thead>
            <tr>
              <th style={{ width: 48, color: C.textDim, fontSize: 11, fontWeight: 400, textAlign: "right", paddingRight: 8 }}></th>
              {MONTHS.map(m => (
                <th key={m} style={{ color: C.textDim, fontSize: 10, fontWeight: 400, textAlign: "center", width: 32 }}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.years.map(yr => (
              <tr key={yr}>
                <td style={{ color: C.textDim, fontSize: 11, textAlign: "right", paddingRight: 8, whiteSpace: "nowrap" }}>{yr}</td>
                {MONTHS.map((_, mi) => {
                  const key = `${yr}-${mi}`;
                  const count = grid.map[key] || 0;
                  const intensity = grid.max > 0 ? count / grid.max : 0;
                  const isHov = hovered === key;
                  const bg = count === 0
                    ? "rgba(255, 255, 255, 0.04)"
                    : `rgba(16, 185, 129, ${0.18 + intensity * 0.82})`;
                  return (
                    <td key={mi}
                      onMouseEnter={() => setHovered(key)}
                      onMouseLeave={() => setHovered(null)}
                      title={`${MONTHS[mi]} ${yr}: ${count} connections`}
                      style={{
                        width: 28, height: 22, borderRadius: 3,
                        background: bg,
                        border: isHov ? `1px solid ${C.accent}` : "1px solid transparent",
                        boxShadow: isHov ? `0 0 8px ${C.accent}aa` : "none",
                        cursor: count > 0 ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        position: "relative",
                      }}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
        <span style={{ color: C.textDim, fontSize: 11 }}>Less</span>
        {[0.1, 0.3, 0.5, 0.75, 1].map(v => (
          <div key={v} style={{ width: 16, height: 16, borderRadius: 3, background: `rgba(16, 185, 129, ${v})` }} />
        ))}
        <span style={{ color: C.textDim, fontSize: 11 }}>More</span>
      </div>
    </div>
  );
}
