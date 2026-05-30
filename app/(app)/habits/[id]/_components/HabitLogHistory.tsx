"use client";

import { useState } from "react";
import { Habit } from "@/types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface HabitLogHistoryProps {
  habit: Habit;
  todayStr: string;
}

// Calculate yesterday once at module level
function getYesterdayStr(): string {
  const now = Date.now();
  return new Date(now - 86400000).toLocaleDateString("en-CA");
}

export function HabitLogHistory({ habit, todayStr }: HabitLogHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [yesterdayStr] = useState(() => getYesterdayStr());

  const logs = habit.logs || [];
  const recentLogs = isExpanded ? logs : logs.slice(0, 5);
  const hasMore = logs.length > 5;

  if (logs.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Recent Activity
        </h3>
        <p className="text-sm text-text-muted text-center py-6">
          No activity yet. Start completing this habit to see your history.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">
        Recent Activity ({logs.length})
      </h3>

      <div className="space-y-2">
        {recentLogs.map((log, index) => {
          const logDateStr = new Date(log.date).toLocaleDateString("en-CA");

          let dateLabel: string;
          if (logDateStr === todayStr) dateLabel = "Today";
          else if (logDateStr === yesterdayStr) dateLabel = "Yesterday";
          else
            dateLabel = new Date(log.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

          return (
            <div
              key={log.id || index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                log.status === "COMPLETED"
                  ? "bg-success-bg/20 border-success/10"
                  : log.status === "SKIPPED"
                    ? "bg-warning-bg/20 border-warning/10"
                    : "bg-danger-bg/20 border-danger/10"
              }`}
            >
              {log.status === "COMPLETED" ? (
                <CheckCircle2
                  size={18}
                  className="text-success flex-shrink-0"
                />
              ) : log.status === "SKIPPED" ? (
                <Clock size={18} className="text-warning flex-shrink-0" />
              ) : (
                <XCircle size={18} className="text-danger flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text">
                    {log.status === "COMPLETED"
                      ? "Completed"
                      : log.status === "SKIPPED"
                        ? "Skipped"
                        : "Missed"}
                  </span>
                  {log.value && (
                    <span className="text-xs text-text-muted">
                      · {log.value} {log.unit || ""}
                    </span>
                  )}
                </div>
                {log.note && (
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {log.note}
                  </p>
                )}
              </div>

              <span className="text-xs text-text-muted flex-shrink-0">
                {dateLabel}
              </span>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-1 mt-4 py-2 text-sm text-text-muted hover:text-text transition-all"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show all ({logs.length})
            </>
          )}
        </button>
      )}
    </div>
  );
}
