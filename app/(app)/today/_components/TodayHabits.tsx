"use client";

import { useState } from "react";
import { Habit } from "@/types";
import { Check, MoreHorizontal } from "lucide-react";
import { habitService } from "@/lib/services";

interface TodayHabitsProps {
  habits: Habit[];
}

export function TodayHabits({ habits }: TodayHabitsProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleComplete = async (habit: Habit) => {
    if (completedIds.has(habit.id) || loadingId) return;

    setLoadingId(habit.id);
    try {
      await habitService.log(habit.id, {
        value: habit.trackAmount ? (habit.targetValue ?? undefined) : undefined,
      });
      setCompletedIds((prev) => new Set([...prev, habit.id]));
    } catch {
      // Show error? For now, silently fail and let user retry
    } finally {
      setLoadingId(null);
    }
  };

  if (habits.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Today&apos;s Habits
        </h3>
        <p className="text-text-muted text-sm text-center py-8">
          No habits scheduled for today. Create one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Today&apos;s Habits</h3>
        <span className="text-sm text-text-muted">
          {completedIds.size}/{habits.length}
        </span>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => {
          const isCompleted = completedIds.has(habit.id);
          const isLoading = loadingId === habit.id;

          return (
            <button
              key={habit.id}
              onClick={() => handleComplete(habit)}
              disabled={isCompleted || isLoading !== null}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isCompleted
                  ? "bg-success-bg border-success/20"
                  : "bg-bg border-border hover:border-primary/30"
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? "bg-success border-success text-white"
                    : "border-border"
                }`}
              >
                {isCompleted && <Check size={12} />}
                {isLoading && !isCompleted && (
                  <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isCompleted ? "text-success line-through" : "text-text"
                  }`}
                >
                  {habit.title}
                </p>
                {habit.trackAmount && habit.targetValue && (
                  <p className="text-xs text-text-muted mt-0.5">
                    Target: {habit.targetValue} {habit.unit || ""}
                  </p>
                )}
              </div>

              {/* Streak */}
              {habit.currentStreak > 0 && (
                <span className="text-xs font-medium text-warning flex items-center gap-1">
                  🔥 {habit.currentStreak}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
