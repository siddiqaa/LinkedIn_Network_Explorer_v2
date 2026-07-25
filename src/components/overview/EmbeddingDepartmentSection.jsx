import { useState, useMemo } from "react";
import { C } from "../../constants/theme";
import { classifyDepartment } from "../../utils/departmentClassifier";
import { classifyTitlesBatchEmbeddings } from "../../lib/embeddingClassifier";
import { DepartmentChart } from "./DepartmentChart";
import { DEPARTMENT_CATEGORIES } from "../../data/departmentMap";

export function EmbeddingDepartmentSection({ data, mlResults, onResultsGenerated }) {
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
    return uniqueTitles.filter(t => classifyDepartment(t) === "Other / Unknown");
  }, [uniqueTitles]);

  const runDepartmentClassifier = async (mode = "all") => {
    if (!data || data.length === 0) return;
    setLoading(true);
    setError(null);

    const validConns = data.filter(r => (r["First Name"] || r["Last Name"] || r["Position"] || r["Position_raw"] || "").trim());
    setSampledConns(validConns);

    const allTitlesToClassify = Array.from(new Set(validConns.map(r => (r["Position_raw"] || r["Position"] || "").trim()))).filter(Boolean);
    let targetTitles = allTitlesToClassify;

    if (mode === "unknowns") {
      targetTitles = allTitlesToClassify.filter(t => classifyDepartment(t) === "Other / Unknown");
    }

    if (targetTitles.length === 0) {
      setLoading(false);
      setProgressMsg("All titles are already categorized by rule/dictionary department mapping!");
      return;
    }

    try {
      const modeLabel = mode === "unknowns" ? `${targetTitles.length} unknown/unmapped` : `all ${targetTitles.length} unique`;
      setProgressMsg(`Loading vector model & computing department semantic similarity for ${modeLabel} titles...`);
      setProgressPct(10);

      const results = await classifyTitlesBatchEmbeddings(targetTitles, (processed, total) => {
        const pct = Math.min(99, Math.round((processed / total) * 90) + 10);
        setProgressPct(pct);
        setProgressMsg(`Department similarity progress: ${processed} / ${total} titles (${pct}%)`);
      }, targetTitles.length, 32);

      const merged = { ...(mlResults || {}), ...(embeddingResults || {}), ...results };
      setEmbeddingResults(merged);
      if (onResultsGenerated) {
        onResultsGenerated(merged);
      }
      setLoading(false);
    } catch (err) {
      console.error("[Department Classifier UI] Execution error:", err);
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

  const titleCounts = useMemo(() => {
    if (!data) return {};
    const map = {};
    data.forEach(r => {
      const t = (r["Position_raw"] || r["Position"] || "").trim();
      if (t) map[t] = (map[t] || 0) + 1;
    });
    return map;
  }, [data]);

  const rawLowConfTitles = useMemo(() => {
    if (!data) return [];
    const valid = data.filter(r => (r["First Name"] || r["Last Name"] || r["Position"] || r["Position_raw"] || "").trim());
    const unique = Array.from(new Set(valid.map(r => (r["Position_raw"] || r["Position"] || "").trim()))).filter(Boolean);

    return unique.filter(title => {
      const directDept = classifyDepartment(title);
      const embRes = effectiveResults ? effectiveResults[title] : null;

      if (!embRes) {
        return directDept === "Other / Unknown";
      }

      if (embRes.source === "llm" || embRes.override) {
        return false;
      }

      const conf = embRes.confidence ?? 0;
      const dept = embRes.department || directDept;
      return conf < threshold || dept === "Other / Unknown";
    });
  }, [data, effectiveResults, threshold]);

  const sortedLowConfTitles = useMemo(() => {
    return [...rawLowConfTitles].sort((a, b) => (titleCounts[b] || 0) - (titleCounts[a] || 0));
  }, [rawLowConfTitles, titleCounts]);

  const handleSelectTop = (count) => {
    const top = sortedLowConfTitles.slice(0, count);
    setSelectedTitles(new Set(top));
  };

  const handleSelectAllLowConf = () => {
    if (selectedTitles.size === sortedLowConfTitles.length) {
      setSelectedTitles(new Set());
    } else {
      setSelectedTitles(new Set(sortedLowConfTitles));
    }
  };

  const toggleTitleSelection = (title) => {
    const next = new Set(selectedTitles);
    if (next.has(title)) {
      next.delete(title);
    } else {
      next.add(title);
    }
    setSelectedTitles(next);
  };

  const selectedContactsCount = useMemo(() => {
    let count = 0;
    selectedTitles.forEach(t => {
      count += (titleCounts[t] || 0);
    });
    return count;
  }, [selectedTitles, titleCounts]);

  const copyLowConfPrompt = () => {
    if (selectedTitles.size === 0) return;
    const titlesToCopy = Array.from(selectedTitles);
    const titlesJson = JSON.stringify(titlesToCopy, null, 2);

    const prompt = `You are an expert HR Data Scientist & Organizational Analyst.
I have ${titlesToCopy.length} raw job titles from my LinkedIn network that need functional department classification.

For each raw job title:
1. Normalize to a canonical job title.
2. Assign a Seniority Tier.
3. Assign a Functional Department (strictly choose one of the following):
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
- "Consulting & Advisory"
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
              seniority: classifyDepartment(rawTitle),
              department: item,
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

      setImportSuccess(`Successfully applied LLM department classifications for ${count} job titles!`);
      setTimeout(() => {
        setShowImportModal(false);
        setJsonInput("");
        setImportSuccess("");
      }, 1500);

    } catch (err) {
      setImportError("Invalid JSON format: " + err.message);
    }
  };

  const allProcessedRows = useMemo(() => {
    if (!data) return [];
    const validConns = data.filter(r => (r["First Name"] || r["Last Name"] || r["Position"] || r["Position_raw"] || "").trim());

    return validConns.map((conn, idx) => {
      const name = `${conn["First Name"] || ""} ${conn["Last Name"] || ""}`.trim() || "Anonymous";
      const company = conn["Company"] || "—";
      const title = (conn["Position_raw"] || conn["Position"] || "").trim();
      const mapDept = classifyDepartment(title);
      const embRes = effectiveResults ? effectiveResults[title] : null;
      const embDept = embRes?.department || mapDept;

      return {
        id: idx + "-" + name + "-" + title,
        name,
        company,
        title,
        mapDept,
        embRes,
        embDept: embDept || "Other / Unknown",
        confidence: embRes?.confidence ?? null,
        rawLabel: embRes?.rawLabel || "—",
        linkedinUrl: conn["URL"] || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name + " " + company)}`
      };
    });
  }, [data, effectiveResults]);

  const displayRows = useMemo(() => {
    if (!tableFilter.trim()) return allProcessedRows;
    const q = tableFilter.toLowerCase();
    return allProcessedRows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.embDept.toLowerCase().includes(q)
    );
  }, [allProcessedRows, tableFilter]);

  const stats = useMemo(() => {
    const totalTitles = uniqueTitles.length;
    const unmappedCount = unknownTitles.length;
    const mappedCount = totalTitles - unmappedCount;
    const llmCount = Object.values(effectiveResults || {}).filter(r => r.source === "llm" || r.override).length;

    return { totalTitles, mappedCount, unmappedCount, llmCount };
  }, [uniqueTitles, unknownTitles, effectiveResults]);

  if (!data || data.length === 0) return null;

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
      {/* Title & Pipeline Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text }}>
              🏢 Functional Department Pipeline & Classifier
            </h3>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: `${C.accent}22`, color: C.accent, fontWeight: 600, border: `1px solid ${C.accent}44` }}>
              3-Step Pipeline
            </span>
          </div>
          <p style={{ fontSize: 12, color: C.textDim, marginTop: 4, maxWidth: 680 }}>
            Categorizes connections into 12 functional domains (Engineering, Product, Sales, Marketing, Operations, etc.) using direct mappings, keyword pattern matching, and AI embedding vector similarity.
          </p>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          style={{ padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: C.textDim, cursor: "pointer", fontFamily: "inherit" }}>
          {showExplanation ? "Hide How It Works ▲" : "How Pipeline Works ▼"}
        </button>
      </div>

      {/* Explanation Banner */}
      {showExplanation && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, marginBottom: 20, fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: C.text, marginBottom: 8, fontSize: 13 }}>
            Architectural Pipeline for Department Categorization:
          </div>
          <ol style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>
              <strong style={{ color: C.accent }}>Step 1: Direct & Dictionary Mapping (Instant)</strong> — Direct exact title lookups mapping clean titles to functional departments.
            </li>
            <li>
              <strong style={{ color: C.accent2 }}>Step 2: Keyword Pattern Matching (Rule-based)</strong> — Fast regex pattern matching across job titles for core domain terms (e.g. <em>engineer, devops, product manager, sales executive, recruiter</em>).
            </li>
            <li>
              <strong style={{ color: C.accent3 }}>Step 3: Transformers.js Vectors & LLM Quality Closure</strong> — Calculates 384-dimensional dense semantic embeddings using <code>all-MiniLM-L6-v2</code> to compute cosine similarity, plus prompt generation for 100% accurate LLM overrides.
            </li>
          </ol>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 16px", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: C.textDim }}>Unique Job Titles</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginTop: 2 }}>{stats.totalTitles.toLocaleString()}</div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 16px", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: C.textDim }}>Rule/Keyword Mapped</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, marginTop: 2 }}>
            {stats.mappedCount.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: C.textDim }}>({stats.totalTitles ? Math.round((stats.mappedCount/stats.totalTitles)*100) : 0}%)</span>
          </div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 16px", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: C.textDim }}>Unmapped / Other</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: stats.unmappedCount > 0 ? C.accent3 : C.textDim, marginTop: 2 }}>
            {stats.unmappedCount.toLocaleString()}
          </div>
        </div>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: "12px 16px", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: C.textDim }}>LLM High-Quality Overrides</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981", marginTop: 2 }}>
            {stats.llmCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <button
          onClick={() => runDepartmentClassifier("all")}
          disabled={loading}
          style={{
            padding: "8px 18px",
            background: C.accent,
            border: "none",
            borderRadius: 6,
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}>
          {loading ? "Processing Model..." : "⚡ Classify All Titles (Transformers.js)"}
        </button>

        {stats.unmappedCount > 0 && (
          <button
            onClick={() => runDepartmentClassifier("unknowns")}
            disabled={loading}
            style={{
              padding: "8px 16px",
              background: C.surface,
              border: `1px solid ${C.accent}`,
              borderRadius: 6,
              color: C.accent,
              fontSize: 12,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit"
            }}>
            🎯 Classify {stats.unmappedCount} Unmapped Titles Only
          </button>
        )}

        <button
          onClick={() => setShowImportModal(true)}
          style={{
            padding: "8px 16px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 6,
            color: C.text,
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit"
          }}>
          📥 Import LLM Department JSON
        </button>
      </div>

      {/* Progress & Error indicators */}
      {loading && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.textDim, marginBottom: 4 }}>
            <span>{progressMsg}</span>
            <span>{progressPct}%</span>
          </div>
          <div style={{ width: "100%", height: 6, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: C.accent, transition: "width 0.2s" }} />
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: 12, background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#fca5a5", borderRadius: 6, fontSize: 12, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Department Breakdown Chart */}
      <div style={{ marginBottom: 24, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>
          Network Distribution by Department
        </div>
        <DepartmentChart data={data} mlResults={effectiveResults} />
      </div>

      {/* Low Confidence & LLM Closure Prompt Section */}
      <div style={{ marginTop: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
              🔍 Low-Confidence & Unmapped Department Titles ({sortedLowConfTitles.length})
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
              Generate an LLM prompt to classify low-confidence or unmapped titles into exact functional departments.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => handleSelectTop(25)}
              style={{ padding: "4px 10px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, color: C.text, cursor: "pointer" }}>
              Top 25
            </button>
            <button
              onClick={() => handleSelectTop(50)}
              style={{ padding: "4px 10px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, color: C.text, cursor: "pointer" }}>
              Top 50
            </button>
            <button
              onClick={handleSelectAllLowConf}
              style={{ padding: "4px 10px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 11, color: C.text, cursor: "pointer" }}>
              {selectedTitles.size === sortedLowConfTitles.length ? "Deselect All" : "Select All"}
            </button>
            <button
              onClick={copyLowConfPrompt}
              disabled={selectedTitles.size === 0}
              style={{
                padding: "6px 14px",
                background: selectedTitles.size === 0 ? C.border : copiedLowConfPrompt ? "#10b981" : C.accent,
                border: "none",
                borderRadius: 6,
                color: selectedTitles.size === 0 ? C.textDim : "#ffffff",
                fontSize: 11,
                fontWeight: 600,
                cursor: selectedTitles.size === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit"
              }}>
              {copiedLowConfPrompt ? "✓ Copied Prompt!" : `📋 Copy Prompt (${selectedTitles.size} Titles / ${selectedContactsCount} Contacts)`}
            </button>
          </div>
        </div>

        {/* Selected Titles Chips */}
        {sortedLowConfTitles.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 180, overflowY: "auto", padding: 8, background: C.card, border: `1px solid ${C.border}`, borderRadius: 6 }}>
            {sortedLowConfTitles.map(t => {
              const isSel = selectedTitles.has(t);
              const cnt = titleCounts[t] || 0;
              return (
                <span
                  key={t}
                  onClick={() => toggleTitleSelection(t)}
                  style={{
                    fontSize: 11, padding: "3px 8px", borderRadius: 4,
                    background: isSel ? `${C.accent}22` : C.surface,
                    border: `1px solid ${isSel ? C.accent : C.border}`,
                    color: isSel ? C.accent : C.textDim,
                    cursor: "pointer", userSelect: "none", display: "inline-flex", alignItems: "center", gap: 4
                  }}>
                  {isSel ? "✓" : "+"} {t} <span style={{ opacity: 0.6, fontSize: 10 }}>({cnt})</span>
                </span>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.textDim, fontStyle: "italic", padding: 8 }}>
            No low-confidence or unmapped department titles detected.
          </div>
        )}
      </div>

      {/* Connection Table */}
      <div style={{ marginTop: 24, overflowX: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
            Connections Department List ({displayRows.length.toLocaleString()})
          </div>
          <input
            type="text"
            value={tableFilter}
            onChange={e => setTableFilter(e.target.value)}
            placeholder="Filter by name, company, position, department..."
            style={{
              padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 6, color: C.text, fontSize: 12, width: 260, outline: "none"
            }}
          />
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.surface }}>
              <th style={{ padding: "8px 12px", color: C.textDim }}>Name</th>
              <th style={{ padding: "8px 12px", color: C.textDim }}>Company</th>
              <th style={{ padding: "8px 12px", color: C.textDim }}>Position</th>
              <th style={{ padding: "8px 12px", color: C.textDim }}>Direct/Keyword Dept</th>
              <th style={{ padding: "8px 12px", color: C.textDim }}>Inferred Dept</th>
              <th style={{ padding: "8px 12px", color: C.textDim }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.slice(0, 100).map((r, i) => (
              <tr key={r.id || i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                <td style={{ padding: "8px 12px", color: C.text, fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: "8px 12px", color: C.textDim }}>{r.company}</td>
                <td style={{ padding: "8px 12px", color: C.text }}>{r.title}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: C.surface, color: C.textDim, border: `1px solid ${C.border}` }}>
                    {r.mapDept}
                  </span>
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: `${C.accent}15`, color: C.accent, fontWeight: 600, border: `1px solid ${C.accent}33` }}>
                    {r.embDept}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", color: C.textDim, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                  {r.confidence !== null ? `${r.confidence}%` : "Rule-Based"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayRows.length > 100 && (
          <div style={{ fontSize: 11, color: C.textDim, textAlign: "center", marginTop: 10 }}>
            Showing top 100 of {displayRows.length.toLocaleString()} matching connections.
          </div>
        )}
      </div>

      {/* Import LLM Modal */}
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
                📥 Import LLM Department Classifications
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                style={{ background: "none", border: "none", color: C.textDim, fontSize: 18, cursor: "pointer" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: C.textDim, marginBottom: 12, lineHeight: 1.5 }}>
              Paste the JSON response from your LLM prompt. This will apply high-quality department & canonical title classifications directly to your network dataset.
            </p>

            <textarea
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              placeholder={`{\n  "Senior Software Engineer": {\n    "canonicalTitle": "Software Engineer",\n    "seniority": "Senior / Mid",\n    "department": "Engineering & Technology"\n  }\n}`}
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
                style={{ padding: "7px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, color: C.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={handleApplyLlmJson}
                style={{ padding: "7px 18px", background: C.accent, border: "none", borderRadius: 6, color: "#ffffff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Apply Department Classifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
