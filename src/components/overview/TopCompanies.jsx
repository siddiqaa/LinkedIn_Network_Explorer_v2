import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { C } from "../../constants/theme";

export function TopCompanies({ data }) {
  const chartData = useMemo(() => {
    const counts = {};
    data.forEach(r => {
      const c = (r["Company"] || "").trim();
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name, count]) => ({ name, count }));
  }, [data]);

  const height = chartData.length * 36;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 48, top: 4, bottom: 4 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={140}
          tick={{ fill: C.textDim, fontSize: 11, fontFamily: "inherit" }}
          axisLine={false} tickLine={false} interval={0}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
          formatter={(v) => [v, "Connections"]}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22} fill={C.accent2} />
      </BarChart>
    </ResponsiveContainer>
  );
}
