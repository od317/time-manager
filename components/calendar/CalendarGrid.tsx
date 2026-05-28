"use client";

import { CalendarEvent } from "@/types/calendar";
import { getMonthDays, WEEKDAYS, getEventsForDate } from "@/lib/calendarUtils";
import { CalendarDay } from "./CalendarDay";

interface CalendarGridProps {
  currentMonth: Date;
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onDateHover?: (date: Date, events: CalendarEvent[]) => void;
}

export function CalendarGrid({
  currentMonth,
  events,
  selectedDate,
  onDateSelect,
  onDateHover,
}: CalendarGridProps) {
  const days = getMonthDays(currentMonth);

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-text-muted py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const dayEvents = getEventsForDate(events, date);

          return (
            <CalendarDay
              key={date.toISOString()}
              date={date}
              baseDate={currentMonth}
              events={dayEvents}
              selectedDate={selectedDate}
              onSelect={onDateSelect}
              onHover={onDateHover}
            />
          );
        })}
      </div>
    </div>
  );
}
