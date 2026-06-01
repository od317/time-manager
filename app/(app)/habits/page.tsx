import { serverHabitService } from "@/lib/services/server/habitService";
import { HabitList } from "./_components/HabitList";
import { HabitFilters } from "./_components/HabitFilters";
import { HabitCreateButton } from "./_components/HabitCreateButton";
import { TimeRemaining } from "./_components/TimeRemaining";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await serverHabitService.getAll({}, false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Habits</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-text">
                {habits.length}
              </span>
              <span className="text-sm text-text-muted">
                habit{habits.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <TimeRemaining />
          </div>
        </div>
        <HabitCreateButton />
      </div>

      {/* Filters */}
      <HabitFilters />

      {/* Habit List */}
      <HabitList habits={habits} />
    </div>
  );
}
