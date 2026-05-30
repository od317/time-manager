"use client";

import { Habit } from "@/types";
import { HabitCard } from "./HabitCard";
import { EmptyHabits } from "./EmptyHabits";

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) {
    return <EmptyHabits />;
  }

  // Use the backend's isDueToday flag
  const dueToday = habits.filter((h) => (h as any).isDueToday);
  const notDueToday = habits.filter((h) => !(h as any).isDueToday);

  return (
    <div>
      {dueToday.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Today
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueToday.map((habit) => (
              <HabitCard key={habit.id} habit={habit} currentDay={true} />
            ))}
          </div>
        </div>
      )}

      {notDueToday.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Other Days
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notDueToday.map((habit) => (
              <HabitCard key={habit.id} habit={habit} currentDay={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
