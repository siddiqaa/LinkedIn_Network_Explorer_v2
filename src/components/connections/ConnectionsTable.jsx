import { useState, useMemo } from "react";
import { C, SENIORITY } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";

const COLUMNS = [
  { key: "name",         label: "Name",         sort: r => `${r["First Name"]} ${r["Last Name"]}`.toLowerCase() },
  { key: "company",      label: "Company",       sort: r => (r["Company"] || "").toLowerCase() },
  { key: "position",     label: "Position",      sort: r => (r["Position"] || "").toLowerCase() },
  { key: "email",        label: "Email",         sort: r => r["Email Address"] ? 0 : 1 },
  { key: "connectedOn",  label: "Connected On",  sort: r => r["Connected On"] || "" },
  { key: "seniority",    label: "Seniority",     sort: r => classifySeniority(r["Position"]) },
];

function SortIcon({ dir }) {
  if (!dir) return <span style={{ color: C.muted, marginLeft: 4, fontSize: 10 }}>⇅</span>;
  return <span style={{ color: C.accent, marginLeft: 4, fontSize: 10 }}>{dir === "asc" ? "↑" : "↓"}</span>;
}

export function ConnectionsTable({ data, mlResults }) {
  const [search, setSearch] = useState("");
  const [selectedSeniority, setSelectedSeniority] = useState("All");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const PER_PAGE = 200;

  // Enrich data with computed seniority
  const classifiedData = useMemo(() => {
    return data.map(r => ({
      ...r,
      _seniority: classifySeniority(r["Position_raw"] || r["Position"], mlResults)
    }));
  }, [data, mlResults]);

  // Compute total count per seniority category
  const seniorityCounts = useMemo(() => {
    const counts = { "All": data.length };
    SENIORITY.forEach(s => { counts[s.label] = 0; });
    classifiedData.forEach(r => {
      if (counts[r._seniority] !== undefined) {
        counts[r._seniority]++;
      } else {
        counts["Unknown / Other"]++;
      }
    });
    return counts;
  }, [classifiedData, data.length]);

  const COLUMNS = useMemo(() => [
    { key: "name",         label: "Name",         sort: r => `${r["First Name"]} ${r["Last Name"]}`.toLowerCase() },
    { key: "company",      label: "Company",       sort: r => (r["Company"] || "").toLowerCase() },
    { key: "position",     label: "Position",      sort: r => (r["Position_raw"] || r["Position"] || "").toLowerCase() },
    { key: "email",        label: "Email",         sort: r => r["Email Address"] ? 0 : 1 },
    { key: "connectedOn",  label: "Connected On",  sort: r => r["Connected On"] || "" },
    { key: "seniority",    label: "Seniority",     sort: r => r._seniority },
  ], []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    let rows = classifiedData;

    if (selectedSeniority && selectedSeniority !== "All") {
      rows = rows.filter(r => r._seniority === selectedSeniority);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      const searchFields = ["First Name","Last Name","Company","Position","Position_raw","Email Address","Connected On"];
      rows = rows.filter(r => searchFields.some(k => String(r[k] || "").toLowerCase().includes(q)));
    }

    if (sortKey) {
      const col = COLUMNS.find(c => c.key === sortKey);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = col.sort(a), bv = col.sort(b);
          if (av < bv) return sortDir === "asc" ? -1 : 1;
          if (av > bv) return sortDir === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return rows;
  }, [classifiedData, selectedSeniority, search, sortKey, sortDir, COLUMNS]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const visible = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const handleSearch = (e) => { setSearch(e.target.value); setPage(0); };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={handleSearch}
          placeholder="Search name, company, title…"
          style={{
            flex: 1, minWidth: 200, padding: "8px 14px",
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, color: C.text, fontSize: 13,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <span style={{ color: C.textDim, fontSize: 12, whiteSpace: "nowrap" }}>
          {filtered.length.toLocaleString()} results
        </span>
      </div>

      {/* Seniority Filter Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.textDim, marginRight: 2 }}>Seniority:</span>
        <button
          onClick={() => { setSelectedSeniority("All"); setPage(0); }}
          style={{
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 99,
            border: `1px solid ${selectedSeniority === "All" ? C.accent : C.border}`,
            background: selectedSeniority === "All" ? `${C.accent}15` : C.surface,
            color: selectedSeniority === "All" ? C.accent : C.textDim,
            fontWeight: selectedSeniority === "All" ? 600 : 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "inline-flex",
            alignItems: "center",
            gap: 4
          }}
        >
          All
          <span style={{
            fontSize: 10,
            opacity: selectedSeniority === "All" ? 1 : 0.7,
            background: selectedSeniority === "All" ? `${C.accent}30` : `${C.border}66`,
            padding: "1px 5px",
            borderRadius: 8,
          }}>
            {data.length.toLocaleString()}
          </span>
        </button>
        {SENIORITY.map(s => {
          const isSelected = selectedSeniority === s.label;
          const count = seniorityCounts[s.label] || 0;
          return (
            <button
              key={s.label}
              onClick={() => {
                setSelectedSeniority(isSelected ? "All" : s.label);
                setPage(0);
              }}
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 99,
                border: `1px solid ${isSelected ? s.color : C.border}`,
                background: isSelected ? `${s.color}20` : C.surface,
                color: isSelected ? s.color : C.textDim,
                fontWeight: isSelected ? 600 : 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s ease"
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: s.color, display: "inline-block"
              }} />
              {s.label}
              <span style={{
                fontSize: 10,
                opacity: isSelected ? 1 : 0.7,
                background: isSelected ? `${s.color}30` : `${C.border}66`,
                padding: "1px 5px",
                borderRadius: 8,
              }}>
                {count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {COLUMNS.map(col => (
                <th key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    padding: "8px 12px", textAlign: "left", fontWeight: 500,
                    whiteSpace: "nowrap", cursor: "pointer", userSelect: "none",
                    color: sortKey === col.key ? C.accent : C.textDim,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = C.text}
                  onMouseLeave={e => e.currentTarget.style.color = sortKey === col.key ? C.accent : C.textDim}
                >
                  {col.label}
                  <SortIcon dir={sortKey === col.key ? sortDir : null} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const sen = r._seniority;
              const senColor = SENIORITY.find(s => s.label === sen)?.color || C.muted;
              const isNormalized = r["Position_raw"] && r["Position_raw"] !== r["Position"];
              return (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}22`, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: "9px 12px", whiteSpace: "nowrap" }}>
                    {r["URL"] ? (
                      <a href={r["URL"]} target="_blank" rel="noopener noreferrer"
                        style={{ color: C.accent, textDecoration: "none", fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                      >
                        {r["First Name"]} {r["Last Name"]} ↗
                      </a>
                    ) : (
                      <span style={{ color: C.text }}>{r["First Name"]} {r["Last Name"]}</span>
                    )}
                  </td>
                  <td style={{ padding: "9px 12px", color: C.textDim, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r["Company"]}
                  </td>
                  <td style={{ padding: "9px 12px", maxWidth: 220 }}>
                    <div style={{ color: C.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r["Position"]}
                    </div>
                    {isNormalized && (
                      <div style={{ fontSize: 10, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                        {r["Position_raw"]}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "9px 12px", color: r["Email Address"] ? C.accent : C.muted }}>
                    {r["Email Address"] ? "✓" : "–"}
                  </td>
                  <td style={{ padding: "9px 12px", color: C.textDim, whiteSpace: "nowrap" }}>{r["Connected On"]}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 99,
                      background: `${senColor}22`, color: senColor,
                      border: `1px solid ${senColor}44`, whiteSpace: "nowrap"
                    }}>{sen}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center", alignItems: "center" }}>
          <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
            style={{ padding: "6px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, cursor: "pointer", fontSize: 12 }}>←</button>
          <span style={{ color: C.textDim, fontSize: 12 }}>Page {page+1} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages-1, p+1))} disabled={page === pages-1}
            style={{ padding: "6px 14px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, cursor: "pointer", fontSize: 12 }}>→</button>
        </div>
      )}
    </div>
  );
}
