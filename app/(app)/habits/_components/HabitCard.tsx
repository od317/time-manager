"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Habit } from "@/types";
import { habitService } from "@/lib/services";
import { Check, Flame, Repeat, Clock, MoreHorizontal } from "lucide-react";

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleComplete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCompleting || habit.status !== "ACTIVE") return;

    setIsCompleting(true);
    try {
      await habitService.log(habit.id, {
        value: habit.trackAmount ? (habit.targetValue ?? undefined) : undefined,
      });
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 1500);
      router.refresh();
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
      className={`block bg-surface rounded-xl border transition-all hover:shadow-md ${
        justCompleted
          ? "border-success ring-2 ring-success/20"
          : habit.status === "ACTIVE"
            ? "border-border hover:border-primary/20"
            : "border-border opacity-60"
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color || "#6366F1" }}
            />
            <h3 className="font-semibold text-text truncate">{habit.title}</h3>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
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

        {/* Description */}
        {habit.description && (
          <p className="text-sm text-text-secondary mb-3 line-clamp-2">
            {habit.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Flame
              size={16}
              className={
                habit.currentStreak > 0 ? "text-warning" : "text-text-muted"
              }
            />
            <span className="font-semibold text-text">
              {habit.currentStreak}
            </span>
            <span className="text-text-muted">streak</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Repeat size={16} className="text-text-muted" />
            <span className="text-text-secondary">{getFrequencyLabel()}</span>
          </div>
          {habit.trackAmount && habit.targetValue && (
            <div className="flex items-center gap-1.5 text-sm">
              <Clock size={16} className="text-text-muted" />
              <span className="text-text-secondary">
                {habit.targetValue} {habit.unit}
              </span>
            </div>
          )}
        </div>

        {/* Complete button */}
        {habit.status === "ACTIVE" && (
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              justCompleted
                ? "bg-success text-white"
                : "bg-primary-bg text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {isCompleting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : justCompleted ? (
              <>
                <Check size={16} />
                Done!
              </>
            ) : (
              <>
                <Check size={16} />
                Mark Complete
              </>
            )}
          </button>
        )}
      </div>
    </Link>
  );
}
