import { useState, useMemo } from "react";
import { C, SENIORITY } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";

export function JobSearch({ data, mlResults }) {
  // Derive sorted unique company list from connections
  const companies = useMemo(() => {
    const set = new Set(
      (data || []).map(r => (r["Company"] || "").trim()).filter(Boolean)
    );
    return ["", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [data]);

  const [company, setCompany]   = useState("");
  const [keywords, setKeywords] = useState("");
  const [location, setLocation] = useState("");
  const [history, setHistory]   = useState([]);
  const [contactQuery, setContactQuery] = useState("");

  const topCompanies = useMemo(() => {
    const counts = {};
    (data || []).forEach(r => {
      const c = (r["Company"] || "").trim();
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 20);
  }, [data]);

  const companyContacts = useMemo(() => {
    if (!company.trim()) return [];
    const target = company.trim().toLowerCase();
    return (data || []).filter(r => (r["Company"] || "").trim().toLowerCase() === target);
  }, [data, company]);

  const canSearch = company.trim() || keywords.trim();

  function buildUrl() {
    const parts = [keywords.trim(), company.trim() ? `at ${company.trim()}` : "", location.trim()].filter(Boolean);
    const q = encodeURIComponent(parts.join(" "));
    return `https://www.google.com/search?q=${q}&ibp=htl;jobs`;
  }

  function handleSearch() {
    if (!canSearch) return;
    const url = buildUrl();
    const entry = {
      id: Date.now(),
      company: company || "Any company",
      keywords: keywords || "Any role",
      location: location || "Anywhere",
      url,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory(h => [entry, ...h].slice(0, 10));
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSearch();
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 8, color: C.text, fontSize: 13,
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    fontSize: 11, color: C.textDim, fontWeight: 600,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "block",
  };

  return (
    <div>
      {/* Search card */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 24 }}>
          Google Jobs Search
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Company picker */}
          <div>
            <label style={labelStyle}>Company</label>
            <select
              value={company}
              onChange={e => { setCompany(e.target.value); setContactQuery(""); }}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="" style={{ background: C.card, color: C.text }}>Any company</option>
              {companies.filter(Boolean).map(c => (
                <option key={c} value={c} style={{ background: C.card, color: C.text }}>{c}</option>
              ))}
            </select>
            {company && (
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>
                {companyContacts.length} {companyContacts.length === 1 ? "connection" : "connections"} here
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label style={labelStyle}>Role / Keywords</label>
            <input
              value={keywords}
              onChange={e => setKeywords(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Senior Product Manager"
              style={inputStyle}
            />
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location (optional)</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. London, Remote"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Preview + button row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            style={{
              padding: "10px 28px", background: canSearch ? C.accent : C.muted,
              border: "none", borderRadius: 8, color: '#ffffff',
              fontSize: 13, fontWeight: 700, cursor: canSearch ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "background 0.15s", whiteSpace: "nowrap",
            }}
          >
            Search Google Jobs ↗
          </button>

          {canSearch && (
            <div style={{
              flex: 1, fontSize: 11, color: C.textDim, fontFamily: "'DM Mono', monospace",
              background: C.surface, padding: "8px 12px", borderRadius: 6,
              border: `1px solid ${C.border}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {[keywords, company ? `at ${company}` : "", location].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: C.muted, marginTop: 16 }}>
          Opens Google Jobs in a new tab. Results are live — no API key required.
        </div>
      </div>

      {/* Selected Company Contacts Card */}
      {company.trim() ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textDim, textTransform: "uppercase" }}>
                Contacts at {company}
              </div>
              <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                {companyContacts.length} {companyContacts.length === 1 ? "connection" : "connections"} in your network
              </div>
            </div>
            {companyContacts.length > 3 && (
              <input
                value={contactQuery}
                onChange={e => setContactQuery(e.target.value)}
                placeholder="Filter contacts at this company..."
                style={{
                  padding: "6px 12px", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 6, color: C.text, fontSize: 12, outline: "none", fontFamily: "inherit",
                  minWidth: 200,
                }}
              />
            )}
          </div>

          {companyContacts.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.textDim, fontSize: 13, background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` }}>
              No connections found at <strong style={{ color: C.text }}>{company}</strong> in your dataset.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left" }}>
                    <th style={{ padding: "8px 12px", color: C.textDim, fontWeight: 500 }}>Name</th>
                    <th style={{ padding: "8px 12px", color: C.textDim, fontWeight: 500 }}>Position / Title</th>
                    <th style={{ padding: "8px 12px", color: C.textDim, fontWeight: 500 }}>Seniority</th>
                    <th style={{ padding: "8px 12px", color: C.textDim, fontWeight: 500 }}>Connected</th>
                    <th style={{ padding: "8px 12px", color: C.textDim, fontWeight: 500, textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {companyContacts
                    .filter(r => {
                      if (!contactQuery.trim()) return true;
                      const q = contactQuery.toLowerCase();
                      return `${r["First Name"]} ${r["Last Name"]} ${r["Position"]} ${r["Email Address"]}`.toLowerCase().includes(q);
                    })
                    .map((r, i) => {
                      const sen = classifySeniority(r["Position_raw"] || r["Position"], mlResults);
                      const senColor = SENIORITY.find(s => s.label === sen)?.color || C.muted;
                      const fullName = `${r["First Name"]} ${r["Last Name"]}`.trim();
                      const linkedinUrl = r["URL"] || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(fullName + " " + company)}`;

                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}33`, transition: "background 0.1s" }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: "10px 12px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>
                            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                              style={{ color: C.accent, textDecoration: "none" }}
                              onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                              onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                            >
                              {fullName || "Unknown"} ↗
                            </a>
                            {r["Email Address"] && (
                              <div style={{ fontSize: 10, color: C.textDim, fontWeight: 400, marginTop: 2 }}>
                                {r["Email Address"]}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "10px 12px", color: C.textDim }}>
                            {r["Position"] || "—"}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span style={{
                              fontSize: 10, padding: "2px 8px", borderRadius: 99,
                              background: `${senColor}22`, color: senColor,
                              border: `1px solid ${senColor}44`, whiteSpace: "nowrap"
                            }}>{sen}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: C.muted, whiteSpace: "nowrap" }}>
                            {r["Connected On"] || "—"}
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                            <a href={linkedinUrl} target="_blank" rel="noopener noreferrer"
                              style={{
                                padding: "4px 10px", background: C.surface, border: `1px solid ${C.border}`,
                                borderRadius: 6, color: C.text, fontSize: 11, textDecoration: "none",
                                display: "inline-block", transition: "border-color 0.15s"
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                            >
                              LinkedIn Profile ↗
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.textDim }}>
            💡 Select a company from the dropdown or click a quick search company pill below to view your connections at that company.
          </div>
        </div>
      )}

      {/* Quick searches from top companies */}
      {data && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 16 }}>
            Quick Search — Top Companies
          </div>
          <div style={{ fontSize: 12, color: C.textDim, marginBottom: 16 }}>
            Click any company to pre-fill the search above, or shift-click to open Google Jobs directly.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topCompanies.map(([co, count]) => (
              <button
                key={co}
                onClick={e => {
                  if (e.shiftKey) {
                    const q = encodeURIComponent(`${keywords || ""} at ${co}`.trim());
                    window.open(`https://www.google.com/search?q=${q}&ibp=htl;jobs`, "_blank", "noopener,noreferrer");
                  } else {
                    setCompany(co);
                  }
                }}
                title={`${count} connections · Click to select · Shift+click to search`}
                style={{
                  padding: "6px 14px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: 99,
                  color: C.text, fontSize: 12, cursor: "pointer",
                  fontFamily: "inherit", transition: "border-color 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                {co}
                <span style={{ fontSize: 10, color: C.textDim, fontFamily: "'DM Mono', monospace" }}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent searches */}
      {history.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 16 }}>
            Recent Searches
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map(h => (
              <div key={h.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 8,
              }}>
                <span style={{ fontSize: 10, color: C.muted, fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>{h.time}</span>
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>
                  <span style={{ color: C.accent2 }}>{h.keywords}</span>
                  {h.company !== "Any company" && <span style={{ color: C.textDim }}> at {h.company}</span>}
                  {h.location !== "Anywhere" && <span style={{ color: C.textDim }}> · {h.location}</span>}
                </span>
                <a href={h.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: C.accent, textDecoration: "none", whiteSpace: "nowrap" }}>
                  Open again ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
