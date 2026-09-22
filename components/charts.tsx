"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { RISK_LEVEL_COLORS } from "@/lib/utils";
import type { RiskLevel } from "@/lib/types";

export function RiskTrendChart({
  data,
}: {
  data: { month: string; score: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis domain={[50, 80]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
          formatter={(value) => [`${value} / 100`, "Risk score"]}
        />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={{ r: 3, fill: "#6366f1" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RiskDonut({
  counts,
}: {
  counts: Record<RiskLevel, number>;
}) {
  const data = (["Critical", "High", "Medium", "Low"] as RiskLevel[]).map(
    (level) => ({ name: level, value: counts[level] }),
  );
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={RISK_LEVEL_COLORS[entry.name as RiskLevel]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">open risks</span>
        </div>
      </div>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: RISK_LEVEL_COLORS[d.name as RiskLevel] }}
            />
            <span className="w-16 text-slate-600">{d.name}</span>
            <span className="font-semibold text-slate-900">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
