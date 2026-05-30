"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Habit } from "@/types";
import { habitService } from "@/lib/services";
import { Check, Flame, Repeat } from "lucide-react";

interface HabitCardProps {
  habit: Habit;
  todayStr: string;
}

export function HabitCard({ habit, todayStr }: HabitCardProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const today = new Date().getDay();

  // Check if due today using browser's day
  const isDueToday =
    habit.status === "ACTIVE" &&
    (habit.frequencyType === "DAILY" ||
      (habit.frequencyType === "WEEKLY" &&
        habit.frequencyDays.includes(today)));

  // Check if already completed today using browser's date string
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
        isCompletedToday
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
          <div className="flex items-center gap-2">
            {!isDueToday && habit.status === "ACTIVE" && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-border text-text-muted">
                Not today
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
        </div>

        {/* Complete button */}
        {habit.status === "ACTIVE" && isDueToday && (
          <button
            onClick={handleComplete}
            disabled={isCompleting || isCompletedToday}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isCompletedToday
                ? "bg-success text-white cursor-default"
                : "bg-primary-bg text-primary hover:bg-primary hover:text-white"
            }`}
          >
            {isCompleting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isCompletedToday ? (
              <>
                <Check size={16} />
                Done for today
              </>
            ) : (
              <>
                <Check size={16} />
                Mark Complete
              </>
            )}
          </button>
        )}

        {habit.status === "ACTIVE" && !isDueToday && (
          <div className="w-full py-2.5 rounded-lg text-sm font-medium text-center text-text-muted bg-bg">
            Available {getFrequencyLabel()}
          </div>
        )}
      </div>
    </Link>
  );
}
