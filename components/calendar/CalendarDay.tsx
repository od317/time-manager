"use client";

import { CalendarEvent } from "@/types/calendar";
import {
  isDayToday,
  isDaySelected,
  isCurrentMonth,
  formatDay,
} from "@/lib/calendarUtils";
import { isBefore, startOfToday } from "date-fns";

interface CalendarDayProps {
  date: Date;
  baseDate: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  onHover?: (date: Date, events: CalendarEvent[]) => void;
}

export function CalendarDay({
  date,
  baseDate,
  events,
  selectedDate,
  onSelect,
  onHover,
}: CalendarDayProps) {
  const isSelected = isDaySelected(date, selectedDate);
  const isTodayDate = isDayToday(date);
  const isInMonth = isCurrentMonth(date, baseDate);
  const today = startOfToday();
  const isPast = isBefore(date, today) && !isTodayDate;

  const hasGoal = events.some((e) => e.type === "goal");
  const hasTask = events.some((e) => e.type === "task");
  const hasHabit = events.some((e) => e.type === "habit");

  const dotColors = [
    hasGoal ? events.find((e) => e.type === "goal")?.color || "#6366F1" : null,
    hasTask ? events.find((e) => e.type === "task")?.color || "#10B981" : null,
    hasHabit
      ? events.find((e) => e.type === "habit")?.color || "#F59E0B"
      : null,
  ].filter(Boolean) as string[];

  return (
    <button
      onClick={() => {
        if (!isPast) {
          onSelect(date);
        }
      }}
      onMouseEnter={() => onHover?.(date, events)}
      type="button"
      disabled={isPast}
      className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all ${
        !isInMonth
          ? "text-text-muted/30"
          : isPast
            ? "text-text-muted/40 bg-bg cursor-not-allowed opacity-60"
            : isSelected
              ? "bg-primary text-white"
              : "hover:bg-border-light text-text cursor-pointer"
      } ${isTodayDate && !isSelected ? "ring-2 ring-primary" : ""}`}
    >
      <span className={`${isTodayDate && isSelected ? "font-bold" : ""}`}>
        {formatDay(date)}
      </span>

      {/* Event dots - show even for past days */}
      {dotColors.length > 0 && (
        <div className="flex gap-0.5 mt-1">
          {dotColors.map((color, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${isPast ? "opacity-40" : ""}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {/* Past day indicator */}
      {isPast && isInMonth && (
        <div className="absolute inset-0 rounded-lg bg-border/10" />
      )}
    </button>
  );
}
