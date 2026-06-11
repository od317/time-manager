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
import { Layers, Target, Loader2 } from "lucide-react";
import { Goal } from "@/types";

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getGoal, fetchGoalDetail } = useDataStore();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

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
    fetchGoalDetail(id).then((g) => {
      setGoal(g);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <GoalHeader goal={goal} />

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
