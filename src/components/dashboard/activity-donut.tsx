"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ActivityDonut({
  rent,
  sold,
}: {
  rent: number;
  sold: number;
}) {
  const data = [
    { name: "Rent", value: rent || 1 },
    { name: "Sold", value: sold || 1 },
  ];
  const colors = ["var(--primary)", "var(--chart-3)"];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs text-muted-foreground">Total</p>
        <p className="text-lg font-semibold">{rent + sold}</p>
      </div>
    </div>
  );
}
