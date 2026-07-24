// ── Palette & Theme Constants ───────────────────────────────────────────────
export const C = {
  bg: "#f8f9fb",
  surface: "#ffffff",
  card: "#ffffff",
  border: "#e2e6ed",
  accent: "#0a7c5c",       // deep teal
  accent2: "#4f46e5",      // indigo
  accent3: "#db2777",      // pink
  muted: "#9ca3af",
  text: "#111827",
  textDim: "#6b7280",
};

// ── Seniority definitions & colors ─────────────────────────────────────────
export const SENIORITY = [
  { label: "C-Suite / Founder", color: C.accent },
  { label: "VP / Director",     color: C.accent2 },
  { label: "Manager / Lead",    color: "#a78bfa" },
  { label: "Senior / Mid",      color: "#60a5fa" },
  { label: "Junior / Associate",color: "#34d399" },
  { label: "Unknown / Other",   color: C.muted },
];
