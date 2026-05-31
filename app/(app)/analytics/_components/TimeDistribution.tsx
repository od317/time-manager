"use client";

import { TimeSummary } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Clock } from "lucide-react";

interface TimeDistributionProps {
  timeSummary: TimeSummary | null;
}

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
  "#84CC16",
];

export function TimeDistribution({ timeSummary }: TimeDistributionProps) {
  if (!timeSummary || timeSummary.totalTime === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Clock size={20} className="text-success" />
          Time Distribution
        </h3>
        <p className="text-sm text-text-muted text-center py-8">
          No time tracked yet.
        </p>
      </div>
    );
  }

  const data = [
    ...(timeSummary.byGoal || []).map((g) => ({
      name: g.title,
      value: Math.round((g.totalDuration / 3600) * 10) / 10,
      color: g.color || COLORS[0],
    })),
    ...(timeSummary.byHabit || []).map((h) => ({
      name: h.title,
      value: Math.round((h.totalDuration / 3600) * 10) / 10,
      color: h.color || COLORS[1],
    })),
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Clock size={20} className="text-success" />
          Time Distribution
        </h3>
        <p className="text-sm text-text-muted text-center py-8">
          No categorized time yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <Clock size={20} className="text-success" />
        Time Distribution
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
            }}
            formatter={(value: any) => [`${value}h`, "Time"]}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-text-secondary">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
