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

export const dynamic = "force-dynamic";

interface GoalDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { id } = await params;
  const goal = await serverGoalService.getById(id);
  console.log(goal);
  if (!goal) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <GoalHeader goal={goal} />
      {goal.targetValue && <ProgressUpdate goal={goal} />}
      <GoalProgress goal={goal} />
      <GoalStats goal={goal} />
      <GoalTasks goal={goal} />

      {/* Sub-goals section */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text">
            Sub-goals ({goal.children?.length || 0})
          </h3>
          <CreateSubGoal parentId={goal.id} />
        </div>

        {goal.children && goal.children.length > 0 ? (
          <GoalSubgoals subGoals={goal.children} />
        ) : (
          <p className="text-sm text-text-muted text-center py-6">
            No sub-goals yet. Break down your goal into smaller milestones.
          </p>
        )}
      </div>

      <GoalActions goal={goal} />
    </div>
  );
}
