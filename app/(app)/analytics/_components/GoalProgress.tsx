"use client";

import { motion } from "framer-motion";
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
import { Target, TrendingUp } from "lucide-react";

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
      color: g.color || "#9FA1FF",
      status: g.status,
    }))
    .sort((a, b) => b.progress - a.progress);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary-bg">
            <Target size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text">Goal Progress</h3>
        </div>
        <div className="text-center py-10">
          <TrendingUp
            size={32}
            className="text-text-muted mx-auto mb-3 opacity-50"
          />
          <p className="text-sm text-text-muted font-medium">
            No goal data yet
          </p>
          <p className="text-xs text-text-muted mt-1">
            Start tracking goals to see progress here
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary-bg">
          <Target size={20} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold text-text">Goal Progress</h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              boxShadow: "var(--shadow-lg)",
            }}
            formatter={(value: any) => [`${value}%`, "Progress"]}
          />
          <Bar dataKey="progress" radius={[0, 6, 6, 0]}>
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
    </motion.div>
  );
}
