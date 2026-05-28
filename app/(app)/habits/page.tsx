import { serverHabitService } from "@/lib/services/server/habitService";
import { HabitList } from "./_components/HabitList";
import { HabitFilters } from "./_components/HabitFilters";
import { HabitCreateButton } from "./_components/HabitCreateButton";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const habits = await serverHabitService.getAll({}, false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text">Habits</h2>
          <p className="text-text-muted text-sm mt-1">
            {habits.length} habit{habits.length !== 1 ? "s" : ""}
          </p>
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
