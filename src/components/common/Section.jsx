import { C } from "../../constants/theme";

export function Section({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: C.textDim, textTransform: "uppercase", marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  );
}
