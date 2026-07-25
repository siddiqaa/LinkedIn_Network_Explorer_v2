import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { C } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";
import { classifyDepartment } from "../../utils/departmentClassifier";
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

export const SCORE_METRICS = {
  seniority: {
    key: "seniorityScore",
    label: "Seniority Score",
    icon: "⭐",
    description: "Evaluates executive & leadership level authority across company connections",
    tiers: [
      { min: 70, label: "70+ (Executive/VP Heavy)", color: "#34d399" },
      { min: 50, label: "50–69 (Director/Lead)", color: "#a855f7" },
      { min: 35, label: "35–49 (Manager/Senior)", color: "#38bdf8" },
      { min: 20, label: "20–34 (Mid/IC Focused)", color: "#818cf8" },
      { min: 0,  label: "<20 (Junior/Entry Focus)", color: "#64748b" },
    ]
  },
  diversity: {
    key: "diversityScore",
    label: "Department Diversity",
    icon: "🧩",
    description: "Measures functional spread across Engineering, Sales, Product, Marketing, HR, etc.",
    tiers: [
      { min: 75, label: "75+ (High Diversity Ecosystem)", color: "#10b981" },
      { min: 50, label: "50–74 (Multi-Team Coverage)", color: "#06b6d4" },
      { min: 25, label: "25–49 (Low Diversity)", color: "#f59e0b" },
      { min: 0,  label: "<25 (Single Domain Focus)", color: "#ef4444" },
    ]
  },
  combined: {
    key: "combinedScore",
    label: "Combined Score",
    icon: "🚀",
    description: "Blends Leadership Authority (50%) + Functional Breadth (50%)",
    tiers: [
      { min: 70, label: "70+ (Strategic Enterprise Hub)", color: "#ec4899" },
      { min: 50, label: "50–69 (Key Operational Partner)", color: "#8b5cf6" },
      { min: 35, label: "35–49 (Balanced Footprint)", color: "#3b82f6" },
      { min: 0,  label: "<35 (Niche Presence)", color: "#64748b" },
    ]
  }
};

export const getMetricColor = (score, metricKey = "seniority") => {
  const metric = SCORE_METRICS[metricKey] || SCORE_METRICS.seniority;
  for (const tier of metric.tiers) {
    if (score >= tier.min) return tier.color;
  }
  return "#64748b";
};

