"use client";

import { useState } from "react";
import Link from "next/link";
import { Goal } from "@/types";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import { GoalForm } from "./GoalForm";

interface GoalCardProps {
  goal: Goal;
  subGoals: Goal[];
  allGoals: Goal[];
}

export function GoalCard({ goal, subGoals, allGoals }: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSubGoalForm, setShowSubGoalForm] = useState(false);

  const hasChildren = subGoals.length > 0;
  const getChildrenOf = (parentId: string) =>
    allGoals.filter((g) => g.parentId === parentId);

  return (
    <div>
      <div className="bg-surface rounded-xl border border-border hover:border-primary/20 transition-all">
        <Link href={`/goals/${goal.id}`} className="block p-4">
          <div className="flex items-start gap-3">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="mt-0.5 p-0.5 text-text-muted hover:text-text transition-all"
              >
                {isExpanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {goal.icon && <span>{goal.icon}</span>}
                <h3 className="font-semibold text-text truncate">
                  {goal.title}
                </h3>
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

              {goal.description && (
                <p className="text-sm text-text-muted mb-2 line-clamp-1">
                  {goal.description}
                </p>
              )}

              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>
                  {goal.currentValue > 0 && goal.targetValue
                    ? `${goal.currentValue} / ${goal.targetValue} ${goal.unit || ""}`
                    : `${Math.round(goal.progress)}%`}
                </span>
                {goal.endDate && (
                  <span>Due {new Date(goal.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </Link>

        <div className="px-4 pb-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowSubGoalForm(true);
            }}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-primary transition-all"
          >
            <Plus size={14} />
            Add sub-goal
          </button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6 mt-1 space-y-1 border-l-2 border-border pl-4">
          {subGoals.map((child) => (
            <GoalCard
              key={child.id}
              goal={child}
              subGoals={getChildrenOf(child.id)}
              allGoals={allGoals}
            />
          ))}
        </div>
      )}

      {showSubGoalForm && (
        <GoalForm
          parentId={goal.id}
          onClose={() => setShowSubGoalForm(false)}
        />
      )}
    </div>
  );
}
