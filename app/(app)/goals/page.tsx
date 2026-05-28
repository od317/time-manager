import { serverGoalService } from "@/lib/services/server/goalService";
import { GoalList } from "./_components/GoalList";
import { GoalFilters } from "./_components/GoalFilters";
import { Plus } from "lucide-react";
import Link from "next/link";

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
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Goal</span>
        </Link>
      </div>

      {/* Filters */}
      <GoalFilters />

      {/* Goal Tree */}
      <GoalList goals={goals} />
    </div>
  );
}
