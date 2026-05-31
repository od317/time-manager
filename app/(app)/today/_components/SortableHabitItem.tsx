"use client";

import { Habit } from "@/types";
import { habitService } from "@/lib/services";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Flame, GripVertical } from "lucide-react";

interface SortableHabitItemProps {
  habit: Habit;
  todayStr: string;
  onComplete: (habit: Habit) => void;
  isLoading: boolean;
  isCompleted: boolean;
}

export function SortableHabitItem({
  habit,
  todayStr,
  onComplete,
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
    opacity: isDragging ? 0.3 : 1,
  };

  const isDueToday =
    habit.frequencyType === "DAILY" ||
    (habit.frequencyType === "WEEKLY" &&
      habit.frequencyDays.includes(new Date().getDay()));

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all group ${
          isCompleted
            ? "bg-success-bg/20 border-success/10"
            : isDragging
              ? "bg-primary-bg/20"
              : "bg-bg border-border hover:border-primary/30"
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
        <button
          onClick={() => onComplete(habit)}
          disabled={isLoading || isCompleted}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                isCompleted
                  ? "bg-success border-success text-white"
                  : "border-border"
              }`}
            >
              {isCompleted && <Check size={12} />}
            </div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          <p
            className={`text-sm font-medium truncate ${
              isCompleted ? "text-success line-through" : "text-text"
            }`}
          >
            {habit.title}
          </p>
          {habit.trackAmount && habit.targetValue && (
            <p className="text-xs text-text-muted mt-0.5">
              Target: {habit.targetValue} {habit.unit || ""}
            </p>
          )}
        </div>

        {/* Streak */}
        {habit.currentStreak > 0 && (
          <span className="text-xs font-medium text-warning flex items-center gap-1 flex-shrink-0">
            🔥 {habit.currentStreak}
          </span>
        )}
      </div>
    </div>
  );
}
