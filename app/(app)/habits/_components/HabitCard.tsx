"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Habit } from "@/types";
import { habitService } from "@/lib/services";
import { Check, Flame, Calendar, Clock, Target } from "lucide-react";
import { useDataStore } from "@/store/dataStore";

interface HabitCardProps {
  habit: Habit;
  todayStr: string;
}

export function HabitCard({ habit, todayStr }: HabitCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const today = new Date().getDay();

  const isDueToday =
    habit.status === "ACTIVE" &&
    (habit.frequencyType === "DAILY" ||
      (habit.frequencyType === "WEEKLY" &&
        habit.frequencyDays.includes(today)));

  const todayLog = habit.logs?.find((log) => {
    if (log.status !== "COMPLETED") return false;
    const logDateStr = new Date(log.date).toLocaleDateString("en-CA");
    return logDateStr === todayStr;
  });
  const isCompletedToday = !!todayLog || completed;

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompleting || !isDueToday || isCompletedToday) return;

    setIsCompleting(true);
    try {
      await habitService.log(habit.id, {
        value: habit.trackAmount ? (habit.targetValue ?? undefined) : undefined,
      });
      setCompleted(true);
      useDataStore.getState().updateHabitInCache(habit.id, {
        isCompleted: true,
        todayStatus: "COMPLETED",
        currentStreak: habit.currentStreak + 1,
      });
    } catch {
      // Handle silently
    } finally {
      setIsCompleting(false);
    }
  };

  const getFrequencyLabel = (): string => {
    if (habit.frequencyType === "DAILY") return "Daily";
    if (habit.frequencyType === "WEEKLY") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return habit.frequencyDays.map((d) => days[d]).join(", ");
    }
    return "Custom";
  };

  return (
    <Link
      href={`/habits/${habit.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="block h-full"
    >
      <motion.div
        whileHover={{ y: -2 }}
        className={`relative bg-surface rounded-2xl border-2 transition-all overflow-hidden h-full ${
          isCompletedToday
            ? "border-success/30 ring-2 ring-success/10"
            : habit.status === "ACTIVE"
              ? "border-border hover:border-secondary/30 hover:shadow-lg"
              : "border-border opacity-60 hover:opacity-80"
        }`}
      >
        {/* Completion indicator */}
        {isCompletedToday && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-success to-success-light"
          />
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <motion.div
                animate={
                  isDueToday && !isCompletedToday ? { scale: [1, 1.1, 1] } : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-surface"
                style={{
                  backgroundColor: habit.color || "#9FA1FF",
                  boxShadow:
                    isDueToday && !isCompletedToday
                      ? `0 0 12px ${habit.color || "#9FA1FF"}40`
                      : "none",
                }}
              />
              <div className="min-w-0">
                <h3 className="font-bold text-text truncate group-hover:text-primary transition-colors">
                  {habit.title}
                </h3>
                {habit.trackAmount && habit.targetValue && (
                  <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                    <Target size={10} />
                    {habit.targetValue} {habit.unit || ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              {!isDueToday && habit.status === "ACTIVE" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-bg text-text-muted border border-border">
                  Not today
                </span>
              )}
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  habit.status === "ACTIVE"
                    ? "bg-success-bg text-success border border-success/20"
                    : habit.status === "PAUSED"
                      ? "bg-warning-bg text-warning border border-warning/20"
                      : "bg-bg text-text-muted border border-border"
                }`}
              >
                {habit.status}
              </span>
            </div>
          </div>

          {/* Description */}
          {habit.description && (
            <p className="text-sm text-text-secondary mb-4 line-clamp-2 leading-relaxed">
              {habit.description}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-bg rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame
                  size={14}
                  className={
                    habit.currentStreak > 0 ? "text-warning" : "text-text-muted"
                  }
                />
                <span className="text-[10px] font-semibold text-text-muted uppercase">
                  Streak
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-text">
                  {habit.currentStreak}
                </span>
                <span className="text-xs text-text-muted">days</span>
              </div>
            </div>

            <div className="bg-bg rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar size={14} className="text-text-muted" />
                <span className="text-[10px] font-semibold text-text-muted uppercase">
                  Schedule
                </span>
              </div>
              <p className="text-xs font-medium text-text-secondary truncate">
                {getFrequencyLabel()}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {habit.status === "ACTIVE" && isDueToday && (
            <motion.button
              onClick={handleComplete}
              disabled={isCompleting || isCompletedToday}
              whileHover={!isCompletedToday ? { scale: 1.02 } : {}}
              whileTap={!isCompletedToday ? { scale: 0.98 } : {}}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                isCompletedToday
                  ? "bg-success text-white cursor-default shadow-sm"
                  : "bg-primary-bg text-primary hover:bg-primary hover:text-white hover:shadow-md"
              }`}
            >
              <AnimatePresence mode="wait">
                {isCompleting ? (
                  <motion.div
                    key="spinner"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : isCompletedToday ? (
                  <motion.div
                    key="done"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={16} strokeWidth={3} />
                    Done for today
                  </motion.div>
                ) : (
                  <motion.div
                    key="complete"
                    className="flex items-center gap-2"
                  >
                    <Check size={16} />
                    Mark Complete
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {habit.status === "ACTIVE" && !isDueToday && (
            <div className="w-full py-3 rounded-xl text-sm font-semibold text-center text-text-muted bg-bg border-2 border-dashed border-border">
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} />
                Available {getFrequencyLabel()}
              </div>
            </div>
          )}

          {habit.status !== "ACTIVE" && (
            <div className="w-full py-3 rounded-xl text-sm font-semibold text-center text-text-muted bg-bg">
              {habit.status === "PAUSED" ? "Paused" : "Archived"}
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}
