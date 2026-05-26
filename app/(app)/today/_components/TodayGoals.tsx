import Link from "next/link";
import { Goal } from "@/types";
import { ArrowRight, CornerDownRight } from "lucide-react";

interface TodayGoalsProps {
  goals: Goal[];
}

function GoalItem({
  goal,
  allGoals,
  depth = 0,
}: {
  goal: Goal;
  allGoals: Goal[];
  depth?: number;
}) {
  const subGoals = allGoals.filter((g) => g.parentId === goal.id);

  return (
    <>
      <Link
        href={`/goals/${goal.id}`}
        className={`block p-3 rounded-lg bg-bg border border-border hover:border-primary/30 transition-all ${
          depth > 0 ? "ml-4" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {depth > 0 && (
              <CornerDownRight
                size={14}
                className="text-text-muted flex-shrink-0"
              />
            )}
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: goal.color || "#6366F1" }}
            />
            {goal.icon && <span className="flex-shrink-0">{goal.icon}</span>}
            <p className="text-sm font-medium text-text truncate">
              {goal.title}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
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

      {/* Render sub-goals recursively */}
      {subGoals.map((sub) => (
        <GoalItem
          key={sub.id}
          goal={sub}
          allGoals={allGoals}
          depth={depth + 1}
        />
      ))}
    </>
  );
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

  // Get top-level goals and all sub-goals in one flat list
  const topLevelGoals = goals.filter((g) => !g.parentId);
  const allGoals = goals; // Contains both parents and children

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

      <div className="space-y-2">
        {topLevelGoals.map((goal) => (
          <GoalItem key={goal.id} goal={goal} allGoals={allGoals} />
        ))}
      </div>
    </div>
  );
}
