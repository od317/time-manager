"use client";

import { motion } from "framer-motion";
import { Goal } from "@/types";
import { Calendar, Target, TrendingUp, Clock } from "lucide-react";

interface GoalProgressProps {
  goal: Goal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const startDate = new Date(goal.startDate);
  const endDate = goal.endDate ? new Date(goal.endDate) : null;
  const now = new Date();

  const isTimeBased = goal.goalType === "time";
  const isQuantity = goal.goalType === "quantity";
  const isProject = goal.goalType === "project";

  let currentValue = goal.currentValue || 0;
  if (isTimeBased) {
    const trackedSeconds = (goal.allTimeEntries || []).reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0,
    );
    const trackedInUnit =
      goal.unit?.toLowerCase() === "minutes"
        ? trackedSeconds / 60
        : trackedSeconds / 3600;
    currentValue = Math.max(currentValue, trackedInUnit);
  }

  const goalProgress = goal.targetValue
    ? Math.min((currentValue / goal.targetValue) * 100, 100)
    : 0;

  let timeProgress = 0;
  if (endDate) {
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    timeProgress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }

  const formatValue = (val: number): string => {
    if (isTimeBased) {
      const hours = Math.floor(val);
      const minutes = Math.round((val - hours) * 60);
      if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return "0m";
    }
    return `${Math.round(val)}`;
  };

  if (isProject) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary-bg">
            <TrendingUp size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text">Progress</h3>
        </div>
        <div className="p-6 bg-bg rounded-xl border-2 border-dashed border-border text-center">
          <Target
            size={32}
            className="text-text-muted mx-auto mb-3 opacity-50"
          />
          <p className="text-sm text-text-muted font-medium">
            Track progress by completing tasks and sub-goals
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
          <TrendingUp size={18} className="text-primary" />
        </div>
        <h3 className="text-lg font-bold text-text">Progress</h3>
      </div>

      {goal.targetValue && goal.targetValue > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-secondary">
              Goal Completion
            </span>
            <span className="text-sm font-bold text-text">
              {Math.round(goalProgress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(goalProgress, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${goal.color || "#9FA1FF"}80, ${goal.color || "#9FA1FF"})`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs font-medium">
            <span className="text-text-muted flex items-center gap-1.5">
              <Target size={12} />
              {formatValue(currentValue)} / {formatValue(goal.targetValue)}{" "}
              {goal.unit || ""}
            </span>
            <span className="text-text-secondary">
              {formatValue(goal.targetValue - currentValue)} remaining
            </span>
          </div>
        </div>
      )}

      {endDate && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-secondary">
              Time Elapsed
            </span>
            <span className="text-sm font-bold text-text">
              {Math.round(timeProgress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${timeProgress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full bg-gradient-to-r from-warning/60 to-warning"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs font-medium">
            <span className="text-text-muted flex items-center gap-1.5">
              <Calendar size={12} />
              {startDate.toLocaleDateString()}
            </span>
            <span className="text-text-secondary">
              {endDate.toLocaleDateString()}
            </span>
          </div>

          {/* Timeline comparison */}
          {goal.targetValue && goal.targetValue > 0 && (
            <div className="mt-4 p-4 bg-bg rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-text-muted" />
                <span className="text-xs font-semibold text-text-muted">
                  Timeline Analysis
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-text-secondary">
                  Progress:{" "}
                  <span className="font-bold text-text">
                    {Math.round(goalProgress)}%
                  </span>
                </span>
                <span className="text-text-muted">vs</span>
                <span className="text-text-secondary">
                  Time:{" "}
                  <span className="font-bold text-text">
                    {Math.round(timeProgress)}%
                  </span>
                </span>
                <span
                  className={`ml-auto font-bold ${
                    goalProgress >= timeProgress
                      ? "text-success"
                      : "text-warning"
                  }`}
                >
                  {goalProgress >= timeProgress
                    ? "On track"
                    : "Behind schedule"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
