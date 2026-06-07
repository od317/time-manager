"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Habit } from "@/types";
import { HabitCard } from "./HabitCard";
import { EmptyHabits } from "./EmptyHabits";
import { Sparkles } from "lucide-react";

const filters = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Paused", value: "PAUSED" },
  { label: "Archived", value: "ARCHIVED" },
];

interface HabitListWithFiltersProps {
  habits: Habit[];
}

export function HabitListWithFilters({ habits }: HabitListWithFiltersProps) {
  const [filterStatus, setFilterStatus] = useState("");
  const today = new Date().getDay();
  const todayStr = new Date().toLocaleDateString("en-CA");

  const filteredHabits = filterStatus
    ? habits.filter((h) => h.status === filterStatus)
    : habits;

  const dueToday = filteredHabits.filter((h) => {
    if (h.status !== "ACTIVE") return false;
    if (h.frequencyType === "DAILY") return true;
    if (h.frequencyType === "WEEKLY") return h.frequencyDays.includes(today);
    return false;
  });

  const notDueToday = filteredHabits.filter((h) => !dueToday.includes(h));

  if (filteredHabits.length === 0) return <EmptyHabits />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl border border-border w-fit">
        {filters.map((filter) => (
          <motion.button
            key={filter.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterStatus(filter.value)}
            className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === filter.value
                ? "text-text"
                : "text-text-muted hover:text-text"
            }`}
          >
            {filterStatus === filter.value && (
              <motion.div
                layoutId="activeHabitFilter"
                className="absolute inset-0 bg-surface rounded-xl shadow-sm border border-border"
                transition={{ duration: 0.15 }}
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted">
        {filteredHabits.length} habit{filteredHabits.length !== 1 ? "s" : ""}
        {filterStatus ? ` (${filterStatus.toLowerCase()})` : " total"}
      </p>

      {/* Today's Habits */}
      {dueToday.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 rounded-lg bg-secondary-bg">
              <Sparkles size={14} className="text-secondary" />
            </div>
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">
              Today&apos;s Habits
            </h3>
            <span className="text-xs font-semibold text-text-muted bg-bg px-2 py-0.5 rounded-full">
              {dueToday.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueToday.map((habit) => (
              <HabitCard key={habit.id} habit={habit} todayStr={todayStr} />
            ))}
          </div>
        </div>
      )}

      {/* Other Habits */}
      {notDueToday.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 rounded-lg bg-bg">
              <Sparkles size={14} className="text-text-muted" />
            </div>
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">
              Other Habits
            </h3>
            <span className="text-xs font-semibold text-text-muted bg-bg px-2 py-0.5 rounded-full">
              {notDueToday.length}
            </span>
          </div>
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