export function calculateCompanyScores(records, mlResults) {
  if (!records || records.length === 0) {
    return { seniorityScore: 0, diversityScore: 0, combinedScore: 0, deptCounts: {}, deptsCount: 0 };
  }

  const N = records.length;
  let totalSeniorityWeight = 0;
  const deptCounts = {};

  records.forEach(r => {
    const title = (r["Position_raw"] || r["Position"] || "").trim();
    let seniority = "Unknown / Other";
    if (mlResults && mlResults[title] && mlResults[title].override !== false) {
      seniority = mlResults[title].seniority;
    } else {
      seniority = classifySeniority(title);
    }
    const w = SENIORITY_WEIGHTS[seniority] !== undefined ? SENIORITY_WEIGHTS[seniority] : 0;
    totalSeniorityWeight += w;

    const dept = classifyDepartment(title, mlResults);
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const seniorityScore = Math.round((totalSeniorityWeight / N) * 10) / 10;

  // Normalized Shannon Entropy for Department Diversity (0 to 100)
  const uniqueDepts = Object.keys(deptCounts);
  const k = uniqueDepts.length;
  let diversityScore = 0;

  if (N > 1 && k > 1) {
    let entropy = 0;
    Object.values(deptCounts).forEach(count => {
      const p = count / N;
      if (p > 0) {
        entropy -= p * Math.log(p);
      }
    });
    const maxEntropy = Math.log(Math.min(N, 12));
    if (maxEntropy > 0) {
      diversityScore = Math.min(100, Math.round((entropy / maxEntropy) * 1000) / 10);
    }
  }

  const combinedScore = Math.round((0.5 * seniorityScore + 0.5 * diversityScore) * 10) / 10;

  return {
    seniorityScore,
    diversityScore,
    combinedScore,
    deptCounts,
    deptsCount: k
  };
}

export function TopCompanies({ data, mlResults }) {
  const [viewMode, setViewMode] = useState("treemap"); // "treemap" | "bar" | "matrix"
  const [activeMetric, setActiveMetric] = useState("seniority"); // "seniority" | "diversity" | "combined"
  const [sortBy, setSortBy] = useState("size"); // "size" | "alpha" | "score"
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null); // Spotlight Modal
  const [showMetricsModal, setShowMetricsModal] = useState(false); // Formulas Modal

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
        const scores = calculateCompanyScores(records, mlResults);
        const activeScore = scores[SCORE_METRICS[activeMetric].key] || 0;
        return {
          name,
          count: records.length,
          ...scores,
          activeScore
        };
      });

    if (sortBy === "alpha") {
      return parsed.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "score") {
      return parsed.sort((a, b) => b.activeScore - a.activeScore);
    } else {
      return parsed.sort((a, b) => b.count - a.count);
    }
  }, [data, mlResults, sortBy, activeMetric]);

  const maxCount = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map(i => i.count));
  }, [chartData]);

  const totalCount = useMemo(() => chartData.reduce((acc, curr) => acc + curr.count, 0), [chartData]);

  // Selected company deep dive metrics
  const selectedCompanyDetails = useMemo(() => {
    if (!selectedCompany) return null;
    const recs = data.filter(r => (r["Company"] || "").trim() === selectedCompany).map(r => {
      const title = (r["Position_raw"] || r["Position"] || "").trim();
      let seniority = "Unknown / Other";
      if (mlResults && mlResults[title] && mlResults[title].override !== false) {
        seniority = mlResults[title].seniority;
      } else {
        seniority = classifySeniority(title);
      }
      const department = classifyDepartment(title, mlResults);
      const firstName = (r["First Name"] || "").trim();
      const lastName = (r["Last Name"] || "").trim();
      const weight = SENIORITY_WEIGHTS[seniority] !== undefined ? SENIORITY_WEIGHTS[seniority] : 0;
      return {
        ...r,
        name: `${firstName} ${lastName}`.trim() || "Unknown Connection",
        title: title || "Unspecified Role",
        seniority,
        department,
        weight
      };
    }).sort((a, b) => b.weight - a.weight);

    const rawRecords = data.filter(r => (r["Company"] || "").trim() === selectedCompany);
    const scores = calculateCompanyScores(rawRecords, mlResults);

    return {
      name: selectedCompany,
      records: recs,
      ...scores
    };
  }, [data, mlResults, selectedCompany]);

  const activeMetricMeta = SCORE_METRICS[activeMetric];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top Controls Toolbar: Score Switcher + Sort + View Selector */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, background: C.card, border: `1px solid ${C.border}`, padding: 16, borderRadius: 12 }}>
        
        {/* Row 1: Score Metric Selector */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>🎯 Active Score Metric:</span>
            <div style={{ display: "flex", background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, gap: 3 }}>
              {Object.entries(SCORE_METRICS).map(([key, meta]) => {
                const isActive = activeMetric === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveMetric(key)}
                    title={meta.description}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: isActive ? C.accent : "transparent",
                      color: isActive ? "#ffffff" : C.textDim,
                      border: "none",
                      boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.2)" : "none",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}>
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: 11, color: C.textDim }}>
            Showing <strong>{chartData.length}</strong> companies (≥2 connections) across <strong>{totalCount}</strong> profiles
          </div>
        </div>

        {/* Metric Description Bar + Formula Info Button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, background: C.surface, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.textDim, flex: 1, minWidth: 200 }}>
            💡 <strong style={{ color: C.text }}>{activeMetricMeta.label}:</strong> {activeMetricMeta.description}
          </div>
          <button
            onClick={() => setShowMetricsModal(true)}
            title="View mathematical formulas, weights, and scoring methodology"
            style={{
              padding: "5px 12px",
              background: C.card,
              border: `1px solid ${C.accent}`,
              borderRadius: 6,
              color: C.accent,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              flexShrink: 0
            }}>
            <span>ℹ️</span> Score Formulas & Methodology
          </button>
        </div>

        {/* Row 2: Sort Controls + View Mode Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
          {/* Sorting */}
          {viewMode !== "matrix" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.textDim }}>Sort By:</span>
              <div style={{ display: "flex", background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, gap: 2 }}>
                <button
                  onClick={() => setSortBy("size")}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    background: sortBy === "size" ? C.card : "transparent",
                    color: sortBy === "size" ? C.accent : C.textDim,
                    border: sortBy === "size" ? `1px solid ${C.border}` : "1px solid transparent",
                  }}>
                  📊 Connection Count
                </button>
                <button
                  onClick={() => setSortBy("score")}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    background: sortBy === "score" ? C.card : "transparent",
                    color: sortBy === "score" ? C.accent : C.textDim,
                    border: sortBy === "score" ? `1px solid ${C.border}` : "1px solid transparent",
                  }}>
                  🏆 {activeMetricMeta.label}
                </button>
                <button
                  onClick={() => setSortBy("alpha")}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    background: sortBy === "alpha" ? C.card : "transparent",
                    color: sortBy === "alpha" ? C.accent : C.textDim,
                    border: sortBy === "alpha" ? `1px solid ${C.border}` : "1px solid transparent",
                  }}>
                  🔤 Company Name A-Z
                </button>
              </div>
            </div>
          )}

          {/* View Mode */}
          <div style={{ display: "flex", background: C.surface, padding: 3, borderRadius: 8, border: `1px solid ${C.border}`, gap: 2 }}>
            <button
              onClick={() => setViewMode("treemap")}
              style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: viewMode === "treemap" ? C.card : "transparent",
                color: viewMode === "treemap" ? C.accent : C.textDim,
                border: viewMode === "treemap" ? `1px solid ${C.border}` : "1px solid transparent",
                boxShadow: viewMode === "treemap" ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              }}>
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
              }}>
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
              }}>
              🧮 Company Seniority Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Tier Legend */}
      {viewMode !== "matrix" && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 11, color: C.textDim, background: C.surface, padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: C.text }}>{activeMetricMeta.icon} {activeMetricMeta.label} Tiers:</span>
          {activeMetricMeta.tiers.map((t, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Treemap View */}
      {viewMode === "treemap" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))",
          gap: 10,
          maxHeight: 520,
          overflowY: "auto",
          padding: 4
        }}>
          {chartData.map((item) => {
            const percentage = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : 0;
            const color = getMetricColor(item.activeScore, activeMetric);
            const isHovered = hoveredCompany === item.name;
            const weightRatio = item.count / maxCount;
            const minHeight = Math.max(95, Math.floor(weightRatio * 140));

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
                title={`Click for ${item.name} Spotlight & Metrics Breakdown`}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: color }} />
                
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3, wordBreak: "break-word" }}>
                    {item.name}
                  </div>

                  {/* Active Metric Highlight Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, background: `${color}33`, color: color, padding: "2px 7px", borderRadius: 4, fontWeight: 700, border: `1px solid ${color}55` }}>
                      {activeMetricMeta.icon} {item.activeScore} {activeMetricMeta.label}
                    </span>
                  </div>

                  {/* Secondary Score Pills */}
                  <div style={{ display: "flex", gap: 6, marginTop: 6, fontSize: 9, color: C.textDim, flexWrap: "wrap" }}>
                    <span title="Seniority Score">⭐ {item.seniorityScore}</span>
                    <span>•</span>
                    <span title="Department Diversity">🧩 {item.diversityScore}</span>
                    <span>•</span>
                    <span title="Functional Departments">🏢 {item.deptsCount} Depts</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 10, borderTop: `1px solid ${C.border}44`, paddingTop: 6 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: color }}>
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
      )}

      {/* Bar Chart View */}
      {viewMode === "bar" && (
        <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 8 }}>
          <ResponsiveContainer width="100%" height={Math.max(380, chartData.length * 30)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 48, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={170}
                tick={{ fill: C.textDim, fontSize: 11, fontFamily: "inherit" }}
                axisLine={false} tickLine={false} interval={0}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
                formatter={(v, name, item) => [
                  `${v} Connections | ⭐ Seniority: ${item.payload.seniorityScore} | 🧩 Dept Diversity: ${item.payload.diversityScore} | 🚀 Combined: ${item.payload.combinedScore}`, 
                  item.payload.name
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {chartData.map((item, idx) => (
                  <Cell key={idx} fill={getMetricColor(item.activeScore, activeMetric)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Company Seniority Matrix View */}
      {viewMode === "matrix" && (
        <CompanySeniorityMatrix data={data} mlResults={mlResults} />
      )}

      {/* Company Spotlight Modal with 3 Scores Deep-Dive */}
      {selectedCompanyDetails && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            width: "100%", maxWidth: 720, maxHeight: "88vh", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
                  🏢 {selectedCompanyDetails.name}
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  Company Connections & Multi-Metric Analytics ({selectedCompanyDetails.records.length} connections)
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{
                  background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8,
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.text, cursor: "pointer", fontSize: 16, fontWeight: 700
                }}>
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
              
              {/* 3 Score Cards Overview */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 14px", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>⭐ Seniority Score</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: getMetricColor(selectedCompanyDetails.seniorityScore, "seniority"), marginTop: 2 }}>
                    {selectedCompanyDetails.seniorityScore} <span style={{ fontSize: 11, fontWeight: 400, color: C.textDim }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Leadership weight</div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 14px", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>🧩 Dept Diversity</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: getMetricColor(selectedCompanyDetails.diversityScore, "diversity"), marginTop: 2 }}>
                    {selectedCompanyDetails.diversityScore} <span style={{ fontSize: 11, fontWeight: 400, color: C.textDim }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>
                    {selectedCompanyDetails.deptsCount} functional department{selectedCompanyDetails.deptsCount === 1 ? "" : "s"}
                  </div>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 14px", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>🚀 Combined Score</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: getMetricColor(selectedCompanyDetails.combinedScore, "combined"), marginTop: 2 }}>
                    {selectedCompanyDetails.combinedScore} <span style={{ fontSize: 11, fontWeight: 400, color: C.textDim }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Seniority + Diversity</div>
                </div>
              </div>

              {/* Department Distribution Pills */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Functional Department Breakdown:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(selectedCompanyDetails.deptCounts).map(([dept, count]) => (
                    <span key={dept} style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 6,
                      background: C.card, border: `1px solid ${C.border}`, color: C.text,
                      display: "inline-flex", alignItems: "center", gap: 6
                    }}>
                      <strong style={{ color: C.accent }}>{count}</strong> {dept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connection Records List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
                  Connection Roster ({selectedCompanyDetails.records.length}):
                </div>
                {selectedCompanyDetails.records.map((r, i) => {
                  const profileUrl = r["URL"] || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(r.name + " " + selectedCompanyDetails.name)}`;
                  return (
                    <div key={i} style={{
                      background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: C.accent, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <span>{r.name}</span>
                            <span style={{ fontSize: 10 }}>↗</span>
                          </a>
                        </div>
                        <div style={{ fontSize: 11, color: C.textDim }}>
                          {r.title}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 6,
                          background: C.card, color: C.text, border: `1px solid ${C.border}`
                        }}>
                          {r.department}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                          background: `${C.accent}22`, color: C.accent, border: `1px solid ${C.accent}44`
                        }}>
                          {r.seniority}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", background: C.surface }}>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{
                  padding: "8px 18px", background: C.accent, color: "#fff", border: "none",
                  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                }}>
                Close Deep-Dive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3 Metrics Formulas & Methodology Explanation Panel/Modal */}
      {showMetricsModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20
        }}>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            width: "100%", maxWidth: 780, maxHeight: "90vh", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)", overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>📐</span> Company Network Scoring Methodology & Formulas
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                  Mathematical models evaluating organizational seniority, functional team diversity, and combined strategic weight.
                </div>
              </div>
              <button
                onClick={() => setShowMetricsModal(false)}
                style={{
                  background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8,
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.text, cursor: "pointer", fontSize: 16, fontWeight: 700
                }}>
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 20, flex: 1, color: C.text, fontSize: 13, lineHeight: 1.6 }}>

              {/* Metric 1 */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: C.accent, marginBottom: 8 }}>
                  <span>⭐ 1) Seniority Score (0 – 100)</span>
                </div>
                <p style={{ color: C.textDim, fontSize: 12, marginBottom: 12 }}>
                  Evaluates the executive and decision-making authority density of your connections within a given company.
                </p>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.accent, marginBottom: 12 }}>
                  Score = ( Σ Weight(Position) ) / Total Connections at Company
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>Position Weights:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 6, fontSize: 11, color: C.textDim, marginBottom: 12 }}>
                  <div style={{ background: C.card, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>👑 C-Suite / Founder: <strong>100 pts</strong></div>
                  <div style={{ background: C.card, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>⚡ VP / Director: <strong>80 pts</strong></div>
                  <div style={{ background: C.card, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>🛡️ Manager / Lead: <strong>60 pts</strong></div>
                  <div style={{ background: C.card, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>💼 Senior / Mid IC: <strong>40 pts</strong></div>
                  <div style={{ background: C.card, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>🌱 Junior / Associate: <strong>20 pts</strong></div>
                  <div style={{ background: C.card, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}` }}>🏖️ Retired / Other: <strong>0–10 pts</strong></div>
                </div>
              </div>

              {/* Metric 2 */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#10b981", marginBottom: 8 }}>
                  <span>🧩 2) Department Diversity Score (0 – 100)</span>
                </div>
                <p style={{ color: C.textDim, fontSize: 12, marginBottom: 12 }}>
                  Measures how broadly distributed your network is across different functional departments (Engineering, Sales, Product, Marketing, Finance, HR, Operations, Legal, etc.). Uses <strong>Normalized Shannon Entropy</strong> to reward multi-functional coverage over single-team concentration.
                </p>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#10b981", marginBottom: 12 }}>
                  Score = [ -Σ (p_i * ln(p_i)) / ln( min(N, 12) ) ] * 100
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>
                    where p_i = (count of connections in department i) / N
                  </div>
                </div>

                <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>
                  • <strong>100 Score:</strong> Equal distribution across multiple departments (e.g., 2 Engineering, 2 Sales, 2 Product, 2 Marketing).<br />
                  • <strong>0 Score:</strong> All contacts belong to a single department (e.g. 100% Engineering).
                </div>
              </div>

              {/* Metric 3 */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700, color: "#ec4899", marginBottom: 8 }}>
                  <span>🚀 3) Combined Score (0 – 100)</span>
                </div>
                <p style={{ color: C.textDim, fontSize: 12, marginBottom: 12 }}>
                  Blends leadership authority with functional breadth into a unified strategic metric.
                </p>

                <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#ec4899", marginBottom: 12 }}>
                  Combined Score = (0.5 * Seniority Score) + (0.5 * Department Diversity Score)
                </div>

                <p style={{ color: C.textDim, fontSize: 12 }}>
                  Highlights <strong>Strategic Enterprise Anchors</strong> — companies where you maintain both senior executive access and broad cross-functional operational touchpoints.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", background: C.surface }}>
              <button
                onClick={() => setShowMetricsModal(false)}
                style={{
                  padding: "8px 20px", background: C.accent, color: "#fff", border: "none",
                  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                }}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
