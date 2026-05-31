"use client";

import { Goal, Habit } from "@/types";
import { TrendingUp } from "lucide-react";
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
  // Most active days based on habit completion
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
      (g) => g.priority === "URGENT" && g.status === "ACTIVE",
    ).length,
    HIGH: goals.filter((g) => g.priority === "HIGH" && g.status === "ACTIVE")
      .length,
    MEDIUM: goals.filter(
      (g) => g.priority === "MEDIUM" && g.status === "ACTIVE",
    ).length,
    LOW: goals.filter((g) => g.priority === "LOW" && g.status === "ACTIVE")
      .length,
  };

  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const completedThisWeek = goals.filter((g) => {
    if (g.status !== "COMPLETED" || !g.completedAt) return false;
    return new Date(g.completedAt).getTime() > weekAgo;
  }).length;

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-warning" />
        Productivity Patterns
      </h3>

      <div className="space-y-6">
        {/* Most Active Days */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">
            Habit Load by Day
          </p>
          <div className="flex items-end gap-1 h-24">
            {dayActivity.map(({ day, count }) => (
              <div
                key={day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-primary rounded-t-md transition-all"
                  style={{
                    height: `${(count / maxCount) * 100}%`,
                    minHeight: count > 0 ? "4px" : "0",
                  }}
                />
                <span className="text-xs text-text-muted">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-3">
            Priority Distribution
          </p>
          <div className="space-y-2">
            {Object.entries(priorityDist).map(([priority, count]) => (
              <div key={priority} className="flex items-center gap-2">
                <span
                  className={`text-xs w-16 font-medium ${
                    priority === "URGENT"
                      ? "text-danger"
                      : priority === "HIGH"
                        ? "text-warning"
                        : priority === "MEDIUM"
                          ? "text-primary"
                          : "text-text-muted"
                  }`}
                >
                  {priority}
                </span>
                <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      priority === "URGENT"
                        ? "bg-danger"
                        : priority === "HIGH"
                          ? "bg-warning"
                          : priority === "MEDIUM"
                            ? "bg-primary"
                            : "bg-border"
                    }`}
                    style={{
                      width: `${goals.length > 0 ? (count / goals.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-text-muted w-6 text-right">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Wins */}
        <div className="bg-success-bg/20 rounded-lg p-4">
          <p className="text-sm font-medium text-success mb-1">This Week</p>
          <p className="text-2xl font-bold text-success">{completedThisWeek}</p>
          <p className="text-xs text-text-muted">goals completed</p>
        </div>
      </div>
    </div>
  );
}
