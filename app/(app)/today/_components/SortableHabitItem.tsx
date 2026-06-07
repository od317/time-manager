"use client";

import { motion } from "framer-motion";
import { Habit } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Flame, GripVertical, Target } from "lucide-react";

interface SortableHabitItemProps {
  habit: Habit;
  onComplete: (habit: Habit) => void;
  onUncomplete: (habit: Habit) => void;
  isLoading: boolean;
  isCompleted: boolean;
}

export function SortableHabitItem({
  habit,
  onComplete,
  onUncomplete,
  isLoading,
  isCompleted,
}: SortableHabitItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 0.98 : 1,
      }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all group ${
          isCompleted
            ? "bg-success-bg/30 border-success/20"
            : isDragging
              ? "bg-primary-bg/30 border-primary/30 shadow-lg"
              : "bg-bg border-border hover:border-secondary/30 hover:shadow-sm"
        }`}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="text-text-muted hover:text-text cursor-grab active:cursor-grabbing flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
        >
          <GripVertical size={14} />
        </div>

        {/* Complete button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            isCompleted ? onUncomplete(habit) : onComplete(habit)
          }
          disabled={isLoading}
          className={`flex-shrink-0 relative ${
            isLoading
              ? "cursor-not-allowed"
              : isCompleted
                ? "cursor-pointer"
                : "cursor-pointer"
          }`}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full"
            />
          ) : (
            <motion.div
              animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? "bg-success border-success text-white shadow-sm cursor-pointer"
                  : "border-border hover:border-secondary/50 cursor-pointer"
              } ${isLoading ? "cursor-not-allowed" : ""}`}
            >
              {isCompleted && <Check size={14} strokeWidth={3} />}
            </motion.div>
          )}
        </motion.button>

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          <p
            className={`text-sm font-semibold truncate transition-all ${
              isCompleted ? "text-success line-through opacity-75" : "text-text"
            }`}
          >
            {habit.title}
          </p>
          {habit.trackAmount && habit.targetValue && (
            <div className="flex items-center gap-1.5 mt-1">
              <Target size={12} className="text-text-muted" />
              <p className="text-xs text-text-muted font-medium">
                {habit.targetValue} {habit.unit || ""}
              </p>
            </div>
          )}
        </div>

        {/* Streak */}
        {habit.currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
              habit.currentStreak >= 7
                ? "bg-warning-bg text-warning"
                : "bg-secondary-bg text-secondary"
            }`}
            title={`${habit.currentStreak} day streak!`}
          >
            <motion.span
              animate={
                habit.currentStreak >= 7 ? { rotate: [0, -10, 10, 0] } : {}
              }
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              🔥
            </motion.span>
            {habit.currentStreak}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
