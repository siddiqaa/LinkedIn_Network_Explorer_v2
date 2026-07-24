import { useState, useMemo, useEffect } from "react";
import { C, SENIORITY } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";
import { classifyTitlesBatchEmbeddings } from "../../lib/embeddingClassifier";
import { SeniorityChart } from "./SeniorityChart";

export function EmbeddingSenioritySection({ data, mlResults, onResultsGenerated }) {
  const [embeddingResults, setEmbeddingResults] = useState(null);

  const effectiveResults = embeddingResults || mlResults;

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [error, setError] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [tableFilter, setTableFilter] = useState("");
  const [sampledConns, setSampledConns] = useState([]);

  const uniqueTitles = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(r => (r["Position_raw"] || r["Position"] || "").trim()))).filter(Boolean);
  }, [data]);

  const runClassifier = async () => {
    if (!data || data.length === 0) return;
    setLoading(true);
    setError(null);

    const validConns = data.filter(r => (r["First Name"] || r["Last Name"] || r["Position"] || r["Position_raw"]).trim());
    setSampledConns(validConns);

    const allTitlesToClassify = Array.from(new Set(validConns.map(r => (r["Position_raw"] || r["Position"] || "").trim()))).filter(Boolean);

    try {
      setProgressMsg(`Loading all-MiniLM-L6-v2 vector model & extracting embeddings for all ${allTitlesToClassify.length} titles...`);
      setProgressPct(10);
      const results = await classifyTitlesBatchEmbeddings(allTitlesToClassify, (processed, total) => {
        const pct = Math.min(99, Math.round((processed / total) * 90) + 10);
        setProgressPct(pct);
        setProgressMsg(`Embedding similarity progress: ${processed} / ${total} unique titles (${pct}%)`);
      }, allTitlesToClassify.length, 16);

      const merged = { ...(mlResults || {}), ...(embeddingResults || {}), ...results };
      setEmbeddingResults(merged);
      if (onResultsGenerated) {
        onResultsGenerated(merged);
      }
      setLoading(false);
      setShowTable(true);
    } catch (err) {
      console.error("[Classifier UI] Execution error:", err);
      setError("Failed to run Transformers.js model: " + (err.message || String(err)));
      setLoading(false);
    }
  };

  const [threshold, setThreshold] = useState(75);
  const [lowConfFilter, setLowConfFilter] = useState("");
  const [copiedLowConfPrompt, setCopiedLowConfPrompt] = useState(false);
  const [selectedTitles, setSelectedTitles] = useState(new Set());

  const titleCounts = useMemo(() => {
    if (!data) return {};
    const map = {};
    data.forEach(r => {
      const t = (r["Position_raw"] || r["Position"] || "").trim();
      if (t) map[t] = (map[t] || 0) + 1;
    });
    return map;
  }, [data]);

  const lowConfidenceTitles = useMemo(() => {
    if (!effectiveResults) return [];
    const list = [];
    Object.keys(titleCounts).forEach(title => {
      const res = effectiveResults[title];
      if (res && res.confidence !== null && res.confidence < threshold) {
        list.push({
          title,
          count: titleCounts[title] || 1,
          seniority: res.seniority,
          closestMatch: res.rawLabel,
          confidence: res.confidence
        });
      }
    });
    // Sort starting with lowest similarity score first (confidence ascending), then count descending
    return list.sort((a, b) => a.confidence - b.confidence || b.count - a.count);
  }, [effectiveResults, titleCounts, threshold]);

  // Keep selected titles unchecked by default when low confidence list changes
  useEffect(() => {
    setSelectedTitles(new Set());
  }, [lowConfidenceTitles]);

  const filteredLowConfTitles = useMemo(() => {
    if (!lowConfFilter.trim()) return lowConfidenceTitles;
    const q = lowConfFilter.toLowerCase();
    return lowConfidenceTitles.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.seniority.toLowerCase().includes(q) ||
      item.closestMatch.toLowerCase().includes(q)
    );
  }, [lowConfidenceTitles, lowConfFilter]);

  const selectedList = useMemo(() => {
    return lowConfidenceTitles.filter(i => selectedTitles.has(i.title));
  }, [lowConfidenceTitles, selectedTitles]);

  const isAllFilteredSelected = useMemo(() => {
    if (filteredLowConfTitles.length === 0) return false;
    return filteredLowConfTitles.every(i => selectedTitles.has(i.title));
  }, [filteredLowConfTitles, selectedTitles]);

  const toggleSelectTitle = (title) => {
    setSelectedTitles(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedTitles(prev => {
        const next = new Set(prev);
        filteredLowConfTitles.forEach(item => next.delete(item.title));
        return next;
      });
    } else {
      setSelectedTitles(prev => {
        const next = new Set(prev);
        filteredLowConfTitles.forEach(item => next.add(item.title));
        return next;
      });
    }
  };

  const selectTopN = (n) => {
    const topN = lowConfidenceTitles.slice(0, n).map(i => i.title);
    setSelectedTitles(new Set(topN));
  };

  const copyLowConfPrompt = () => {
    const titlesToCopy = selectedList.map(i => i.title);
    if (titlesToCopy.length === 0) return;
    const titlesJson = JSON.stringify(titlesToCopy, null, 2);
    const prompt = `You are an expert HR Data Scientist.
I have ${titlesToCopy.length} raw job titles from my LinkedIn network that matched our vector similarity model with low confidence (< ${threshold}% similarity).
Normalize each title to a canonical title and strictly assign one of the following seniorities:
- "C-Suite / Founder"
- "VP / Director"
- "Manager / Lead"
- "Senior / Mid"
- "Junior / Associate"
- "Unknown / Other"

Return a single JSON object mapping raw titles directly to { "canonicalTitle": "...", "seniority": "..." }.

Raw Titles (${titlesToCopy.length} titles):
${titlesJson}`;

    navigator.clipboard.writeText(prompt);
    setCopiedLowConfPrompt(true);
    setTimeout(() => setCopiedLowConfPrompt(false), 2500);
  };

  const reclassifiedCount = useMemo(() => {
    if (!effectiveResults) return 0;
    let count = 0;
    uniqueTitles.forEach(t => {
      const mapSen = classifySeniority(t);
      const embSen = effectiveResults[t]?.seniority;
      if (mapSen === "Unknown / Other" && embSen && embSen !== "Unknown / Other") {
        count++;
      }
    });
    return count;
  }, [effectiveResults, uniqueTitles]);

  const displayRows = useMemo(() => {
    let pool = [];
    if (sampledConns.length > 0) {
      pool = sampledConns.map((conn, idx) => {
        const name = `${conn["First Name"] || ""} ${conn["Last Name"] || ""}`.trim() || "Unknown";
        const company = conn["Company"] || "—";
        const title = (conn["Position_raw"] || conn["Position"] || "").trim();
        const mapLabel = classifySeniority(title, effectiveResults);
        const embRes = effectiveResults ? effectiveResults[title] : null;
        return {
          id: idx + "-" + name + "-" + title,
          name,
          company,
          title,
          mapLabel,
          embSeniority: embRes?.seniority || "—",
          confidence: embRes?.confidence ?? null,
          rawLabel: embRes?.rawLabel || "—",
          linkedinUrl: conn["URL"] || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name + " " + company)}`
        };
      });
    } else if (data && data.length > 0) {
      pool = data.map((conn, idx) => {
        const name = `${conn["First Name"] || ""} ${conn["Last Name"] || ""}`.trim() || "Unknown";
        const company = conn["Company"] || "—";
        const title = (conn["Position_raw"] || conn["Position"] || "").trim();
        const mapLabel = classifySeniority(title, effectiveResults);
        const embRes = effectiveResults ? effectiveResults[title] : null;
        return {
          id: idx + "-" + name + "-" + title,
          name,
          company,
          title,
          mapLabel,
          embSeniority: embRes?.seniority || "—",
          confidence: embRes?.confidence ?? null,
          rawLabel: embRes?.rawLabel || "—",
          linkedinUrl: conn["URL"] || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name + " " + company)}`
        };
      });
    }

    if (!tableFilter.trim()) return pool;
    const q = tableFilter.toLowerCase();
    return pool.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.embSeniority.toLowerCase().includes(q)
    );
  }, [data, sampledConns, effectiveResults, tableFilter]);

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
      {/* Top Header & Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textDim, textTransform: "uppercase" }}>
              Seniority Classification Engine
            </span>
            <span style={{
              fontSize: 10, padding: "2px 8px", borderRadius: 99,
              background: `${C.accent3}22`,
              color: C.accent3,
              border: `1px solid ${C.accent3}44`,
              fontWeight: 600
            }}>
              📐 Vector Embedding Similarity (all-MiniLM-L6-v2)
            </span>
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
            Vector space cosine similarity using 384-dim dense embeddings against seniority prototypes & TITLE_MAP entries
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {!loading && (
            <button
              onClick={runClassifier}
              style={{
                padding: "7px 14px", background: C.accent3,
                border: "none", borderRadius: 8, color: "#ffffff", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)"
              }}>
              <span>⚡</span> {effectiveResults ? "Re-Run Classification" : `Run Embedding Classification (${uniqueTitles.length} Unique Titles)`}
            </button>
          )}

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            title="View explanation of Vector Embedding Similarity technique"
            style={{
              padding: "7px 12px", background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer"
            }}>
            {showExplanation ? "Hide Explanation ✖" : "How it Works 💡"}
          </button>
        </div>
      </div>

      {/* Methodology Explanation Box */}
      {showExplanation && (
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: 20, marginBottom: 20, fontSize: 12, lineHeight: 1.6, color: C.text
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent3, marginBottom: 12 }}>
            Methodology: Vector Embedding Similarity (all-MiniLM-L6-v2)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            {/* Step 1: Embedding Model */}
            <div style={{ background: C.card, padding: 14, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, color: C.accent3, marginBottom: 6 }}>1. 384-Dim Dense Embeddings</div>
              <p style={{ color: C.textDim, fontSize: 11, marginBottom: 8 }}>
                Encodes raw job title strings into dense 384-dimensional vector space using <code>all-MiniLM-L6-v2</code> directly in your browser via WebAssembly / ONNX.
              </p>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", background: C.surface, padding: 6, borderRadius: 4, color: C.textDim }}>
                Model: Xenova/all-MiniLM-L6-v2
              </div>
            </div>

            {/* Step 2: Seniority Prototypes */}
            <div style={{ background: C.card, padding: 14, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, color: C.accent3, marginBottom: 6 }}>2. Seniority Prototypes & TITLE_MAP</div>
              <p style={{ color: C.textDim, fontSize: 11, marginBottom: 8 }}>
                Generates vector prototypes for core seniority tiers alongside 435+ canonical title entries dynamically imported from <code>titleMap.js</code>.
              </p>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", background: C.surface, padding: 6, borderRadius: 4, color: C.accent3 }}>
                435+ Title Vector Prototypes
              </div>
            </div>

            {/* Step 3: Cosine Similarity */}
            <div style={{ background: C.card, padding: 14, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, color: C.accent3, marginBottom: 6 }}>3. Cosine Similarity Score</div>
              <p style={{ color: C.textDim, fontSize: 11, marginBottom: 8 }}>
                Calculates the dot product between normalized title vectors to assign the closest matching seniority category and similarity confidence percentage.
              </p>
              <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", background: C.surface, padding: 6, borderRadius: 4, color: C.accent3 }}>
                Formula: cos(θ) = A · B
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, color: C.textDim, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
            <strong>Seniority Categories:</strong> C-Suite / Founder, VP / Director, Manager / Lead, Senior / Mid, Junior / Associate, Unknown / Other.
          </div>
        </div>
      )}

      {/* Progress / Loading Bar */}
      {loading && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 8, color: C.text }}>
            <span>{progressMsg}</span>
            <span>{progressPct}%</span>
          </div>
          <div style={{ height: 8, background: C.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${progressPct}%`,
              background: C.accent3,
              transition: "width 0.2s ease"
            }} />
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
            Running client-side browser WebAssembly/ONNX inference using 384-dim dense vector embeddings.
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Seniority Bar Chart */}
      <SeniorityChart data={data} mlResults={effectiveResults} useML={true} />

      {/* ML Summary Callout */}
      {effectiveResults && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, color: C.text }}>
            <strong>Vector Embedding Insights:</strong> Evaluated batch of <strong>{sampledConns.length || data?.length || Object.keys(effectiveResults).length}</strong> connections.
            {reclassifiedCount > 0 && <> Re-classified <strong>{reclassifiedCount}</strong> obscure job titles using vector similarity.</>}
          </div>
          <button
            onClick={() => setShowTable(!showTable)}
            style={{ padding: "4px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.textDim, cursor: "pointer" }}>
            {showTable ? "Hide Predictions Table ▲" : "View Connection Predictions Table ▼"}
          </button>
        </div>
      )}

      {/* Predictions Table */}
      {showTable && effectiveResults && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
              Connection Vector Results ({displayRows.length} shown)
            </div>
            <input
              value={tableFilter}
              onChange={e => setTableFilter(e.target.value)}
              placeholder="Search connection name, title, or company..."
              style={{
                padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 6, color: C.text, fontSize: 12, outline: "none", fontFamily: "inherit",
                minWidth: 240
              }}
            />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Connection Name</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Company</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Job Title</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>TITLE_MAP Seniority</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Embedding Similarity Seniority</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Similarity Score</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16, textAlign: "center", color: C.textDim }}>
                    No connections match your filter query.
                  </td>
                </tr>
              ) : (
                displayRows.map((r) => {
                  const isDiff = r.mapLabel !== r.embSeniority && r.embSeniority !== "—";
                  const senColor = SENIORITY.find(s => s.label === r.embSeniority)?.color || C.muted;

                  return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}22`, background: isDiff ? "#f0fdf4" : "transparent" }}>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>
                        <a href={r.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          style={{ color: C.accent, textDecoration: "none" }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                        >
                          {r.name} ↗
                        </a>
                      </td>
                      <td style={{ padding: "8px 12px", color: C.textDim }}>{r.company}</td>
                      <td style={{ padding: "8px 12px", color: C.text, fontWeight: 500 }}>{r.title}</td>
                      <td style={{ padding: "8px 12px", color: C.textDim }}>{r.mapLabel}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: `${senColor}22`, color: senColor, border: `1px solid ${senColor}44`, fontWeight: 600 }}>
                          {r.embSeniority}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", color: C.textDim }}>
                        {r.confidence !== null ? (
                          <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{r.confidence}%</span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Low-Confidence Titles Table (Threshold Filterable) */}
      <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                🔍 Low-Confidence Titles (&lt; {threshold}% Match)
              </span>
              <span style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 99,
                background: lowConfidenceTitles.length > 0 ? "#fef3c7" : "#ecfdf5",
                color: lowConfidenceTitles.length > 0 ? "#92400e" : "#065f46",
                border: `1px solid ${lowConfidenceTitles.length > 0 ? "#fcd34d" : "#a7f3d0"}`,
                fontWeight: 700
              }}>
                {lowConfidenceTitles.length} Unique Titles Found
              </span>
            </div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
              Job titles from your connections where vector similarity score is below the selected threshold.
            </div>
          </div>

          {/* Controls: Threshold Selector & Selection Copy Prompt */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.textDim }}>
              <span>Threshold:</span>
              <select
                value={threshold}
                onChange={e => setThreshold(Number(e.target.value))}
                style={{
                  padding: "6px 10px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.text, fontSize: 12, fontWeight: 600, outline: "none",
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <option value={50}>&lt; 50% Match</option>
                <option value={60}>&lt; 60% Match</option>
                <option value={70}>&lt; 70% Match</option>
                <option value={75}>&lt; 75% Match (Default)</option>
                <option value={80}>&lt; 80% Match</option>
                <option value={85}>&lt; 85% Match</option>
                <option value={90}>&lt; 90% Match</option>
                <option value={95}>&lt; 95% Match</option>
                <option value={100}>&lt; 100% Match (All)</option>
              </select>
            </div>

            {effectiveResults && lowConfidenceTitles.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    onClick={() => selectTopN(25)}
                    title="Select the 25 titles with the lowest similarity scores"
                    style={{
                      padding: "4px 8px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.textDim, fontSize: 11, cursor: "pointer", fontFamily: "inherit"
                    }}>
                    Top 25
                  </button>
                  <button
                    onClick={() => selectTopN(50)}
                    title="Select the 50 titles with the lowest similarity scores"
                    style={{
                      padding: "4px 8px", background: C.surface, border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.textDim, fontSize: 11, cursor: "pointer", fontFamily: "inherit"
                    }}>
                    Top 50
                  </button>
                </div>

                <button
                  onClick={copyLowConfPrompt}
                  disabled={selectedList.length === 0}
                  style={{
                    padding: "6px 14px",
                    background: selectedList.length === 0 ? C.border : copiedLowConfPrompt ? "#10b981" : C.accent,
                    border: "none", borderRadius: 6, color: "#ffffff", fontSize: 12, fontWeight: 600,
                    cursor: selectedList.length === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.12)", opacity: selectedList.length === 0 ? 0.6 : 1
                  }}
                >
                  <span>{copiedLowConfPrompt ? "✓" : "📋"}</span>
                  {copiedLowConfPrompt
                    ? "Copied Prompt!"
                    : selectedList.length === 0
                      ? "Select Titles to Copy Prompt"
                      : `Copy Prompt for ${selectedList.length} Selected Title${selectedList.length === 1 ? "" : "s"}`}
                </button>
              </div>
            )}
          </div>
        </div>

        {!effectiveResults ? (
          <div style={{ padding: 28, textAlign: "center", background: C.surface, borderRadius: 10, border: `1px dashed ${C.border}`, color: C.textDim, fontSize: 13 }}>
            {loading ? (
              <div>
                <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>⏳ Calculating Cosine Embedding Similarity...</div>
                <div>{progressMsg} ({progressPct}%)</div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, color: C.text, marginBottom: 6 }}>
                  ⚡ Vector similarity classification is ready for {uniqueTitles.length} unique titles
                </div>
                <div style={{ fontSize: 12, color: C.textDim, marginBottom: 14 }}>
                  Click below to manually trigger client-side vector embedding similarity classification.
                </div>
                <button
                  onClick={runClassifier}
                  style={{
                    padding: "8px 20px", background: C.accent3, border: "none", borderRadius: 8,
                    color: "#ffffff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.18)"
                  }}
                >
                  <span>⚡</span> Run Embedding Classification ({uniqueTitles.length} Titles)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: C.textDim, fontWeight: 500 }}>
                  Showing {filteredLowConfTitles.length} of {lowConfidenceTitles.length} low-confidence titles
                </span>
                <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>
                  ({selectedList.length} selected for prompt)
                </span>
              </div>
              <input
                value={lowConfFilter}
                onChange={e => setLowConfFilter(e.target.value)}
                placeholder="Filter low-confidence titles..."
                style={{
                  padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.text, fontSize: 12, outline: "none", fontFamily: "inherit",
                  minWidth: 220
                }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left", background: C.surface }}>
                    <th style={{ padding: "10px 8px", width: 40, textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={isAllFilteredSelected}
                        onChange={toggleSelectAll}
                        title="Select/Deselect All Visible Titles"
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    <th style={{ padding: "10px 12px", color: C.textDim, fontWeight: 600 }}>Raw Job Title</th>
                    <th style={{ padding: "10px 12px", color: C.textDim, fontWeight: 600 }}>Connections</th>
                    <th style={{ padding: "10px 12px", color: C.textDim, fontWeight: 600 }}>Assigned Seniority</th>
                    <th style={{ padding: "10px 12px", color: C.textDim, fontWeight: 600 }}>Closest Prototype Match</th>
                    <th style={{ padding: "10px 12px", color: C.textDim, fontWeight: 600 }}>Similarity Score</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLowConfTitles.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 20, textAlign: "center", color: C.textDim }}>
                        {lowConfidenceTitles.length === 0
                          ? `🎉 Great news! All vector similarity scores are higher than ${threshold}%.`
                          : "No low-confidence titles match your search filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredLowConfTitles.map((item, idx) => {
                      const isSelected = selectedTitles.has(item.title);
                      const senColor = SENIORITY.find(s => s.label === item.seniority)?.color || C.muted;
                      const scoreColor = item.confidence < 50 ? "#ef4444" : item.confidence < 70 ? "#f97316" : "#eab308";

                      return (
                        <tr
                          key={idx + "-" + item.title}
                          style={{
                            borderBottom: `1px solid ${C.border}22`,
                            background: isSelected ? `${C.accent}08` : "transparent"
                          }}
                        >
                          <td style={{ padding: "10px 8px", textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectTitle(item.title)}
                              style={{ cursor: "pointer" }}
                            />
                          </td>
                          <td style={{ padding: "10px 12px", color: C.text, fontWeight: 600 }}>
                            {item.title}
                          </td>
                          <td style={{ padding: "10px 12px", color: C.textDim, fontWeight: 600 }}>
                            {item.count} {item.count === 1 ? "conn" : "conns"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: `${senColor}22`, color: senColor, border: `1px solid ${senColor}44`, fontWeight: 600 }}>
                              {item.seniority}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", color: C.textDim, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                            {item.closestMatch}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 6,
                              background: `${scoreColor}15`, color: scoreColor,
                              border: `1px solid ${scoreColor}40`, fontWeight: 700,
                              fontFamily: "'DM Mono', monospace"
                            }}>
                              {item.confidence}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

