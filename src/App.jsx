import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import Papa from "papaparse";
import { C } from "./constants/theme";
import { normalizeData, parseDate, generateSample } from "./utils/dataUtils";
import { StatCard } from "./components/common/StatCard";
import { Section } from "./components/common/Section";
import { EmbeddingSenioritySection } from "./components/overview/EmbeddingSenioritySection";
import { TopCompanies } from "./components/overview/TopCompanies";
import { Heatmap } from "./components/activity/Heatmap";
import { ConnectionsTable } from "./components/connections/ConnectionsTable";
import { JobSearch } from "./components/jobSearch/JobSearch";

const STORAGE_KEY = "linkedin_network_explorer_data";
const STORAGE_META_KEY = "linkedin_network_explorer_meta";
const STORAGE_ML_KEY = "linkedin_network_explorer_ml_results";

export default function App() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to restore saved dataset from localStorage", e);
    }
    return null;
  });

  const [dataMeta, setDataMeta] = useState(() => {
    try {
      const savedMeta = localStorage.getItem(STORAGE_META_KEY);
      if (savedMeta) return JSON.parse(savedMeta);
    } catch (e) {}
    return { isSample: false, fileName: "" };
  });

  const [mlResults, setMlResultsState] = useState(() => {
    try {
      const savedMl = localStorage.getItem(STORAGE_ML_KEY);
      if (savedMl) return JSON.parse(savedMl);
    } catch (e) {
      console.error("Failed to restore saved ML results from localStorage", e);
    }
    return null;
  });

  const setMlResults = useCallback((results) => {
    setMlResultsState(prev => {
      const updated = typeof results === "function" ? results(prev) : results;
      try {
        if (updated && Object.keys(updated).length > 0) {
          localStorage.setItem(STORAGE_ML_KEY, JSON.stringify(updated));
        } else {
          localStorage.removeItem(STORAGE_ML_KEY);
        }
      } catch (e) {
        console.warn("Could not save ML results to localStorage (quota exceeded)", e);
      }
      return updated;
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("overview");
  const fileRef = useRef();

  const persistData = (normData, meta = { isSample: false, fileName: "" }) => {
    setData(normData);
    setDataMeta(meta);
    setMlResults(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normData));
      localStorage.setItem(STORAGE_META_KEY, JSON.stringify(meta));
      localStorage.removeItem(STORAGE_ML_KEY);
    } catch (e) {
      console.warn("Could not save to localStorage (quota exceeded)", e);
    }
  };

  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_META_KEY);
      localStorage.removeItem(STORAGE_ML_KEY);
    } catch (e) {}
    setData(null);
    setDataMeta({ isSample: false, fileName: "" });
    setMlResults(null);
  };

  const loadFile = useCallback((file) => {
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      const headerIdx = lines.findIndex(l => l.trimStart().startsWith("First Name"));
      const csv = headerIdx >= 0 ? lines.slice(headerIdx).join("\n") : text;
      Papa.parse(csv, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const clean = result.data.filter(r => (r["First Name"] || r["Last Name"] || "").trim());
          const norm = normalizeData(clean);
          persistData(norm, { isSample: false, fileName: file.name });
          setLoading(false);
        },
      });
    };
    reader.readAsText(file);
  }, []);

  const loadSample = () => {
    const norm = normalizeData(generateSample());
    persistData(norm, { isSample: true, fileName: "Sample Dataset" });
  };

  const stats = useMemo(() => {
    if (!data) return null;
    const withEmail = data.filter(r => r["Email Address"]?.trim()).length;
    const companies = new Set(data.map(r => r["Company"]?.trim()).filter(Boolean));
    const dates = data.map(r => parseDate(r["Connected On"])).filter(Boolean).sort((a,b)=>a-b);
    const newest = dates[dates.length-1];
    const oldest = dates[0];
    return { total: data.length, withEmail, companies: companies.size, newest, oldest };
  }, [data]);

  const TABS = ["overview", "seniority embedding", "activity", "companies", "connections", "job search"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        input::placeholder { color: ${C.muted}; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 32px", display: "flex", alignItems: "center", gap: 16, background: C.surface, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
            <span style={{ color: C.accent }}>LN</span> Network Explorer
          </div>
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>LinkedIn connections analyser</div>
        </div>
        <div style={{ flex: 1 }} />
        {data && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 12, color: C.text, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                {data.length.toLocaleString()} connections
              </span>
              <div style={{ fontSize: 10, color: C.textDim }}>
                {dataMeta.isSample ? "Demo mode (sample data saved)" : dataMeta.fileName ? `File: ${dataMeta.fileName}` : "Saved in browser storage"}
              </div>
            </div>
            <button onClick={() => fileRef.current?.click()}
              style={{
                padding: "8px 16px", background: "transparent",
                border: `1px solid ${C.accent}`, borderRadius: 8,
                color: C.accent, fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
              }}>
              Upload New CSV
            </button>
            <button onClick={clearSavedData}
              title="Remove stored data and reset to upload screen"
              style={{
                padding: "8px 14px", background: "transparent",
                border: `1px solid ${C.border}`, borderRadius: 8,
                color: C.textDim, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent3; e.currentTarget.style.color = C.accent3; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textDim; }}
            >
              Clear Data
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }}
          value=""
          onChange={e => loadFile(e.target.files[0])} />
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {!data ? (
          /* Upload screen */
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 24 }}>
            <div style={{
              border: `2px dashed ${C.border}`, borderRadius: 16,
              padding: "64px 80px", textAlign: "center", cursor: "pointer",
              transition: "border-color 0.2s",
            }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Drop your Connections.csv here</div>
              <div style={{ fontSize: 13, color: C.textDim, marginBottom: 24 }}>
                From LinkedIn → Settings → Data Privacy → Get a copy of your data
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                  style={{ padding: "10px 24px", background: C.accent, border: "none", borderRadius: 8, color: '#ffffff', fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Choose file
                </button>
                <button onClick={e => { e.stopPropagation(); loadSample(); }}
                  style={{ padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.textDim, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Load sample data
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>
              Your data never leaves your browser — all processing is local.
            </div>
          </div>
        ) : loading ? (
          <div style={{ textAlign: "center", padding: 80, color: C.textDim }}>Parsing…</div>
        ) : (
          <>
            {/* Stat row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <StatCard label="Total connections" value={stats.total.toLocaleString()} accent={C.accent} />
              <StatCard label="With email" value={stats.withEmail.toLocaleString()}
                sub={`${((stats.withEmail/stats.total)*100).toFixed(1)}% of network`} accent={C.accent2} />
              <StatCard label="Companies" value={stats.companies.toLocaleString()} accent="#f472b6" />
              <StatCard label="Oldest connection"
                value={stats.oldest ? stats.oldest.getFullYear() : "—"}
                sub={stats.oldest?.toLocaleDateString()} accent={C.accent} />
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: '#eef2f7', padding: 4, borderRadius: 10, width: "fit-content" }}>
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{
                    padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: tab === t ? C.card : "transparent",
                    color: tab === t ? C.text : C.textDim,
                    fontSize: 12, fontWeight: tab === t ? 600 : 400,
                    fontFamily: "inherit", textTransform: "capitalize",
                    transition: "all 0.15s",
                    boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                  }}>
                  {t}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <Section title="Top 12 Companies">
                <TopCompanies data={data} />
              </Section>
            )}

            {tab === "seniority embedding" && (
              <EmbeddingSenioritySection
                data={data}
                mlResults={mlResults}
                onResultsGenerated={(results) => setMlResults(results)}
              />
            )}

            {tab === "activity" && (
              <Section title="Connections Over Time — Monthly Heatmap">
                <Heatmap data={data} />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 16 }}>
                  Each cell = one month. Hover for exact count. Dark spikes often signal conferences, job changes, or active outreach campaigns.
                </div>
              </Section>
            )}

            {tab === "companies" && (
              <Section title="Top Companies (Extended — top 12)">
                <TopCompanies data={data} />
              </Section>
            )}

            {tab === "connections" && (
              <Section title="All Connections">
                <ConnectionsTable data={data} mlResults={mlResults} />
              </Section>
            )}

            {tab === "job search" && (
              <JobSearch data={data} mlResults={mlResults} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
