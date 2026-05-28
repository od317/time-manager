import { CalendarEvent } from "@/types/calendar";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";

export function getMonthDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

export function getEventsForDate(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  return events.filter((event) => isSameDay(new Date(event.date), date));
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatDay(date: Date): string {
  return format(date, "d");
}

export function formatFullDate(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function getPrevMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function isCurrentMonth(date: Date, baseDate: Date): boolean {
  return isSameMonth(date, baseDate);
}

export function isDayToday(date: Date): boolean {
  return isToday(date);
}

export function isDaySelected(date: Date, selectedDate: Date | null): boolean {
  if (!selectedDate) return false;
  return isSameDay(date, selectedDate);
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
