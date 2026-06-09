"use client";

import { motion } from "framer-motion";
import { Habit } from "@/types";
import { HabitCard } from "./HabitCard";
import { EmptyHabits } from "./EmptyHabits";
import { Sparkles } from "lucide-react";

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  if (habits.length === 0) return <EmptyHabits />;
  const today = new Date().getDay();
  const todayStr = new Date().toLocaleDateString("en-CA");

  const dueToday = habits.filter((h) => {
    if (h.status !== "ACTIVE") return false;
    if (h.frequencyType === "DAILY") return true;
    if (h.frequencyType === "WEEKLY") return h.frequencyDays.includes(today);
    return false;
  });

  const notDueToday = habits.filter((h) => !dueToday.includes(h));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
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
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
          >
            {dueToday.map((habit) => (
              <motion.div
                key={habit.id}
                variants={item}
                layout
                className="h-full"
              >
                <HabitCard habit={habit} todayStr={todayStr} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

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
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch"
          >
            {notDueToday.map((habit) => (
              <motion.div
                key={habit.id}
                variants={item}
                layout
                className="h-full"
              >
                {" "}
                <HabitCard habit={habit} todayStr={todayStr} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
