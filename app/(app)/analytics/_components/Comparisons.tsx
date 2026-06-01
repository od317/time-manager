"use client";

import { motion } from "framer-motion";
import { Goal, Habit } from "@/types";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

interface ComparisonsProps {
  goals: Goal[];
  habits: Habit[];
}

export function Comparisons({ goals, habits }: ComparisonsProps) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

  const goalsThisMonth = goals.filter((g) => {
    if (g.status !== "COMPLETED" || !g.completedAt) return false;
    return new Date(g.completedAt).getMonth() === thisMonth;
  }).length;

  const goalsLastMonth = goals.filter((g) => {
    if (g.status !== "COMPLETED" || !g.completedAt) return false;
    return new Date(g.completedAt).getMonth() === lastMonth;
  }).length;

  const activeHabits = habits.filter((h) => h.status === "ACTIVE");
  const avgCurrentStreak =
    activeHabits.length > 0
      ? Math.round(
          activeHabits.reduce((sum, h) => sum + h.currentStreak, 0) /
            activeHabits.length,
        )
      : 0;
  const avgLongestStreak =
    activeHabits.length > 0
      ? Math.round(
          activeHabits.reduce((sum, h) => sum + h.longestStreak, 0) /
            activeHabits.length,
        )
      : 0;

  const totalCompletions = habits.reduce(
    (sum, h) => sum + h.totalCompletions,
    0,
  );

  const comparisons = [
    {
      label: "Goals Completed",
      current: goalsThisMonth,
      previous: goalsLastMonth,
      unit: "this month",
      icon:
        goalsThisMonth >= goalsLastMonth
          ? TrendingUp
          : goalsThisMonth > 0
            ? TrendingDown
            : Minus,
      color: goalsThisMonth >= goalsLastMonth ? "text-success" : "text-danger",
      bg: goalsThisMonth >= goalsLastMonth ? "bg-success-bg" : "bg-danger-bg",
    },
    {
      label: "Avg Habit Streak",
      current: avgCurrentStreak,
      previous: avgLongestStreak,
      unit: "days",
      icon: avgCurrentStreak >= avgLongestStreak / 2 ? TrendingUp : Minus,
      color: "text-primary",
      bg: "bg-primary-bg",
    },
    {
      label: "Total Habit Completions",
      current: totalCompletions,
      previous: 0,
      unit: "all time",
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success-bg",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-info-bg">
          <BarChart3 size={20} className="text-info" />
        </div>
        <h3 className="text-lg font-bold text-text">Comparisons</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisons.map((comp) => {
          const Icon = comp.icon;
          const change =
            comp.previous > 0
              ? Math.round(
                  ((comp.current - comp.previous) / comp.previous) * 100,
                )
              : null;

          return (
            <motion.div
              key={comp.label}
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-bg rounded-2xl p-5 border border-border hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-text-secondary">
                  {comp.label}
                </p>
                <div className={`p-1.5 rounded-lg ${comp.bg}`}>
                  <Icon size={16} className={comp.color} />
                </div>
              </div>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="text-3xl font-bold text-text"
              >
                {comp.current}
              </motion.p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-text-muted">{comp.unit}</p>
                {change !== null && (
                  <span
                    className={`text-xs font-bold ${
                      change >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change}%
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
