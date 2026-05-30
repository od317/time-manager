"use client";

import { useState, useCallback } from "react";
import { Habit } from "@/types";
import { habitService } from "@/lib/services";
import { Check, AlertCircle, Wifi, Clock } from "lucide-react";

interface TodayHabitsProps {
  habits: Habit[];
}

type HabitState = {
  loading: string | null; // habit id that's loading
  completed: Set<string>; // habit ids that are completed
  errors: Map<string, string>; // habit id -> error message
  successIds: Set<string>; // just completed (for animation)
};

export function TodayHabits({ habits }: TodayHabitsProps) {
  const [state, setState] = useState<HabitState>({
    loading: null,
    completed: new Set(),
    errors: new Map(),
    successIds: new Set(),
  });

  const isCompleted = useCallback(
    (habit: Habit): boolean => {
      if (state.completed.has(habit.id)) return true;
      const todayLog = habit.logs?.[0];
      return todayLog?.status === "COMPLETED";
    },
    [state.completed],
  );

  const handleComplete = async (habit: Habit) => {
    if (isCompleted(habit) || state.loading) return;

    const habitId = habit.id;

    // Clear previous error for this habit
    setState((prev) => {
      const newErrors = new Map(prev.errors);
      newErrors.delete(habitId);
      return { ...prev, loading: habitId, errors: newErrors };
    });

    try {
      await habitService.log(habitId, {
        value: habit.trackAmount ? (habit.targetValue ?? undefined) : undefined,
      });

      // Success
      setState((prev) => {
        const newCompleted = new Set(prev.completed);
        newCompleted.add(habitId);
        const newSuccess = new Set(prev.successIds);
        newSuccess.add(habitId);

        // Remove success animation after 2 seconds
        setTimeout(() => {
          setState((current) => {
            const updated = new Set(current.successIds);
            updated.delete(habitId);
            return { ...current, successIds: updated };
          });
        }, 2000);

        return {
          ...prev,
          loading: null,
          completed: newCompleted,
          successIds: newSuccess,
        };
      });
    } catch (err: any) {
      // Determine error type and message
      let errorMessage = "Failed to complete";

      if (err?.code === "NETWORK_ERROR") {
        errorMessage = "No internet connection";
      } else if (err?.code === "TIMEOUT") {
        errorMessage = "Request timed out. Try again.";
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setState((prev) => {
        const newErrors = new Map(prev.errors);
        newErrors.set(habitId, errorMessage);

        // Auto-clear error after 5 seconds
        setTimeout(() => {
          setState((current) => {
            const updated = new Map(current.errors);
            updated.delete(habitId);
            return { ...current, errors: updated };
          });
        }, 5000);

        return { ...prev, loading: null, errors: newErrors };
      });
    }
  };

  const handleRetry = (habit: Habit) => {
    // Clear error and retry
    setState((prev) => {
      const newErrors = new Map(prev.errors);
      newErrors.delete(habit.id);
      return { ...prev, errors: newErrors };
    });
    handleComplete(habit);
  };

  // Count completed habits (including those from backend)
  const completedCount = habits.filter((h) => isCompleted(h)).length;

  if (habits.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Today&apos;s Habits
        </h3>
        <p className="text-text-muted text-sm text-center py-8">
          No habits scheduled for today.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Today&apos;s Habits</h3>
        <span className="text-sm text-text-muted">
          {completedCount}/{habits.length}
        </span>
      </div>

      <div className="space-y-2">
        {habits.map((habit) => {
          const completed = isCompleted(habit);
          const isLoading = state.loading === habit.id;
          const error = state.errors.get(habit.id);
          const justCompleted = state.successIds.has(habit.id);
          const isDisabled = isLoading || completed;

          return (
            <div key={habit.id}>
              {/* Habit button */}
              <button
                onClick={() => handleComplete(habit)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  error
                    ? "bg-danger-bg/20 border-danger/30"
                    : justCompleted
                      ? "bg-success-bg border-success/30 animate-pulse"
                      : completed
                        ? "bg-success-bg/20 border-success/10"
                        : "bg-bg border-border hover:border-primary/30"
                } ${isDisabled && !error ? "cursor-default" : "cursor-pointer"}`}
              >
                {/* Checkbox / Status Icon */}
                <div className="flex-shrink-0">
                  {error ? (
                    <AlertCircle size={20} className="text-danger" />
                  ) : isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        completed
                          ? "bg-success border-success text-white"
                          : "border-border"
                      }`}
                    >
                      {completed && <Check size={12} />}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 text-left min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      completed ? "text-success line-through" : "text-text"
                    }`}
                  >
                    {habit.title}
                  </p>
                  {habit.trackAmount && habit.targetValue && (
                    <p className="text-xs text-text-muted mt-0.5">
                      Target: {habit.targetValue} {habit.unit || ""}
                    </p>
                  )}
                  {error && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-danger">{error}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRetry(habit);
                        }}
                        className="text-xs font-medium text-primary hover:text-primary-dark"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>

                {/* Streak */}
                {habit.currentStreak > 0 && (
                  <span className="text-xs font-medium text-warning flex items-center gap-1 flex-shrink-0">
                    🔥 {habit.currentStreak}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
