import { notFound } from "next/navigation";
import { serverGoalService } from "@/lib/services/server/goalService";
import { GoalHeader } from "./_components/GoalHeader";
import { GoalProgress } from "./_components/GoalProgress";
import { GoalStats } from "./_components/GoalStats";
import { GoalSubgoals } from "./_components/GoalSubgoals";
import { GoalTasks } from "./_components/GoalTasks";
import { GoalActions } from "./_components/GoalActions";
import { ProgressUpdate } from "../_components/ProgressUpdate";
import { CreateSubGoal } from "./_components/CreateSubGoal";
import { Layers, Target } from "lucide-react";

export const dynamic = "force-dynamic";

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const goal = await serverGoalService.getById(id);

  if (!goal) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <GoalHeader goal={goal} />

      {goal.targetValue && goal.targetValue > 0 && (
        <ProgressUpdate goal={goal} />
      )}

      <GoalProgress goal={goal} />
      <GoalStats goal={goal} />
      <GoalTasks goal={goal} />

      {/* Sub-goals section */}
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
          <CreateSubGoal parentId={goal.id} />
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
