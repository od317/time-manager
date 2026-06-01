import { serverGoalService } from "@/lib/services/server/goalService";
import { GoalList } from "./_components/GoalList";
import { GoalFilters } from "./_components/GoalFilters";
import { Plus, Target } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await serverGoalService.getAll({}, false);

  const activeGoals = goals.filter((g) => g.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Goals</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-text">
                {goals.length}
              </span>
              <span className="text-sm text-text-muted">
                total goal{goals.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm text-text-muted">
                {activeGoals} active
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/create?tab=goal"
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group"
        >
          <Plus
            size={18}
            className="group-hover:rotate-90 transition-transform"
          />
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
