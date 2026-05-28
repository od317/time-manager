"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarEvent } from "@/types/calendar";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarDayDetails } from "./CalendarDayDetails";
import { TimePicker } from "./TimePicker";
import { isBefore, startOfToday } from "date-fns";
import { isDayToday } from "@/lib/calendarUtils";

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date, events: CalendarEvent[]) => void;
  onAddEvent?: (date: Date) => void;
  showTimePicker?: boolean;
  onTimeSelect?: (time: string) => void;
  selectedDate?: Date | null;
}

export function Calendar({
  events = [],
  onDateSelect,
  onAddEvent,
  showTimePicker = false,
  onTimeSelect,
  selectedDate: externalSelectedDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    externalSelectedDate || null,
  );

  useEffect(() => {
    if (externalSelectedDate !== undefined) {
      setSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);

  const handleDateSelect = (date: Date) => {
    const today = startOfToday();
    const isPast = isBefore(date, today) && !isDayToday(date);

    setSelectedDate(date);
    const dayEvents = events.filter(
      (e) => new Date(e.date).toDateString() === date.toDateString(),
    );

    if (!isPast) {
      onDateSelect?.(date, dayEvents);
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <CalendarHeader
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      <CalendarGrid
        currentMonth={currentMonth}
        events={events}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Selected day details */}
      {selectedDate && (
        <div className="mt-4">
          <CalendarDayDetails
            date={selectedDate}
            events={events.filter(
              (e) =>
                new Date(e.date).toDateString() === selectedDate.toDateString(),
            )}
            onAddEvent={onAddEvent}
          />
        </div>
      )}

      {/* Time picker */}
      {showTimePicker && selectedDate && onTimeSelect && (
        <div className="mt-4 pt-4 border-t border-border">
          <TimePicker
            onTimeSelect={onTimeSelect}
            label="Pick a time (optional)"
          />
        </div>
      )}
    </div>
  );
}
