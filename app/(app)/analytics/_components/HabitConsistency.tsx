"use client";

import { motion } from "framer-motion";
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
      color: h.color || "#B5BAFF",
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-secondary-bg">
            <Repeat size={20} className="text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-text">Habit Consistency</h3>
        </div>
        <div className="text-center py-10">
          <Repeat
            size={32}
            className="text-text-muted mx-auto mb-3 opacity-50"
          />
          <p className="text-sm text-text-muted font-medium">
            No active habits yet
          </p>
          <p className="text-xs text-text-muted mt-1">
            Build habits to see consistency data
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-secondary-bg">
          <Repeat size={20} className="text-secondary" />
        </div>
        <h3 className="text-lg font-bold text-text">Habit Consistency</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-lg)",
            }}
          />
          <Bar
            dataKey="streak"
            name="Current Streak"
            fill="var(--color-secondary)"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="longest"
            name="Longest Streak"
            fill="var(--color-secondary-light)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-secondary" /> Current Streak
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-secondary/40" /> Longest Streak
        </div>
      </div>
    </motion.div>
  );
}
