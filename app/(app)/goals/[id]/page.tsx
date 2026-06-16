"use client";

import { useEffect, useState, use } from "react";
import { useDataStore } from "@/store/dataStore";
import { GoalHeader } from "./_components/GoalHeader";
import { GoalProgress } from "./_components/GoalProgress";
import { GoalStats } from "./_components/GoalStats";
import { GoalSubgoals } from "./_components/GoalSubgoals";
import { GoalTasks } from "./_components/GoalTasks";
import { GoalActions } from "./_components/GoalActions";
import { ProgressUpdate } from "../_components/ProgressUpdate";
import { CreateSubGoal } from "./_components/CreateSubGoal";
import { CalendarIcon, Layers, Target } from "lucide-react";
import { Goal } from "@/types";
import { ErrorState } from "@/components/ErrorState";
import Link from "next/link";
import GoalDetailsSkeleton from "../_components/GoalDetailsSkeleton";

const getTimeRemaining = (endDate: string): string => {
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return "Past due";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} month${months > 1 ? "s" : ""} remaining`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? "s" : ""} remaining`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
};

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getGoal, fetchGoalDetail } = useDataStore();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const cachedGoal = useDataStore((s) => (id ? s.getGoal(id) : undefined));
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check cache first
    const cached = getGoal(id);
    if (cached && cached.timeEntries) {
      // Has full detail with time entries
      setGoal(cached);
      setLoading(false);
      return;
    }
    // Fetch full detail (includes time entries)
    fetchGoalDetail(id)
      .then((g) => {
        setGoal(g);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        // Check if it's a 404 (goal not found) vs other error
        if (err?.code === "NOT_FOUND" || err?.status === 404) {
          setGoal(null); // Will show "not found"
        } else {
          setError(true); // Network/server error
        }
      });
  }, [id]);

  useEffect(() => {
    if (cachedGoal && goal) {
      // Force full update from cache
      setGoal(cachedGoal);
    }
  }, [cachedGoal]);
  if (error)
    return (
      <ErrorState
        description="Failed to load goal details"
        onRetry={() => {
          setError(false);
          setLoading(true);
          fetchGoalDetail(id)
            .then((g) => {
              setGoal(g);
              setLoading(false);
            })
            .catch(() => {
              setLoading(false);
              setError(true);
            });
        }}
      />
    );

  if (loading) {
    return <GoalDetailsSkeleton />;
  }

  if (!goal) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
        <div className="text-center py-20">
          <Target size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Goal not found</p>
          <Link
            href="/goals"
            className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
          >
            Back to Goals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <GoalHeader goal={goal} />

      {/* Date Information Cards */}
      {(goal.startDate || goal.endDate) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goal.startDate && (
            <div className="bg-surface rounded-2xl border border-border shadow-sm p-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-primary-bg">
                <CalendarIcon size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">
                  Start Date
                </p>
                <p className="text-sm font-bold text-text">
                  {new Date(goal.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {goal.endDate && (
            <div
              className={`bg-surface rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${
                goal.status === "OVERDUE"
                  ? "border-amber-200 dark:border-amber-800"
                  : "border-border"
              }`}
            >
              <div
                className={`p-2.5 rounded-xl ${
                  goal.status === "OVERDUE"
                    ? "bg-amber-50 dark:bg-amber-950"
                    : "bg-primary-bg"
                }`}
              >
                <CalendarIcon
                  size={20}
                  className={
                    goal.status === "OVERDUE"
                      ? "text-amber-500"
                      : "text-primary"
                  }
                />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">
                  Due Date
                  {goal.status === "OVERDUE" && (
                    <span className="ml-2 text-amber-500 font-bold">
                      Overdue
                    </span>
                  )}
                </p>
                <p className="text-sm font-bold text-text">
                  {new Date(goal.endDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {goal.status !== "OVERDUE" && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {getTimeRemaining(goal.endDate)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {goal.targetValue && goal.targetValue > 0 && (
        <ProgressUpdate goal={goal} />
      )}

      <GoalProgress goal={goal} />
      <GoalStats goal={goal} />
      <GoalTasks goal={goal} />

      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-info-bg">
              <Target size={18} className="text-info" />
            </div>
            <h3 className="text-lg font-bold text-text">
              Sub-goals ({goal.children?.length || 0})
            </h3>
          </div>
          {goal.status !== "COMPLETED" && goal.status !== "FAILED" && (
            <CreateSubGoal parentId={goal.id} />
          )}
        </div>

        {goal.children && goal.children.length > 0 ? (
          <GoalSubgoals subGoals={goal.children} />
        ) : (
          <div className="text-center py-10">
            <Layers
              size={32}
              className="text-text-muted mx-auto mb-3 opacity-50"
            />
            <p className="text-sm text-text-muted font-medium">
              No sub-goals yet
            </p>
            <p className="text-xs text-text-muted mt-1">
              Break down your goal into smaller milestones
            </p>
          </div>
        )}
      </div>

      <GoalActions goal={goal} />
    </div>
  );
}
