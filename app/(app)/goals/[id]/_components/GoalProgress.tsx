import { Goal } from "@/types";
import { Calendar, Target } from "lucide-react";

interface GoalProgressProps {
  goal: Goal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const startDate = new Date(goal.startDate);
  const endDate = goal.endDate ? new Date(goal.endDate) : null;
  const now = new Date();

  // Determine if time-based
  const timeUnits = ["hours", "minutes", "h", "m", "hrs", "mins"];
  const isTimeBased = goal.unit
    ? timeUnits.includes(goal.unit.toLowerCase())
    : false;

  // Calculate current value from tracked time for time-based goals
  let currentValue = goal.currentValue || 0;
  if (isTimeBased) {
    const trackedSeconds = (goal.timeEntries || []).reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0,
    );
    const trackedInUnit =
      goal.unit?.toLowerCase() === "minutes"
        ? trackedSeconds / 60
        : trackedSeconds / 3600;

    // Use tracked time or manual value, whichever is higher
    currentValue = Math.max(currentValue, trackedInUnit);
  }

  // Goal progress
  const goalProgress = goal.targetValue
    ? Math.min((currentValue / goal.targetValue) * 100, 100)
    : 0;

  // Time progress
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
    return `${val}`;
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Progress</h3>

      {/* Goal progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Goal Completion</span>
          <span className="text-sm font-semibold text-text">
            {Math.round(goalProgress)}%
          </span>
        </div>
        <div className="w-full h-3 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(goalProgress, 100)}%`,
              backgroundColor: goal.color || "#6366F1",
            }}
          />
        </div>
        {goal.targetValue && (
          <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
            <span>
              <Target size={12} className="inline mr-1" />
              {formatValue(currentValue)} / {formatValue(goal.targetValue)}{" "}
              {goal.unit || ""}
            </span>
            <span>
              {formatValue(goal.targetValue - currentValue)} remaining
            </span>
          </div>
        )}
      </div>

      {/* Time progress */}
      {endDate && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Time Elapsed</span>
            <span className="text-sm font-semibold text-text">
              {Math.round(timeProgress)}%
            </span>
          </div>
          <div className="w-full h-3 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-warning rounded-full transition-all"
              style={{ width: `${timeProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
            <span>
              <Calendar size={12} className="inline mr-1" />
              {startDate.toLocaleDateString()}
            </span>
            <span>{endDate.toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
