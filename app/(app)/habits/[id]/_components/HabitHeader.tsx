"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Habit } from "@/types";
import { ArrowLeft, Repeat, Pencil, Sparkles, Calendar } from "lucide-react";
import { EditHabitModal } from "./EditHabitModal";

interface HabitHeaderProps {
  habit: Habit;
  todayStr: string;
}

export function HabitHeader({ habit, todayStr }: HabitHeaderProps) {
  const [showEdit, setShowEdit] = useState(false);

  const getFrequencyLabel = (): string => {
    if (habit.frequencyType === "DAILY") return "Daily";
    if (habit.frequencyType === "WEEKLY") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return habit.frequencyDays.map((d) => days[d]).join(", ");
    }
    return "Custom";
  };

  const today = new Date().getDay();
  const isDueToday =
    habit.frequencyType === "DAILY" ||
    (habit.frequencyType === "WEEKLY" && habit.frequencyDays.includes(today));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/habits"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-all group"
        >
          <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
            <ArrowLeft size={16} />
          </motion.div>
          <span className="group-hover:underline">Back to habits</span>
        </Link>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-muted hover:text-text bg-bg border-2 border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <Pencil size={14} />
          Edit
        </motion.button>
      </div>

      <div className="flex items-start gap-5">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
          style={{
            backgroundColor: `${habit.color || "#9FA1FF"}20`,
            border: `2px solid ${habit.color || "#9FA1FF"}30`,
          }}
        >
          <Repeat size={30} style={{ color: habit.color || "#9FA1FF" }} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-text">{habit.title}</h1>
          {habit.description && (
            <p className="text-text-secondary mt-2 leading-relaxed">
              {habit.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary-bg text-primary border border-primary/20">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {getFrequencyLabel()}
              </span>
            </span>

            {habit.timesPerDay > 1 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg text-text-secondary border border-border">
                {habit.timesPerDay}x per day
              </span>
            )}

            {habit.trackAmount && habit.targetValue && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg text-text-secondary border border-border">
                {habit.targetValue} {habit.unit}
              </span>
            )}

            {isDueToday && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-xs font-bold px-3 py-1.5 rounded-full bg-success-bg text-success border border-success/20 flex items-center gap-1.5"
              >
                <Sparkles size={12} />
                Due today
              </motion.span>
            )}

            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                habit.status === "ACTIVE"
                  ? "bg-success-bg text-success border-success/20"
                  : habit.status === "PAUSED"
                    ? "bg-warning-bg text-warning border-warning/20"
                    : "bg-bg text-text-muted border-border"
              }`}
            >
              {habit.status}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEdit && (
          <EditHabitModal habit={habit} onClose={() => setShowEdit(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
