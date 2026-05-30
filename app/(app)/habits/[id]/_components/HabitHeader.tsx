"use client";

import { useState } from "react";
import Link from "next/link";
import { Habit } from "@/types";
import { ArrowLeft, Repeat, Pencil } from "lucide-react";
import { EditHabitModal } from "./EditHabitModal";

interface HabitHeaderProps {
  habit: Habit;
}

export function HabitHeader({ habit }: HabitHeaderProps) {
  const [showEdit, setShowEdit] = useState(false);

  const getFrequencyLabel = (): string => {
    if (habit.frequencyType === "DAILY") return "Daily";
    if (habit.frequencyType === "WEEKLY") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return habit.frequencyDays.map((d) => days[d]).join(", ");
    }
    return "Custom";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/habits"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-text transition-all"
        >
          <ArrowLeft size={16} />
          Back to habits
        </Link>
        <button
          onClick={() => setShowEdit(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-muted hover:text-text bg-bg border border-border rounded-lg hover:border-primary/30 transition-all"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${habit.color || "#6366F1"}15` }}
        >
          <Repeat size={28} style={{ color: habit.color || "#6366F1" }} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text">{habit.title}</h1>
          {habit.description && (
            <p className="text-text-secondary mt-1">{habit.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-primary-bg text-primary">
              {getFrequencyLabel()}
            </span>
            {habit.timesPerDay > 1 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-border text-text-secondary">
                {habit.timesPerDay}x per day
              </span>
            )}
            {habit.trackAmount && habit.targetValue && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-border text-text-secondary">
                {habit.targetValue} {habit.unit}
              </span>
            )}
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                habit.status === "ACTIVE"
                  ? "bg-success-bg text-success"
                  : habit.status === "PAUSED"
                    ? "bg-warning-bg text-warning"
                    : "bg-border text-text-muted"
              }`}
            >
              {habit.status}
            </span>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditHabitModal habit={habit} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}
