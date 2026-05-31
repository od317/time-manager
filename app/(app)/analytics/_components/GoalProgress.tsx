"use client";

import { Goal } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Target } from "lucide-react";

interface GoalProgressProps {
  goals: Goal[];
}

export function GoalProgress({ goals }: GoalProgressProps) {
  const data = goals
    .filter((g) => g.progress > 0 || g.status === "COMPLETED")
    .slice(0, 10)
    .map((g) => ({
      name: g.title.length > 20 ? g.title.slice(0, 20) + "..." : g.title,
      progress: Math.round(g.progress),
      color: g.color || "#6366F1",
      status: g.status,
    }))
    .sort((a, b) => b.progress - a.progress);

  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Target size={20} className="text-primary" />
          Goal Progress
        </h3>
        <p className="text-sm text-text-muted text-center py-8">
          No goal data yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <Target size={20} className="text-primary" />
        Goal Progress
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "#94A3B8" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 12, fill: "#64748B" }}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
            }}
            formatter={(value: any) => [`${value}h`, "Time"]}
          />
          <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color}
                opacity={entry.status === "COMPLETED" ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
