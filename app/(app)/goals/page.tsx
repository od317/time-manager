import { serverGoalService } from "@/lib/services/server/goalService";
import { GoalList } from "./_components/GoalList";
import { GoalFilters } from "./_components/GoalFilters";
import { GoalCreateButton } from "./_components/GoalCreateButton";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await serverGoalService.getAll({}, false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Goals</h2>
          <p className="text-text-muted text-sm mt-1">
            {goals.length} goal{goals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <GoalCreateButton />
      </div>

      {/* Filters */}
      <GoalFilters />

      {/* Goal Tree */}
      <GoalList goals={goals} />
    </div>
  );
}
