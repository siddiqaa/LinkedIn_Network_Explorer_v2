import { C } from "../../constants/theme";

export function StatCard({ label, value, sub, accent }) {
  const accentColor = accent || C.accent;
  return (
    <div style={{
      background: `linear-gradient(180deg, ${C.card} 0%, ${C.surface} 100%)`,
      border: `1px solid ${C.border}`,
      borderTop: `2px solid ${accentColor}`,
      borderRadius: 12,
      padding: "20px 24px", flex: 1, minWidth: 160,
      boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.3)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      position: "relative",
      overflow: "hidden"
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 25px -4px ${accentColor}25, 0 4px 20px -2px rgba(0, 0, 0, 0.4)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 20px -2px rgba(0, 0, 0, 0.3)";
      }}
    >
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: `${accentColor}12`, blur: "20px", pointerEvents: "none"
      }} />
      <div style={{ fontSize: 28, fontWeight: 700, color: accentColor, fontFamily: "'DM Mono', monospace", letterSpacing: -1, relative: "z-10" }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textDim, marginTop: 4, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

