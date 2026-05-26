import Link from "next/link";
import { Goal } from "@/types";
import { ArrowRight } from "lucide-react";

interface TodayGoalsProps {
  goals: Goal[];
}

export function TodayGoals({ goals }: TodayGoalsProps) {
  if (goals.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Active Goals</h3>
        <p className="text-text-muted text-sm text-center py-8">
          No active goals. Set your first goal to start tracking progress!
        </p>
        <Link
          href="/goals"
          className="block text-center text-sm text-primary hover:text-primary-dark font-medium"
        >
          Create a goal
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Active Goals</h3>
        <Link
          href="/goals"
          className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => (
          <Link
            key={goal.id}
            href={`/goals/${goal.id}`}
            className="block p-3 rounded-lg bg-bg border border-border hover:border-primary/30 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-text truncate">
                {goal.icon && <span className="mr-2">{goal.icon}</span>}
                {goal.title}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  goal.priority === "URGENT"
                    ? "bg-danger-bg text-danger"
                    : goal.priority === "HIGH"
                      ? "bg-warning-bg text-warning"
                      : "bg-primary-bg text-primary"
                }`}
              >
                {goal.priority}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(goal.progress, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-muted">
                {goal.currentValue > 0 && goal.targetValue
                  ? `${goal.currentValue} / ${goal.targetValue} ${goal.unit || ""}`
                  : `${Math.round(goal.progress)}%`}
              </span>
              {goal.endDate && (
                <span className="text-xs text-text-muted">
                  Due {new Date(goal.endDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
