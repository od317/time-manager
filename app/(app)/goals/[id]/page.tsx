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
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6 animate-fade-in">
        {/* Header skeleton */}
        <div className="space-y-6">
          {/* Back button */}
          <div className="h-5 w-32 bg-border rounded-md animate-pulse" />

          {/* Title section */}
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-border animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-72 bg-border rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-border rounded-md animate-pulse" />
                <div className="h-4 w-2/3 bg-border rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-7 w-20 bg-border rounded-full animate-pulse" />
                <div className="h-7 w-16 bg-border rounded-full animate-pulse" />
                <div className="h-7 w-24 bg-border rounded-full animate-pulse" />
                <div className="h-7 w-32 bg-border rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Update skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
            </div>
          </div>

          {/* Current progress display */}
          <div className="flex items-center justify-between p-4 bg-bg rounded-xl">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
              <div className="h-7 w-32 bg-border rounded-lg animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-border rounded-md animate-pulse" />
              <div className="h-7 w-20 bg-border rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Quick add buttons */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-10 bg-border rounded-xl animate-pulse"
              />
            ))}
          </div>

          {/* Input field */}
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-border rounded-xl animate-pulse" />
            <div className="h-12 w-12 bg-border rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Progress chart skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-24 bg-border rounded-lg animate-pulse" />
          </div>

          {/* Goal completion bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-border rounded-md animate-pulse" />
              <div className="h-4 w-8 bg-border rounded-md animate-pulse" />
            </div>
            <div className="h-3 bg-border rounded-full" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 bg-border rounded-md animate-pulse" />
              <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
            </div>
          </div>

          {/* Time elapsed bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-border rounded-md animate-pulse" />
              <div className="h-4 w-8 bg-border rounded-md animate-pulse" />
            </div>
            <div className="h-3 bg-border rounded-full" />
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-border rounded-md animate-pulse" />
              <div className="h-3 w-28 bg-border rounded-md animate-pulse" />
            </div>
          </div>

          {/* Timeline analysis */}
          <div className="p-4 bg-bg rounded-xl border border-border space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-border rounded animate-pulse" />
              <div className="h-3 w-28 bg-border rounded-md animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-24 bg-border rounded-md animate-pulse" />
              <div className="h-4 w-4 bg-border rounded-md animate-pulse" />
              <div className="h-4 w-20 bg-border rounded-md animate-pulse" />
              <div className="h-4 w-20 bg-border rounded-full animate-pulse ml-auto" />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border-2 border-border p-5 space-y-4 animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-border" />
              <div className="space-y-2">
                <div className="h-7 w-16 bg-border rounded-lg" />
                <div className="h-3 w-20 bg-border rounded-md" />
                <div className="h-3 w-24 bg-border rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Tasks section skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-bg">
                <div className="w-5 h-5 bg-border rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-5 w-16 bg-border rounded-lg animate-pulse" />
                <div className="h-3 w-16 bg-border rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-28 bg-border rounded-xl animate-pulse" />
          </div>
          <div className="px-6 pb-6 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-border bg-bg animate-pulse"
              >
                <div className="w-5 h-5 rounded-lg bg-border" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-border rounded-md" />
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-border rounded-md" />
                    <div className="h-3 w-12 bg-border rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-goals section skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-info-bg">
                <div className="w-5 h-5 bg-border rounded animate-pulse" />
              </div>
              <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-border rounded-xl animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-bg border-2 border-border animate-pulse"
              >
                <div className="w-3 h-3 rounded-full bg-border" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-36 bg-border rounded-md" />
                    <div className="h-5 w-16 bg-border rounded-full" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-16 bg-border rounded-md" />
                      <div className="h-3 w-8 bg-border rounded-md" />
                    </div>
                    <div className="h-2 bg-border rounded-full" />
                  </div>
                </div>
                <div className="w-5 h-5 bg-border rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-20 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="h-12 w-36 bg-border rounded-2xl animate-pulse" />
            <div className="h-12 w-32 bg-border rounded-2xl animate-pulse" />
            <div className="h-12 w-28 bg-border rounded-2xl animate-pulse" />
            <div className="h-12 w-28 bg-border rounded-2xl animate-pulse ml-auto" />
          </div>
        </div>
      </div>
    );
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
