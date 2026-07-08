"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

export function RentChart({
  data,
}: {
  data: { day: string; rent: number }[];
}) {
  const max = Math.max(...data.map((d) => d.rent), 1);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          stroke="var(--muted-foreground)"
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            fontSize: "0.75rem",
          }}
        />
        <Bar dataKey="rent" radius={[8, 8, 8, 8]} maxBarSize={22}>
          {data.map((d, i) => (
            <Cell
              key={i}
              fill={d.rent === max ? "var(--primary)" : "var(--primary)"}
              opacity={d.rent === max ? 1 : 0.25}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
