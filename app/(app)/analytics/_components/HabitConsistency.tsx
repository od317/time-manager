"use client";

import { Habit } from "@/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Repeat } from "lucide-react";

interface HabitConsistencyProps {
  habits: Habit[];
}

export function HabitConsistency({ habits }: HabitConsistencyProps) {
  const activeHabits = habits.filter((h) => h.status === "ACTIVE");

  const data = activeHabits
    .map((h) => ({
      name: h.title.length > 15 ? h.title.slice(0, 15) + "..." : h.title,
      streak: h.currentStreak,
      longest: h.longestStreak,
      total: h.totalCompletions,
      color: h.color || "#8B5CF6",
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <Repeat size={20} className="text-purple-500" />
          Habit Consistency
        </h3>
        <p className="text-sm text-text-muted text-center py-8">
          No active habits yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <Repeat size={20} className="text-purple-500" />
        Habit Consistency
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#94A3B8" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
            }}
          />
          <Bar
            dataKey="streak"
            name="Current Streak"
            fill="#8B5CF6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="longest"
            name="Longest Streak"
            fill="#C4B5FD"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" /> Current Streak
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-300" /> Longest Streak
        </div>
      </div>
    </div>
  );
}
