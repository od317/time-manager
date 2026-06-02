"use client";

import { useState, useMemo, useEffect } from "react";
import { CalendarEvent } from "@/types/calendar";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarDayDetails } from "./CalendarDayDetails";
import { TimePicker } from "./TimePicker";
import { isBefore, startOfToday } from "date-fns";
import { isDayToday } from "@/lib/calendarUtils";
import { AlertCircle } from "lucide-react";

interface CalendarProps {
  events?: CalendarEvent[];
  onDateSelect?: (date: Date, events: CalendarEvent[]) => void;
  onAddEvent?: (date: Date) => void;
  showTimePicker?: boolean;
  onTimeSelect?: (time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string;
  existingEvents?: CalendarEvent[]; // For conflict detection
}

export function Calendar({
  events = [],
  onDateSelect,
  onAddEvent,
  showTimePicker = false,
  onTimeSelect,
  selectedDate: externalSelectedDate,
  selectedTime,
  existingEvents = [],
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    externalSelectedDate || null,
  );
  const [conflictMessage, setConflictMessage] = useState("");

  useEffect(() => {
    if (externalSelectedDate !== undefined) {
      setSelectedDate(externalSelectedDate);
    }
  }, [externalSelectedDate]);

  // Check for time conflicts
  const checkConflict = (date: Date, time: string): boolean => {
    if (!time) return false;

    const conflicts = existingEvents.filter((event) => {
      const eventDate = new Date(event.date).toDateString();
      const selectedDateStr = date.toDateString();
      if (eventDate !== selectedDateStr) return false;
      if (!event.time) return false;
      return event.time === time;
    });

    if (conflicts.length > 0) {
      setConflictMessage(
        `Time conflict: "${conflicts[0].title}" is already scheduled at ${time}`,
      );
      return true;
    }
    setConflictMessage("");
    return false;
  };

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

  const handleTimeSelect = (time: string) => {
    if (selectedDate && checkConflict(selectedDate, time)) {
      // Conflict exists - still allow but show warning
      onTimeSelect?.(time);
      return;
    }
    onTimeSelect?.(time);
  };

  // Available time slots for the selected date
  const busyTimes = useMemo(() => {
    if (!selectedDate) return [];
    return existingEvents
      .filter((e) => {
        const eventDate = new Date(e.date).toDateString();
        return eventDate === selectedDate.toDateString() && e.time;
      })
      .map((e) => e.time as string);
  }, [selectedDate, existingEvents]);

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

      {showTimePicker && selectedDate && onTimeSelect && (
        <div className="mt-4 pt-4 border-t border-border">
          <TimePicker
            onTimeSelect={handleTimeSelect}
            label="Pick a time (optional)"
          />

          {conflictMessage && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-warning-bg/20 border border-warning/20 rounded-lg text-sm text-warning">
              <AlertCircle size={16} />
              {conflictMessage}
            </div>
          )}

          {busyTimes.length > 0 && !conflictMessage && (
            <div className="mt-3">
              <p className="text-xs text-text-muted mb-1">Already scheduled:</p>
              <div className="flex flex-wrap gap-1">
                {busyTimes.map((time) => (
                  <span
                    key={time}
                    className="text-xs px-2 py-0.5 rounded-full bg-bg border border-border text-text-muted"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
