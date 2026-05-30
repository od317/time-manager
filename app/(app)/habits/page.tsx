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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Habits</h2>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-text-muted text-sm">
              {habits.length} habit{habits.length !== 1 ? "s" : ""}
            </p>
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
