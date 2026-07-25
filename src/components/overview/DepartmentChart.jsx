import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { C } from "../../constants/theme";
import { DEPARTMENT_CATEGORIES } from "../../data/departmentMap";
import { classifyDepartment } from "../../utils/departmentClassifier";

const DEPT_COLORS = {
  "Engineering & Technology": "#3b82f6",
  "Product & Design": "#a855f7",
  "Sales & Business Development": "#10b981",
  "Marketing & Communications": "#f59e0b",
  "Finance & Accounting": "#06b6d4",
  "People, HR & Recruiting": "#ec4899",
  "Operations & Logistics": "#8b5cf6",
  "Legal, Risk & Compliance": "#ef4444",
  "Customer Success & Support": "#14b8a6",
  "Executive & General Management": "#f97316",
  "Consulting & Advisory": "#6366f1",
  "Other / Unknown": "#6b7280"
};

export function DepartmentChart({ data, mlResults }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const counts = {};
    DEPARTMENT_CATEGORIES.forEach(d => counts[d] = 0);

    data.forEach(r => {
      const titleKey = (r["Position_raw"] || r["Position"] || "").trim();
      const dept = classifyDepartment(titleKey, mlResults);
      counts[dept] = (counts[dept] || 0) + 1;
    });

    return DEPARTMENT_CATEGORIES.map(dept => ({
      name: dept,
      count: counts[dept] || 0,
      color: DEPT_COLORS[dept] || "#6b7280"
    }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [data, mlResults]);

  const total = chartData.reduce((s, d) => s + d.count, 0);

  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 28)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 40, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={200}
          tick={{ fill: C.textDim, fontSize: 11, fontFamily: "inherit" }}
          axisLine={false} tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
          formatter={(v) => [`${v} (${total ? ((v/total)*100).toFixed(1) : 0}%)`, "Connections"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
