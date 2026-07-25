import { C } from "../../constants/theme";

export function Section({ title, children }) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 24,
      marginBottom: 20,
      boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.25)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 2,
        color: C.textDim,
        textTransform: "uppercase",
        marginBottom: 20
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent, display: "inline-block" }} />
        {title}
      </div>
      {children}
    </div>
  );
}

