"use client";

import { Habit } from "@/types";
import { HabitCard } from "./HabitCard";
import { EmptyHabits } from "./EmptyHabits";

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) return <EmptyHabits />;

  // Browser determines today's day of week
  const today = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local timezone

  const dueToday = habits.filter((h) => {
    if (h.status !== "ACTIVE") return false;
    if (h.frequencyType === "DAILY") return true;
    if (h.frequencyType === "WEEKLY") return h.frequencyDays.includes(today);
    return false;
  });

  const notDueToday = habits.filter((h) => !dueToday.includes(h));

  return (
    <div>
      {dueToday.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Today
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueToday.map((habit) => (
              <HabitCard key={habit.id} habit={habit} todayStr={todayStr} />
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
              <HabitCard key={habit.id} habit={habit} todayStr={todayStr} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
