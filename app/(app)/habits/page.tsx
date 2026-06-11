"use client";

import { useEffect, useRef } from "react";
import { useDataStore } from "@/store/dataStore";
import { HabitListWithFilters } from "./_components/HabitListWithFilters";
import { HabitCreateButton } from "./_components/HabitCreateButton";
import { TimeRemaining } from "./_components/TimeRemaining";

export default function HabitsPage() {
  const { allHabits, allHabitsLoaded, fetchAllHabits } = useDataStore();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    if (!allHabitsLoaded) {
      fetchAllHabits();
    }
  }, [allHabitsLoaded, fetchAllHabits]);

  if (!allHabitsLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-border rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-border rounded-2xl animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-20 bg-border rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-surface rounded-2xl border border-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">Habits</h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-text">
                {allHabits.length}
              </span>
              <span className="text-sm text-text-muted">
                habit{allHabits.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-1 h-1 rounded-full bg-border" />
            <TimeRemaining />
          </div>
        </div>
        <HabitCreateButton />
      </div>

      <HabitListWithFilters habits={allHabits} />
    </div>
  );
}
