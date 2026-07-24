import { C } from "../../constants/theme";

export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "20px 24px", flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || C.accent, fontFamily: "'DM Mono', monospace", letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
