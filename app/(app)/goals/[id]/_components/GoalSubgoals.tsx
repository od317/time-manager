import Link from "next/link";
import { Goal } from "@/types";
import { ChevronRight } from "lucide-react";

interface GoalSubgoalsProps {
  subGoals: Goal[];
}

export function GoalSubgoals({ subGoals }: GoalSubgoalsProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">
        Sub-goals ({subGoals.length})
      </h3>

      <div className="space-y-2">
        {subGoals.map((subGoal) => (
          <Link
            key={subGoal.id}
            href={`/goals/${subGoal.id}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border hover:border-primary/30 transition-all group"
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: subGoal.color || "#6366F1" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {subGoal.icon && <span>{subGoal.icon}</span>}
                <span className="text-sm font-medium text-text truncate">
                  {subGoal.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    subGoal.status === "COMPLETED"
                      ? "bg-success-bg text-success"
                      : subGoal.status === "FAILED"
                        ? "bg-danger-bg text-danger"
                        : "bg-primary-bg text-primary"
                  }`}
                >
                  {subGoal.status}
                </span>
              </div>

              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(subGoal.progress, 100)}%` }}
                />
              </div>
            </div>

            <ChevronRight
              size={16}
              className="text-text-muted group-hover:text-text transition-all flex-shrink-0"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
