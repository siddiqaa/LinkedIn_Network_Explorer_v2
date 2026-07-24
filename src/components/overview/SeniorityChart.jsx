import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { C, SENIORITY } from "../../constants/theme";
import { classifySeniority } from "../../utils/seniorityClassifier";

export function SeniorityChart({ data, mlResults, useML }) {
  const chartData = useMemo(() => {
    const counts = {};
    SENIORITY.forEach(s => counts[s.label] = 0);
    data.forEach(r => {
      let s;
      const titleKey = (r["Position_raw"] || r["Position"] || "").trim();
      s = classifySeniority(titleKey, mlResults);
      counts[s] = (counts[s] || 0) + 1;
    });
    return SENIORITY.map(s => ({ name: s.label, count: counts[s.label], color: s.color }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [data, mlResults, useML]);

  const total = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 40, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={160}
          tick={{ fill: C.textDim, fontSize: 11, fontFamily: "inherit" }}
          axisLine={false} tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
          formatter={(v) => [`${v} (${((v/total)*100).toFixed(1)}%)`, "Connections"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
