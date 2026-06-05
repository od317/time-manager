"use client";

import { motion } from "framer-motion";
import { Goal, Habit } from "@/types";
import { TrendingUp, Target, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface ProductivityPatternsProps {
  goals: Goal[];
  habits: Habit[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ProductivityPatterns({
  goals,
  habits,
}: ProductivityPatternsProps) {
  const [now] = useState(() => Date.now());

  const dayActivity = DAYS.map((day, index) => {
    const habitsOnDay = habits.filter((h) => {
      if (h.frequencyType === "DAILY") return true;
      return h.frequencyDays.includes(index);
    });
    return { day, count: habitsOnDay.length };
  });

  const maxCount = Math.max(...dayActivity.map((d) => d.count), 1);

  const priorityDist = {
    URGENT: goals.filter(
      (g) =>
        g.priority === "URGENT" &&
        (g.status === "ACTIVE" || g.status === "OVERDUE"),
    ).length,
    HIGH: goals.filter(
      (g) =>
        g.priority === "HIGH" &&
        (g.status === "ACTIVE" || g.status === "OVERDUE"),
    ).length,
    MEDIUM: goals.filter(
      (g) =>
        g.priority === "MEDIUM" &&
        (g.status === "ACTIVE" || g.status === "OVERDUE"),
    ).length,
    LOW: goals.filter(
      (g) =>
        g.priority === "LOW" &&
        (g.status === "ACTIVE" || g.status === "OVERDUE"),
    ).length,
  };

  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const completedThisWeek = goals.filter((g) => {
    if (g.status !== "COMPLETED" || !g.completedAt) return false;
    return new Date(g.completedAt).getTime() > weekAgo;
  }).length;

  const priorityConfig = {
    URGENT: {
      color: "bg-danger",
      textColor: "text-danger",
      bg: "bg-danger-bg",
    },
    HIGH: {
      color: "bg-warning",
      textColor: "text-warning",
      bg: "bg-warning-bg",
    },
    MEDIUM: {
      color: "bg-primary",
      textColor: "text-primary",
      bg: "bg-primary-bg",
    },
    LOW: { color: "bg-border", textColor: "text-text-muted", bg: "bg-bg" },
  };
  const overdueGoals = goals.filter((g) => g.status === "OVERDUE");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-warning-bg">
          <TrendingUp size={20} className="text-warning" />
        </div>
        <h3 className="text-lg font-bold text-text">Productivity Patterns</h3>
      </div>

      <div className="space-y-6">
        {/* Most Active Days */}
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-4">
            Habit Load by Day
          </p>
          <div className="flex items-end gap-1.5 h-28">
            {dayActivity.map(({ day, count }) => {
              const heightPercent = (count / maxCount) * 100;
              const isHighest = count === maxCount && count > 0;
              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`w-full rounded-t-lg transition-all ${
                      isHighest ? "bg-primary" : "bg-primary/40"
                    }`}
                    style={{ minHeight: count > 0 ? "4px" : "0" }}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isHighest ? "text-primary" : "text-text-muted"
                    }`}
                  >
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div>
          <p className="text-sm font-semibold text-text-secondary mb-4">
            Priority Distribution
          </p>
          <div className="space-y-3">
            {(
              Object.entries(priorityDist) as [
                keyof typeof priorityConfig,
                number,
              ][]
            ).map(([priority, count]) => {
              const config = priorityConfig[priority];
              const percent =
                goals.length > 0 ? (count / goals.length) * 100 : 0;
              return (
                <div key={priority} className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold w-16 ${config.textColor}`}
                  >
                    {priority}
                  </span>
                  <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full ${config.color}`}
                    />
                  </div>
                  <span className="text-xs font-bold text-text-muted w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add this after the priority distribution div */}
        {overdueGoals.length > 0 && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-amber-50 dark:bg-amber-950 rounded-xl p-5 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <p className="text-sm font-bold text-amber-500">Overdue</p>
            </div>
            <p className="text-3xl font-bold text-amber-500">
              {overdueGoals.length}
            </p>
            <p className="text-xs text-amber-500/70 mt-1 font-medium">
              goals past their deadline
            </p>
          </motion.div>
        )}

        {/* Weekly Wins */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-success-bg to-success-bg/50 rounded-xl p-5 border border-success/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-success" />
            <p className="text-sm font-bold text-success">This Week</p>
          </div>
          <p className="text-3xl font-bold text-success">{completedThisWeek}</p>
          <p className="text-xs text-success/70 mt-1 font-medium">
            goals completed
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
