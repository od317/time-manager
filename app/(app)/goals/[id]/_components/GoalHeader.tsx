import Link from "next/link";
import { Goal } from "@/types";
import { ArrowLeft } from "lucide-react";

interface GoalHeaderProps {
  goal: Goal;
}

export function GoalHeader({ goal }: GoalHeaderProps) {
  return (
    <div>
      <Link
        href="/goals"
        className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text mb-4 transition-all"
      >
        <ArrowLeft size={16} />
        Back to goals
      </Link>

      <div className="flex items-start gap-3">
        {goal.icon && <span className="text-3xl">{goal.icon}</span>}
        <div>
          <h1 className="text-2xl font-bold text-text">{goal.title}</h1>
          {goal.description && (
            <p className="text-text-secondary mt-1">{goal.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                goal.priority === "URGENT"
                  ? "bg-danger-bg text-danger"
                  : goal.priority === "HIGH"
                    ? "bg-warning-bg text-warning"
                    : "bg-primary-bg text-primary"
              }`}
            >
              {goal.priority}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                goal.status === "ACTIVE"
                  ? "bg-success-bg text-success"
                  : goal.status === "COMPLETED"
                    ? "bg-primary-bg text-primary"
                    : goal.status === "FAILED"
                      ? "bg-danger-bg text-danger"
                      : "bg-border text-text-muted"
              }`}
            >
              {goal.status}
            </span>
            {goal.category && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-border text-text-secondary">
                {goal.category}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
