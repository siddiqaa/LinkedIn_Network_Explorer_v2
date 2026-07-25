import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { C, SENIORITY } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";

const SENIORITY_WEIGHTS = {
  "C-Suite / Founder": 100,
  "VP / Director": 80,
  "Manager / Lead": 60,
  "Senior / Mid": 40,
  "Junior / Associate": 20,
  "Retired": 10,
  "Unknown / Other": 0
};

export function CompanySeniorityMatrix({ data, mlResults }) {
  const [chartType, setChartType] = useState("stacked"); // "stacked" | "matrix"
  const [sortBy, setSortBy] = useState("size"); // "size" | "alpha" | "score"
  const [selectedCell, setSelectedCell] = useState(null); // { company, seniority } for drilldown
  const [searchFilter, setSearchFilter] = useState("");

  // Process data to map each record's seniority
  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map(r => {
      const company = (r["Company"] || "").trim();
      const title = (r["Position_raw"] || r["Position"] || "").trim();
      const firstName = (r["First Name"] || "").trim();
      const lastName = (r["Last Name"] || "").trim();
      const name = `${firstName} ${lastName}`.trim() || "Unknown Connection";

      let seniority = "Unknown / Other";
      if (mlResults && mlResults[title] && mlResults[title].override !== false) {
        seniority = mlResults[title].seniority;
      } else {
        seniority = classifySeniority(title);
      }

      return {
        ...r,
        company: company || "Unspecified Company",
        title: title || "Unspecified Role",
        name,
        seniority
      };
    }).filter(r => r.company !== "Unspecified Company");
  }, [data, mlResults]);

  // Compute all companies with >= 2 connections
  const topCompanies = useMemo(() => {
    const counts = {};
    processedData.forEach(r => {
      counts[r.company] = (counts[r.company] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([c, count]) => count >= 2)
      .map(([c]) => c);
  }, [processedData]);

  // Build matrix data for Recharts Stacked Bar Chart & Table
  const stackedData = useMemo(() => {
    const map = {};
    topCompanies.forEach(c => {
      map[c] = { company: c, total: 0 };
      SENIORITY.forEach(s => {
        map[c][s.label] = 0;
      });
    });

    processedData.forEach(r => {
      if (map[r.company]) {
        map[r.company].total += 1;
        if (map[r.company][r.seniority] !== undefined) {
          map[r.company][r.seniority] += 1;
        } else {
          map[r.company]["Unknown / Other"] = (map[r.company]["Unknown / Other"] || 0) + 1;
        }
      }
    });

    // Calculate score for each company
    Object.values(map).forEach(item => {
      let totalW = 0;
      let countW = 0;
      SENIORITY.forEach(s => {
        const w = SENIORITY_WEIGHTS[s.label] || 0;
        const c = item[s.label] || 0;
        totalW += c * w;
        countW += c;
      });
      item.score = countW > 0 ? Math.round((totalW / countW) * 10) / 10 : 0;
    });

    let list = Object.values(map);
    if (sortBy === "alpha") {
      list.sort((a, b) => a.company.localeCompare(b.company));
    } else if (sortBy === "score") {
      list.sort((a, b) => b.score - a.score);
    } else {
      list.sort((a, b) => b.total - a.total);
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(item => item.company.toLowerCase().includes(q));
    }
    return list;
  }, [processedData, topCompanies, searchFilter, sortBy]);

  // Drilldown records for selected cell
  const drilldownRecords = useMemo(() => {
    if (!selectedCell) return [];
    return processedData.filter(r => 
      r.company === selectedCell.company && r.seniority === selectedCell.seniority
    );
  }, [processedData, selectedCell]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Controls Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", flex: 1 }}>
          <input
            type="text"
            placeholder="Filter companies in cross-section..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 6, color: C.text, fontSize: 12, outline: "none", width: 220, fontFamily: "inherit"
            }}
          />
          <div style={{ display: "flex", background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, gap: 2 }}>
            <button
              onClick={() => setSortBy("size")}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: sortBy === "size" ? C.card : "transparent",
                color: sortBy === "size" ? C.accent : C.textDim,
                border: sortBy === "size" ? `1px solid ${C.border}` : "1px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              📊 By Size
            </button>
            <button
              onClick={() => setSortBy("score")}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: sortBy === "score" ? C.card : "transparent",
                color: sortBy === "score" ? C.accent : C.textDim,
                border: sortBy === "score" ? `1px solid ${C.border}` : "1px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              ⭐ By Seniority Score
            </button>
            <button
              onClick={() => setSortBy("alpha")}
              style={{
                padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: sortBy === "alpha" ? C.card : "transparent",
                color: sortBy === "alpha" ? C.accent : C.textDim,
                border: sortBy === "alpha" ? `1px solid ${C.border}` : "1px solid transparent",
                transition: "all 0.15s ease"
              }}
            >
              🔤 A-Z
            </button>
          </div>
          <div style={{ fontSize: 12, color: C.textDim }}>
            Showing <strong>{stackedData.length}</strong> companies
          </div>
        </div>

        <div style={{ display: "flex", background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, gap: 2 }}>
          <button
            onClick={() => setChartType("stacked")}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: chartType === "stacked" ? C.card : "transparent",
              color: chartType === "stacked" ? C.accent : C.textDim,
              border: chartType === "stacked" ? `1px solid ${C.border}` : "1px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            📊 Stacked Breakdown
          </button>
          <button
            onClick={() => setChartType("matrix")}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: chartType === "matrix" ? C.card : "transparent",
              color: chartType === "matrix" ? C.accent : C.textDim,
              border: chartType === "matrix" ? `1px solid ${C.border}` : "1px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            🧮 Matrix Heatmap Table
          </button>
        </div>
      </div>

      {/* Stacked Bar Chart View */}
      {chartType === "stacked" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12 }}>
            Company Seniority Stacked Distribution & Scores ({stackedData.length} Companies)
          </div>
          <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 8 }}>
            <div style={{ height: Math.max(400, stackedData.length * 28), width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                  <XAxis type="number" stroke={C.muted} fontSize={11} />
                  <YAxis type="category" dataKey="company" stroke={C.muted} fontSize={11} width={150} interval={0} />
                  <Tooltip
                    contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
                    formatter={(val, name, item) => [
                      `${val} connections`, 
                      `${name} (Company Seniority Score: ${item.payload.score})`
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  {SENIORITY.map(s => (
                    <Bar
                      key={s.label}
                      dataKey={s.label}
                      stackId="seniority"
                      fill={s.color}
                      radius={0}
                      onClick={(data) => {
                        if (data && data.company && data[s.label] > 0) {
                          setSelectedCell({ company: data.company, seniority: s.label });
                        }
                      }}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.textDim, textAlign: "center", marginTop: 12 }}>
            💡 Tip: Click any colored bar segment to inspect connections. Scores are computed from a 0-100 weighted seniority index.
          </div>
        </div>
      )}

      {/* Matrix Heatmap Table View */}
      {chartType === "matrix" && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflowX: "auto", maxHeight: 520, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, position: "sticky", top: 0, zIndex: 10 }}>
                <th style={{ padding: "12px 16px", color: C.text, fontWeight: 700, minWidth: 180 }}>Company</th>
                <th style={{ padding: "12px 12px", color: C.accent, fontWeight: 700, textAlign: "center", minWidth: 100 }}>Score</th>
                {SENIORITY.map(s => (
                  <th key={s.label} style={{ padding: "12px 10px", color: s.color, fontWeight: 700, textAlign: "center", minWidth: 90, fontSize: 11 }}>
                    {s.label}
                  </th>
                ))}
                <th style={{ padding: "12px 16px", color: C.text, fontWeight: 700, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {stackedData.map(item => (
                <tr key={item.company} style={{ borderBottom: `1px solid ${C.border}22`, transition: "background 0.1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${C.surface}88`}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: C.text }}>
                    {item.company}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "2px 8px", borderRadius: 6,
                      background: item.score >= 70 ? "rgba(16, 185, 129, 0.15)" : item.score >= 40 ? "rgba(99, 102, 241, 0.15)" : "rgba(100, 116, 139, 0.15)",
                      color: item.score >= 70 ? "#34d399" : item.score >= 40 ? "#818cf8" : C.textDim,
                      fontWeight: 700, fontSize: 11
                    }}>
                      ⭐ {item.score}
                    </span>
                  </td>
                  {SENIORITY.map(s => {
                    const count = item[s.label] || 0;
                    const maxForCol = Math.max(...stackedData.map(d => d[s.label] || 0), 1);
                    const intensity = count > 0 ? Math.max(0.15, count / maxForCol) : 0;
                    return (
                      <td key={s.label} style={{ padding: "10px 10px", textAlign: "center" }}>
                        <button
                          disabled={count === 0}
                          onClick={() => setSelectedCell({ company: item.company, seniority: s.label })}
                          style={{
                            width: "100%",
                            padding: "6px 0",
                            borderRadius: 6,
                            background: count > 0 ? `${s.color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}` : "transparent",
                            color: count > 0 ? (intensity > 0.4 ? "#fff" : s.color) : C.muted,
                            border: count > 0 ? `1px solid ${s.color}66` : "1px solid transparent",
                            fontWeight: count > 0 ? 700 : 400,
                            cursor: count > 0 ? "pointer" : "default",
                            fontFamily: "inherit",
                            fontSize: 12
                          }}
                        >
                          {count > 0 ? count : "—"}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 800, color: C.accent }}>
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drilldown Modal / Drawer */}
      {selectedCell && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16
        }}>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            width: "100%", maxWidth: 650, maxHeight: "85vh", display: "flex", flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)", overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                  {selectedCell.company} &bull; <span style={{ color: C.accent }}>{selectedCell.seniority}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                  {drilldownRecords.length} connection{drilldownRecords.length === 1 ? "" : "s"} found at this seniority level
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                style={{ background: "transparent", border: "none", color: C.textDim, fontSize: 18, cursor: "pointer", padding: 4 }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content / List */}
            <div style={{ padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              {drilldownRecords.map((r, idx) => (
                <div key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.name}</div>
                    {r["Email Address"] && (
                      <a href={`mailto:${r["Email Address"]}`} style={{ fontSize: 11, color: C.accent, textDecoration: "none" }}>
                        ✉️ {r["Email Address"]}
                      </a>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.textDim }}>{r.title}</div>
                  {r["Connected On"] && (
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Connected on: {r["Connected On"]}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", background: C.surface }}>
              <button
                onClick={() => setSelectedCell(null)}
                style={{
                  padding: "6px 16px", background: C.accent, color: "#fff", border: "none",
                  borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
