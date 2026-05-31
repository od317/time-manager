import { TimeEntry, Goal } from "@/types";
import { Clock, Target, CheckSquare } from "lucide-react";
import { format } from "date-fns";

interface RecentActivityProps {
  timeEntries: TimeEntry[];
  goals: Goal[];
}

export function RecentActivity({ timeEntries, goals }: RecentActivityProps) {
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (timeEntries.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4">
          Recent Activity
        </h3>
        <p className="text-sm text-text-muted text-center py-8">
          No recent time entries.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Recent Activity</h3>
      <div className="space-y-2">
        {timeEntries.slice(0, 10).map((entry) => {
          const goal = entry.goalId
            ? goals.find((g) => g.id === entry.goalId)
            : null;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border"
            >
              <Clock size={16} className="text-text-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text truncate">
                  {entry.note || "Time entry"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {goal && (
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Target size={10} />
                      {goal.title}
                    </span>
                  )}
                  <span className="text-xs text-text-muted">
                    {format(new Date(entry.startTime), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
              {entry.duration && (
                <span className="text-sm font-medium text-text flex-shrink-0">
                  {formatDuration(entry.duration)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
