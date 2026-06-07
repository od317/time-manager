"use client";

import { motion } from "framer-motion";
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
  "#9FA1FF",
  "#B5BAFF",
  "#AEE2FF",
  "#D9F9DF",
  "#FFD4C2",
  "#FFE0C5",
  "#C5ECFF",
  "#E8FCEB",
];

export function TimeDistribution({ timeSummary }: TimeDistributionProps) {
  if (!timeSummary || timeSummary.totalTime.seconds === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-success-bg">
            <Clock size={20} className="text-success" />
          </div>
          <h3 className="text-lg font-bold text-text">Time Distribution</h3>
        </div>
        <div className="text-center py-10">
          <Clock
            size={32}
            className="text-text-muted mx-auto mb-3 opacity-50"
          />
          <p className="text-sm text-text-muted font-medium">
            No time tracked yet
          </p>
          <p className="text-xs text-text-muted mt-1">
            Start tracking time to see distribution
          </p>
        </div>
      </motion.div>
    );
  }

  const data = [
    ...(timeSummary.byGoal || []).map((g) => ({
      name: g.title,
      value: g.totalDurationHours,
      color: g.color || COLORS[0],
      percentage: g.percentage,
    })),
    ...(timeSummary.byHabit || []).map((h) => ({
      name: h.title,
      value: h.totalDurationHours,
      color: h.color || COLORS[1],
      percentage: h.percentage,
    })),
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-success-bg">
            <Clock size={20} className="text-success" />
          </div>
          <h3 className="text-lg font-bold text-text">Time Distribution</h3>
        </div>
        <p className="text-sm text-text-muted text-center py-8">
          No categorized time yet.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-success-bg">
          <Clock size={20} className="text-success" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">Time Distribution</h3>
          <p className="text-xs text-text-muted">
            {timeSummary.totalTime.formatted.short} total
          </p>
        </div>
      </div>
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
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-lg)",
            }}
            formatter={(value: any) => [`${value}h`, "Time"]}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs font-medium text-text-secondary">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
