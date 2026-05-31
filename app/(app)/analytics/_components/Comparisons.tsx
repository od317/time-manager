"use client";

import { Goal, Habit } from "@/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonsProps {
  goals: Goal[];
  habits: Habit[];
}

export function Comparisons({ goals, habits }: ComparisonsProps) {
  const now = new Date();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

  // Goals completed this month vs last month
  const goalsThisMonth = goals.filter((g) => {
    if (g.status !== "COMPLETED" || !g.completedAt) return false;
    return new Date(g.completedAt).getMonth() === thisMonth;
  }).length;

  const goalsLastMonth = goals.filter((g) => {
    if (g.status !== "COMPLETED" || !g.completedAt) return false;
    return new Date(g.completedAt).getMonth() === lastMonth;
  }).length;

  // Habit streaks - current vs average
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

  // Time tracked comparison
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
    },
    {
      label: "Avg Habit Streak",
      current: avgCurrentStreak,
      previous: avgLongestStreak,
      unit: "days",
      icon: avgCurrentStreak >= avgLongestStreak / 2 ? TrendingUp : Minus,
      color: "text-primary",
    },
    {
      label: "Total Habit Completions",
      current: totalCompletions,
      previous: 0,
      unit: "all time",
      icon: TrendingUp,
      color: "text-success",
    },
  ];

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Comparisons</h3>
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
            <div key={comp.label} className="bg-bg rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">{comp.label}</p>
                <Icon size={18} className={comp.color} />
              </div>
              <p className="text-2xl font-bold text-text">{comp.current}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-text-muted">{comp.unit}</p>
                {change !== null && (
                  <span
                    className={`text-xs font-medium ${change >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
