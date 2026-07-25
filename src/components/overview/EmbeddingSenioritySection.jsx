import { useState, useMemo, useEffect } from "react";
import { C, SENIORITY } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";
import { classifyDepartment } from "../../utils/departmentClassifier";
import { classifyTitlesBatchEmbeddings } from "../../lib/embeddingClassifier";
import { SeniorityChart } from "./SeniorityChart";

export function EmbeddingSenioritySection({ data, mlResults, onResultsGenerated }) {
  const [embeddingResults, setEmbeddingResults] = useState(null);

  const effectiveResults = embeddingResults || mlResults;

  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [error, setError] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [tableFilter, setTableFilter] = useState("");
  const [sampledConns, setSampledConns] = useState([]);

  const uniqueTitles = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map(r => (r["Position_raw"] || r["Position"] || "").trim()))).filter(Boolean);
  }, [data]);

  const unknownTitles = useMemo(() => {
    return uniqueTitles.filter(t => classifySeniority(t) === "Unknown / Other");
  }, [uniqueTitles]);

  const runClassifier = async (mode = "all") => {
    if (!data || data.length === 0) return;
    setLoading(true);
    setError(null);

    const validConns = data.filter(r => (r["First Name"] || r["Last Name"] || r["Position"] || r["Position_raw"] || "").trim());
    setSampledConns(validConns);

    const allTitlesToClassify = Array.from(new Set(validConns.map(r => (r["Position_raw"] || r["Position"] || "").trim()))).filter(Boolean);
    let targetTitles = allTitlesToClassify;

    if (mode === "unknowns") {
      targetTitles = allTitlesToClassify.filter(t => classifySeniority(t) === "Unknown / Other");
    }

    if (targetTitles.length === 0) {
      setLoading(false);
      setProgressMsg("All titles are already classified by rule/dictionary mapping!");
      return;
    }

    try {
      const modeLabel = mode === "unknowns" ? `${targetTitles.length} unknown/unmapped` : `all ${targetTitles.length} unique`;
      setProgressMsg(`Loading all-MiniLM-L6-v2 vector model & extracting embeddings for ${modeLabel} titles...`);
      setProgressPct(10);
      const results = await classifyTitlesBatchEmbeddings(targetTitles, (processed, total) => {
        const pct = Math.min(99, Math.round((processed / total) * 90) + 10);
        setProgressPct(pct);
        setProgressMsg(`Embedding similarity progress: ${processed} / ${total} titles (${pct}%)`);
      }, targetTitles.length, 32);

      const merged = { ...(mlResults || {}), ...(embeddingResults || {}), ...results };
      setEmbeddingResults(merged);
      if (onResultsGenerated) {
        onResultsGenerated(merged);
      }
      setLoading(false);
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
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  const handleApplyLlmJson = () => {
    setImportError("");
    setImportSuccess("");
    if (!jsonInput.trim()) {
      setImportError("Please paste the JSON response before applying.");
      return;
    }

    try {
      let cleanText = jsonInput.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(cleanText);
      let count = 0;
      const updated = { ...(effectiveResults || {}) };

      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          const raw = item.title || item.rawTitle || item.jobTitle;
          if (raw) {
            updated[raw] = {
              seniority: item.seniority || item.seniorityTier || "Unknown / Other",
              department: item.department || item.functionalDepartment || "Other / Unknown",
              canonicalTitle: item.canonicalTitle || raw,
              confidence: 100,
              override: true,
              rawLabel: "LLM Quality Classification",
              source: "llm"
            };
            count++;
          }
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        Object.entries(parsed).forEach(([rawTitle, item]) => {
          if (typeof item === "object" && item !== null) {
            updated[rawTitle] = {
              seniority: item.seniority || item.seniorityTier || "Unknown / Other",
              department: item.department || item.functionalDepartment || "Other / Unknown",
              canonicalTitle: item.canonicalTitle || rawTitle,
              confidence: 100,
              override: true,
              rawLabel: "LLM Quality Classification",
              source: "llm"
            };
            count++;
          } else if (typeof item === "string") {
            updated[rawTitle] = {
              seniority: item,
              department: classifyDepartment(rawTitle),
              canonicalTitle: rawTitle,
              confidence: 100,
              override: true,
              rawLabel: "LLM Quality Classification",
              source: "llm"
            };
            count++;
          }
        });
      }

      if (count === 0) {
        setImportError("No valid title mappings found in pasted JSON. Ensure keys match raw job titles.");
        return;
      }

      setEmbeddingResults(updated);
      if (onResultsGenerated) {
        onResultsGenerated(updated);
      }

      setImportSuccess(`Successfully applied LLM classifications for ${count} job titles!`);
      setTimeout(() => {
        setShowImportModal(false);
        setJsonInput("");
        setImportSuccess("");
      }, 1500);

    } catch (err) {
      setImportError("Invalid JSON format: " + err.message);
    }
  };

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

  const copyLowConfPrompt = () => {
    if (selectedTitles.size === 0) return;
    const titlesToCopy = Array.from(selectedTitles);

    const titlesJson = JSON.stringify(titlesToCopy, null, 2);
    const prompt = `You are an expert HR Data Scientist & Organizational Analyst.
I have ${titlesToCopy.length} raw job titles from my LinkedIn network that matched our vector similarity model with low confidence (< ${threshold}% similarity).

Normalize each title to a canonical title, assign a seniority tier, and assign a functional department.

1. Seniority Tiers (strictly choose one):
- "C-Suite / Founder"
- "VP / Director"
- "Manager / Lead"
- "Senior / Mid"
- "Junior / Associate"
- "Retired"
- "Unknown / Other"

2. Functional Departments (strictly choose one):
- "Engineering & Technology"
- "Product & Design"
- "Sales & Business Development"
- "Marketing & Communications"
- "Finance & Accounting"
- "People, HR & Recruiting"
- "Operations & Logistics"
- "Legal, Risk & Compliance"
- "Customer Success & Support"
- "Executive & General Management"
- "Other / Unknown"

Return a single JSON object mapping each raw title directly to:
{
  "canonicalTitle": "<Normalized Job Title>",
  "seniority": "<Seniority Tier>",
  "department": "<Functional Department>"
}

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

  const handleToggleOverride = (title) => {
    const current = (effectiveResults && effectiveResults[title]) || {
      seniority: classifySeniority(title),
      confidence: 100,
      rawLabel: title,
      override: false
    };
    const isCurrentlyOverridden = current.override !== false;
    const updated = {
      ...(effectiveResults || {}),
      [title]: {
        ...current,
        override: !isCurrentlyOverridden
      }
    };
    setEmbeddingResults(updated);
    if (onResultsGenerated) {
      onResultsGenerated(updated);
    }
  };

  const handleApplyAllOverrides = () => {
    if (!effectiveResults) return;
    const updated = { ...effectiveResults };
    Object.keys(updated).forEach(title => {
      if (updated[title]?.seniority) {
        updated[title] = {
          ...updated[title],
          override: true
        };
      }
    });
    setEmbeddingResults(updated);
    if (onResultsGenerated) {
      onResultsGenerated(updated);
    }
  };

  const handleRevertAllOverrides = () => {
    if (!effectiveResults) return;
    const updated = { ...effectiveResults };
    Object.keys(updated).forEach(title => {
      if (updated[title]) {
        updated[title] = {
          ...updated[title],
          override: false
        };
      }
    });
    setEmbeddingResults(updated);
    if (onResultsGenerated) {
      onResultsGenerated(updated);
    }
  };

  const [activeTab, setActiveTab] = useState("all"); // "all", "low_conf", "diffs", "overrides"

  const allPool = useMemo(() => {
    let pool = [];
    const source = sampledConns.length > 0 ? sampledConns : (data || []);
    pool = source.map((conn, idx) => {
      const name = `${conn["First Name"] || ""} ${conn["Last Name"] || ""}`.trim() || "Unknown";
      const company = conn["Company"] || "—";
      const title = (conn["Position_raw"] || conn["Position"] || "").trim();
      const mapLabel = classifySeniority(title);
      const mapDept = classifyDepartment(title);
      const embRes = effectiveResults ? effectiveResults[title] : null;
      const embSeniority = embRes?.seniority || mapLabel;
      const embDept = embRes?.department || mapDept;

      return {
        id: idx + "-" + name + "-" + title,
        name,
        company,
        title,
        mapLabel,
        mapDept,
        embRes,
        embSeniority: embSeniority || "—",
        embDept: embDept || "—",
        confidence: embRes?.confidence ?? null,
        rawLabel: embRes?.rawLabel || "—",
        linkedinUrl: conn["URL"] || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name + " " + company)}`
      };
    });
    return pool;
  }, [data, sampledConns, effectiveResults]);

  const tabCounts = useMemo(() => {
    let lowConf = 0;
    let overrides = 0;
    allPool.forEach(r => {
      if (r.confidence !== null && r.confidence < threshold) lowConf++;
      if (r.embRes && r.embSeniority !== "—" && (r.embRes.override !== false || r.mapLabel !== r.embSeniority)) overrides++;
    });
    return {
      all: allPool.length,
      low_conf: lowConf,
      overrides
    };
  }, [allPool, threshold]);

  const displayRows = useMemo(() => {
    let filtered = allPool;

    if (activeTab === "low_conf") {
      filtered = filtered.filter(r => r.confidence !== null && r.confidence < threshold);
    } else if (activeTab === "overrides") {
      filtered = filtered.filter(r => r.embRes && r.embSeniority !== "—" && (r.embRes.override !== false || r.mapLabel !== r.embSeniority));
    }

    if (!tableFilter.trim()) return filtered;
    const q = tableFilter.toLowerCase();
    return filtered.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.embSeniority.toLowerCase().includes(q) ||
      r.mapLabel.toLowerCase().includes(q)
    );
  }, [allPool, activeTab, threshold, tableFilter]);

  const selectedContactsCount = useMemo(() => {
    if (selectedTitles.size === 0) return 0;
    return displayRows.filter(r => selectedTitles.has(r.title)).length;
  }, [displayRows, selectedTitles]);

  const isAllFilteredSelected = useMemo(() => {
    if (displayRows.length === 0) return false;
    return displayRows.every(r => selectedTitles.has(r.title));
  }, [displayRows, selectedTitles]);

  const toggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedTitles(prev => {
        const next = new Set(prev);
        displayRows.forEach(r => next.delete(r.title));
        return next;
      });
    } else {
      setSelectedTitles(prev => {
        const next = new Set(prev);
        displayRows.forEach(r => next.add(r.title));
        return next;
      });
    }
  };

  const selectTopN = (n) => {
    const topN = displayRows.slice(0, n).map(r => r.title);
    setSelectedTitles(new Set(topN));
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
      {/* Top Header & Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textDim, textTransform: "uppercase" }}>
              Seniority Classification Engine
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {!loading && (
            <>
              <button
                onClick={() => runClassifier("unknowns")}
                title="Fast ML run: Only compute vector embeddings for titles that could not be mapped by exact dictionary or keyword rules"
                style={{
                  padding: "7px 14px", background: C.accent3,
                  border: "none", borderRadius: 8, color: "#ffffff", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)"
                }}>
                <span>⚡</span> Classify Unknowns Only ({unknownTitles.length} Titles)
              </button>

              <button
                onClick={() => runClassifier("all")}
                title="Full ML run: Compute vector embeddings for all unique titles across the dataset"
                style={{
                  padding: "7px 14px", background: C.surface,
                  border: `1px solid ${C.accent3}`, borderRadius: 8, color: C.accent3, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}>
                <span>🧠</span> Classify All Unique Titles ({uniqueTitles.length} Titles)
              </button>
            </>
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
            <strong>Seniority Categories:</strong> C-Suite / Founder, VP / Director, Manager / Lead, Senior / Mid, Junior / Associate, Retired, Unknown / Other.
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
        <div style={{ padding: 12, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", borderRadius: 8, fontSize: 12, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Seniority Bar Chart */}
      <SeniorityChart data={data} mlResults={effectiveResults} useML={true} />

      {/* ML Summary Callout */}
      <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 12, color: C.text }}>
          {effectiveResults ? (
            <>
              <strong>Seniority Classification Comparison:</strong> Evaluated batch of <strong>{sampledConns.length || data?.length || Object.keys(effectiveResults).length}</strong> connections.
              {reclassifiedCount > 0 && <> Re-classified <strong>{reclassifiedCount}</strong> obscure job titles using vector similarity.</>}
            </>
          ) : (
            <>
              <strong>Seniority Classification Review Table:</strong> Showing <strong>{allPool.length}</strong> connections categorized by Keyword/Rule Seniority. Click "⚡ Classify Unknowns Only" or "🧠 Classify All Unique Titles" above to run ML embeddings.
            </>
          )}
        </div>
      </div>

      {/* Predictions Table */}
      <div style={{ marginTop: 16, overflowX: "auto" }}>
          {/* Option 1: Tab Navigation Bar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              {/* Filter Tabs */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", background: C.surface, padding: 4, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <button
                  onClick={() => setActiveTab("all")}
                  style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit",
                    background: activeTab === "all" ? C.accent : "transparent",
                    color: activeTab === "all" ? "#ffffff" : C.textDim,
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.15s ease"
                  }}>
                  📊 All Connections
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: activeTab === "all" ? "rgba(255,255,255,0.25)" : C.border, color: activeTab === "all" ? "#fff" : C.text }}>
                    {tabCounts.all}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("low_conf")}
                  title="Show connections with ML match confidence below the threshold"
                  style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    background: activeTab === "low_conf" ? "rgba(245, 158, 11, 0.2)" : "transparent",
                    color: activeTab === "low_conf" ? "#fbbf24" : C.textDim,
                    border: activeTab === "low_conf" ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid transparent",
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.15s ease"
                  }}>
                  🔍 Low Confidence (&lt; {threshold}%)
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: activeTab === "low_conf" ? "#f59e0b" : C.border, color: activeTab === "low_conf" ? "#000" : C.text, fontWeight: 700 }}>
                    {tabCounts.low_conf}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("overrides")}
                  title="Show connections with active ML overrides or classification differences relative to Keyword rules"
                  style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    background: activeTab === "overrides" ? `${C.accent3}25` : "transparent",
                    color: activeTab === "overrides" ? C.accent3 : C.textDim,
                    border: activeTab === "overrides" ? `1px solid ${C.accent3}` : "1px solid transparent",
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.15s ease"
                  }}>
                  ⚡ ML Overrides & Diffs
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: activeTab === "overrides" ? C.accent3 : C.border, color: activeTab === "overrides" ? "#fff" : C.text, fontWeight: 700 }}>
                    {tabCounts.overrides}
                  </span>
                </button>
              </div>

              {/* Search Filter Input */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={tableFilter}
                  onChange={e => setTableFilter(e.target.value)}
                  placeholder="Search connection, title, or company..."
                  style={{
                    padding: "5px 10px", background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: 6, color: C.text, fontSize: 11, outline: "none", fontFamily: "inherit",
                    minWidth: 180
                  }}
                />
              </div>
            </div>

            {/* Dedicated Toolbar Row for Overrides Management (ML Overrides & Diffs tab only) */}
            {activeTab === "overrides" && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                background: C.surface,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${C.border}`
              }}>
                <div style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>
                  ⚡ ML Inferred Seniority Overrides & Classification Differences
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={handleApplyAllOverrides}
                    title="Apply all ML Inferred Seniorities as overrides across the dataset"
                    style={{
                      padding: "5px 12px", background: `${C.accent3}22`, border: `1px solid ${C.accent3}`,
                      borderRadius: 6, color: C.accent3, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4
                    }}>
                    ⚡ Apply All Overrides
                  </button>

                  <button
                    onClick={handleRevertAllOverrides}
                    title="Revert all overrides back to keyword mapping"
                    style={{
                      padding: "5px 12px", background: C.card, border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      fontFamily: "inherit"
                    }}>
                    ↩ Revert All
                  </button>
                </div>
              </div>
            )}

            {/* Dedicated Toolbar Row for Threshold, Quick Select & LLM Prompting (Low-Confidence tab only) */}
            {activeTab === "low_conf" && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                background: C.surface,
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${C.border}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.textDim, fontWeight: 600 }}>
                    <span>Threshold:</span>
                    <select
                      value={threshold}
                      onChange={e => setThreshold(Number(e.target.value))}
                      style={{
                        padding: "4px 8px", background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 6, color: C.text, fontSize: 11, fontWeight: 600, outline: "none",
                        cursor: "pointer", fontFamily: "inherit"
                      }}
                    >
                      <option value={50}>&lt; 50% Match</option>
                      <option value={60}>&lt; 60% Match</option>
                      <option value={70}>&lt; 70% Match</option>
                      <option value={75}>&lt; 75% Match (Default)</option>
                      <option value={80}>&lt; 80% Match</option>
                      <option value={90}>&lt; 90% Match</option>
                      <option value={100}>&lt; 100% Match (All)</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: C.textDim }}>Quick Select:</span>
                    <button
                      onClick={() => selectTopN(25)}
                      title="Select top 25 visible rows for LLM prompt"
                      style={{
                        padding: "3px 10px", background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 6, color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                      }}>
                      Top 25
                    </button>
                    <button
                      onClick={() => selectTopN(50)}
                      title="Select top 50 visible rows for LLM prompt"
                      style={{
                        padding: "3px 10px", background: C.card, border: `1px solid ${C.border}`,
                        borderRadius: 6, color: C.text, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                      }}>
                      Top 50
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={copyLowConfPrompt}
                    disabled={selectedContactsCount === 0}
                    title={selectedContactsCount === 0 ? "Select contacts using checkboxes or Top 25/50 to copy LLM prompt" : "Copy LLM Prompt for selected contacts"}
                    style={{
                      padding: "5px 14px",
                      background: selectedContactsCount === 0 ? C.border : copiedLowConfPrompt ? "#10b981" : C.accent,
                      border: "none",
                      borderRadius: 6,
                      color: selectedContactsCount === 0 ? C.textDim : "#ffffff",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: selectedContactsCount === 0 ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: selectedContactsCount === 0 ? "none" : "0 2px 4px rgba(0,0,0,0.15)",
                      opacity: selectedContactsCount === 0 ? 0.7 : 1
                    }}
                  >
                    <span>{copiedLowConfPrompt ? "✓" : "📋"}</span>
                    {copiedLowConfPrompt
                      ? "Copied LLM Prompt!"
                      : `Copy Prompt (${selectedContactsCount} Selected Contact${selectedContactsCount === 1 ? "" : "s"})`}
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    title="Paste JSON returned by LLM to apply high quality Seniority and Department classifications"
                    style={{
                      padding: "5px 12px",
                      background: C.surface,
                      border: `1px solid ${C.accent}`,
                      borderRadius: 6,
                      color: C.accent,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: 6
                    }}
                  >
                    <span>📥</span> Import LLM JSON
                  </button>
                </div>
              </div>
            )}

            {/* Connection count & Active Filter Status */}
            <div style={{ fontSize: 11, color: C.textDim, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "0 2px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span>Showing <strong>{displayRows.length}</strong> connection records</span>
                <span style={{ color: selectedContactsCount > 0 ? C.accent : C.textDim, fontWeight: 600 }}>
                  ({selectedContactsCount} contact{selectedContactsCount === 1 ? "" : "s"} selected)
                </span>
              </div>

              {activeTab === "low_conf" && (
                <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                  🔍 ML similarity score &lt; {threshold}%
                </span>
              )}
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>
                <th style={{ padding: "8px 8px", width: 36, textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={toggleSelectAll}
                    title="Select/Deselect All Visible Rows for LLM Prompt"
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th style={{ padding: "8px 12px", color: C.textDim, maxWidth: 180 }}>Connection Name</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Company</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Job Title</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Keyword Seniority</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>ML Inferred Seniority</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>ML Confidence</th>
                <th style={{ padding: "8px 12px", color: C.textDim }}>Action / Override</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 16, textAlign: "center", color: C.textDim }}>
                    No connections match your filter query.
                  </td>
                </tr>
              ) : (
                displayRows.map((r) => {
                  const isSelected = selectedTitles.has(r.title);
                  const isDiff = r.mapLabel !== r.embSeniority && r.embSeniority !== "—";
                  const isOverridden = r.embRes && r.embRes.override !== false && r.embSeniority !== "—";
                  const mapSenColor = SENIORITY.find(s => s.label === r.mapLabel)?.color || C.muted;
                  const senColor = SENIORITY.find(s => s.label === r.embSeniority)?.color || C.muted;

                  return (
                    <tr key={r.id} style={{
                      borderBottom: `1px solid ${C.border}22`,
                      background: isSelected
                        ? `${C.accent}18`
                        : isOverridden
                          ? "rgba(16, 185, 129, 0.12)"
                          : isDiff
                            ? "rgba(245, 158, 11, 0.08)"
                            : "transparent"
                    }}>
                      <td style={{ padding: "8px 8px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTitle(r.title)}
                          title="Select title for LLM Prompt"
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={{ padding: "8px 12px", fontWeight: 600, color: C.text, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.name}>
                        <a href={r.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          style={{ color: C.accent, textDecoration: "none", display: "inline-block", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", verticalAlign: "bottom" }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                        >
                          {r.name} ↗
                        </a>
                      </td>
                      <td style={{ padding: "8px 12px", color: C.textDim }}>{r.company}</td>
                      <td style={{ padding: "8px 12px", color: C.text, fontWeight: 500 }}>{r.title}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          fontSize: 10, padding: "2px 8px", borderRadius: 99,
                          background: `${mapSenColor}22`, color: mapSenColor,
                          border: `1px solid ${mapSenColor}44`, fontWeight: 600,
                          textDecoration: isOverridden ? "line-through" : "none",
                          opacity: isOverridden ? 0.6 : 1
                        }}>
                          {r.mapLabel}
                        </span>
                      </td>
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
                      <td style={{ padding: "8px 12px" }}>
                        {r.embSeniority !== "—" ? (
                          <button
                            onClick={() => handleToggleOverride(r.title)}
                            title={isOverridden ? "Revert override back to Keyword Seniority" : "Override Keyword Seniority with ML Seniority"}
                            style={{
                              padding: "3px 9px",
                              background: isOverridden ? `${C.accent3}25` : C.surface,
                              border: `1px solid ${isOverridden ? C.accent3 : C.border}`,
                              borderRadius: 6,
                              color: isOverridden ? C.accent3 : C.textDim,
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              whiteSpace: "nowrap"
                            }}
                          >
                            {isOverridden ? "✓ Override Active" : "+ Assign ML Override"}
                          </button>
                        ) : (
                          <span style={{ color: C.muted, fontSize: 11 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* LLM JSON Import Modal */}
      {showImportModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 20
        }}>
          <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
            padding: 24, maxWidth: 650, width: "100%", color: C.text,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
                📥 Import LLM Classification Results
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                style={{ background: "none", border: "none", color: C.textDim, fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: C.textDim, marginBottom: 12, lineHeight: 1.5 }}>
              Paste the JSON response returned by your LLM (Gemini, ChatGPT, Claude) after running the prompt. This will update raw job titles with canonical titles, seniority tiers, and functional departments.
            </p>

            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder={`{\n  "Senior Developer": {\n    "canonicalTitle": "Software Engineer",\n    "seniority": "Senior / Mid",\n    "department": "Engineering & Technology"\n  }\n}`}
              rows={10}
              style={{
                width: "100%", padding: 12, background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, fontSize: 12, fontFamily: "'DM Mono', monospace",
                outline: "none", resize: "vertical", marginBottom: 12
              }}
            />

            {importError && (
              <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
                {importError}
              </div>
            )}

            {importSuccess && (
              <div style={{ padding: "8px 12px", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#6ee7b7", borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
                {importSuccess}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => setShowImportModal(false)}
                style={{ padding: "7px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleApplyLlmJson}
                style={{ padding: "7px 18px", background: C.accent, border: "none", borderRadius: 6, color: "#ffffff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Apply Classifications
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

