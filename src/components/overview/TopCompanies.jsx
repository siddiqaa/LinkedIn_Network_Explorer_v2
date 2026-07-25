import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { C } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";
import { CompanySeniorityMatrix } from "./CompanySeniorityMatrix";

const SENIORITY_WEIGHTS = {
  "C-Suite / Founder": 100,
  "VP / Director": 80,
  "Manager / Lead": 60,
  "Senior / Mid": 40,
  "Junior / Associate": 20,
  "Retired": 10,
  "Unknown / Other": 0
};

const getScoreColor = (score) => {
  if (score >= 70) return "#34d399"; // Emerald
  if (score >= 50) return "#a855f7"; // Purple
  if (score >= 35) return "#38bdf8"; // Sky Blue
  if (score >= 20) return "#818cf8"; // Indigo
  return "#64748b"; // Slate
};

export function TopCompanies({ data, mlResults }) {
  const [viewMode, setViewMode] = useState("treemap"); // "treemap" | "bar" | "matrix"
  const [sortBy, setSortBy] = useState("size"); // "size" | "alpha" | "score"
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null); // For treemap click spotlight modal

  const chartData = useMemo(() => {
    const companyMap = {};
    data.forEach(r => {
      const c = (r["Company"] || "").trim();
      if (!c) return;
      if (!companyMap[c]) companyMap[c] = [];
      companyMap[c].push(r);
    });

    const parsed = Object.entries(companyMap)
      .filter(([name, records]) => records.length >= 2)
      .map(([name, records]) => {
        let totalScore = 0;
        records.forEach(r => {
          const title = (r["Position_raw"] || r["Position"] || "").trim();
          let seniority = "Unknown / Other";
          if (mlResults && mlResults[title] && mlResults[title].override !== false) {
            seniority = mlResults[title].seniority;
          } else {
            seniority = classifySeniority(title);
          }
          const w = SENIORITY_WEIGHTS[seniority] !== undefined ? SENIORITY_WEIGHTS[seniority] : 0;
          totalScore += w;
        });
        const score = records.length > 0 ? Math.round((totalScore / records.length) * 10) / 10 : 0;
        return { name, count: records.length, score };
      });

    if (sortBy === "alpha") {
      return parsed.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "score") {
      return parsed.sort((a, b) => b.score - a.score);
    } else {
      return parsed.sort((a, b) => b.count - a.count);
    }
  }, [data, mlResults, sortBy]);

  const maxCount = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map(i => i.count));
  }, [chartData]);

  const totalCount = useMemo(() => chartData.reduce((acc, curr) => acc + curr.count, 0), [chartData]);

  // Compute records for selected company spotlight modal
  const selectedCompanyRecords = useMemo(() => {
    if (!selectedCompany) return [];
    const recs = data.filter(r => (r["Company"] || "").trim() === selectedCompany).map(r => {
      const title = (r["Position_raw"] || r["Position"] || "").trim();
      let seniority = "Unknown / Other";
      if (mlResults && mlResults[title] && mlResults[title].override !== false) {
        seniority = mlResults[title].seniority;
      } else {
        seniority = classifySeniority(title);
      }
      const firstName = (r["First Name"] || "").trim();
      const lastName = (r["Last Name"] || "").trim();
      const weight = SENIORITY_WEIGHTS[seniority] !== undefined ? SENIORITY_WEIGHTS[seniority] : 0;
      return {
        ...r,
        name: `${firstName} ${lastName}`.trim() || "Unknown Connection",
        title: title || "Unspecified Role",
        seniority,
        weight
      };
    });
    return recs.sort((a, b) => b.weight - a.weight);
  }, [data, mlResults, selectedCompany]);

  const colors = [C.accent, C.accent2, C.accent3, "#38bdf8", "#818cf8", "#f43f5e", "#fbbf24", "#34d399", "#a78bfa", "#f472b6"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Mode Selector & Sort Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: C.textDim }}>
            Showing <strong>{chartData.length}</strong> companies (≥2 connections) across <strong>{totalCount}</strong> profiles
          </div>
          {viewMode !== "matrix" && (
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
          )}
        </div>

        <div style={{ display: "flex", background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, gap: 2 }}>
          <button
            onClick={() => setViewMode("treemap")}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: viewMode === "treemap" ? C.card : "transparent",
              color: viewMode === "treemap" ? C.accent : C.textDim,
              border: viewMode === "treemap" ? `1px solid ${C.border}` : "1px solid transparent",
              boxShadow: viewMode === "treemap" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            🗺️ Treemap
          </button>
          <button
            onClick={() => setViewMode("bar")}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: viewMode === "bar" ? C.card : "transparent",
              color: viewMode === "bar" ? C.accent : C.textDim,
              border: viewMode === "bar" ? `1px solid ${C.border}` : "1px solid transparent",
              boxShadow: viewMode === "bar" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            📊 Bar Chart
          </button>
          <button
            onClick={() => setViewMode("matrix")}
            style={{
              padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: viewMode === "matrix" ? C.card : "transparent",
              color: viewMode === "matrix" ? C.accent : C.textDim,
              border: viewMode === "matrix" ? `1px solid ${C.border}` : "1px solid transparent",
              boxShadow: viewMode === "matrix" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              transition: "all 0.15s ease"
            }}
          >
            🧮 Company Seniority Matrix
          </button>
        </div>
      </div>

      {/* Treemap View */}
      {viewMode === "treemap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Legend Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: C.textDim, background: C.surface, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600, color: C.text }}>Seniority Score Tiers:</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#34d399" }} />
              <span>70+ (Executive/VP)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#a855f7" }} />
              <span>50–69 (Director/Lead)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#38bdf8" }} />
              <span>35–49 (Manager/Senior)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#818cf8" }} />
              <span>20–34 (Mid/IC)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#64748b" }} />
              <span>&lt;20 (Junior/Other)</span>
            </div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 10,
            maxHeight: 480,
            overflowY: "auto",
            padding: 4
          }}>
          {chartData.map((item) => {
            const percentage = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0;
            const color = getScoreColor(item.score);
            const isHovered = hoveredCompany === item.name;
            const weightRatio = item.count / maxCount;
            const minHeight = Math.max(85, Math.floor(weightRatio * 130));

            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredCompany(item.name)}
                onMouseLeave={() => setHoveredCompany(null)}
                onClick={() => setSelectedCompany(item.name)}
                style={{
                  background: `linear-gradient(135deg, ${color}22 0%, ${C.card} 100%)`,
                  border: `1px solid ${isHovered ? color : `${color}55`}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: minHeight,
                  cursor: "pointer",
                  transform: isHovered ? "translateY(-2px)" : "none",
                  boxShadow: isHovered ? `0 8px 20px ${color}33` : "0 2px 5px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden"
                }}
                title="Click for Company Spotlight & Connection Deep-Dive"
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3, wordBreak: "break-word" }}>
                    {item.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 10, background: `${color}33`, color: color, padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                      ⭐ {item.score} Score
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: color }}>
                    {item.count} <span style={{ fontSize: 10, fontWeight: 500, color: C.textDim }}>conn.</span>
                  </span>
                  <span style={{ fontSize: 10, color: C.textDim, fontWeight: 600 }}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Company Spotlight Modal */}
      {selectedCompany && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            width: "100%", maxWidth: 680, maxHeight: "85vh", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden", animation: "fadeIn 0.2s ease-out"
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "between", background: C.surface }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>🏢 {selectedCompany}</div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  Company Connection Spotlight ({selectedCompanyRecords.length} connections)
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{
                  background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8,
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.text, cursor: "pointer", fontSize: 16, fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* Content List */}
            <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 2 }}>
                Sorted by Seniority (Highest first) · Click name to open profile ↗
              </div>
              {selectedCompanyRecords.map((r, i) => {
                const profileUrl = r["URL"] || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(r.name + " " + selectedCompany)}`;
                return (
                  <div key={i} style={{
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    transition: "border-color 0.15s ease"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                        >
                          <span>{r.name}</span>
                          <span style={{ fontSize: 11 }}>↗</span>
                        </a>
                        {r.Email && (
                          <span style={{ fontSize: 10, fontWeight: 400, color: C.textDim }}>({r.Email})</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: C.textDim, wordBreak: "break-word" }}>
                        {r.title}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: r.seniority.includes("C-Suite") ? "rgba(244, 63, 94, 0.15)" : r.seniority.includes("VP") ? "rgba(168, 85, 247, 0.15)" : "rgba(56, 189, 248, 0.15)",
                        color: r.seniority.includes("C-Suite") ? "#f43f5e" : r.seniority.includes("VP") ? "#c084fc" : "#38bdf8"
                      }}>
                        {r.seniority}
                      </span>
                      {r["Connected On"] && (
                        <span style={{ fontSize: 10, color: C.muted }}>Connected: {r["Connected On"]}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface }}>
              <div style={{ fontSize: 11, color: C.textDim }}>
                💡 Tip: Filter or export these connections from the Connections table anytime.
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{
                  padding: "8px 16px", background: C.accent, color: "#fff", border: "none",
                  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Close Spotlight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bar Chart View */}
      {viewMode === "bar" && (
        <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 8 }}>
          <ResponsiveContainer width="100%" height={Math.max(350, chartData.length * 30)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 48, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={160}
                tick={{ fill: C.textDim, fontSize: 11, fontFamily: "inherit" }}
                axisLine={false} tickLine={false} interval={0}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
                formatter={(v, name, item) => [
                  `${v} connections (Seniority Score: ${item.payload.score})`, 
                  item.payload.name
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20} fill={C.accent2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Company Seniority Matrix View */}
      {viewMode === "matrix" && (
        <CompanySeniorityMatrix data={data} mlResults={mlResults} />
      )}
    </div>
  );
}
