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

  // Sort: active first, then by streak (highest first)
  const sorted = [...habits].sort((a, b) => {
    if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
    if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
    return b.currentStreak - a.currentStreak;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
