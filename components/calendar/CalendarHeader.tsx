"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthYear,
  getNextMonth,
  getPrevMonth,
} from "@/lib/calendarUtils";

interface CalendarHeaderProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function CalendarHeader({
  currentMonth,
  onMonthChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => onMonthChange(getPrevMonth(currentMonth))}
        className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
      >
        <ChevronLeft size={20} />
      </button>

      <h3 className="text-lg font-semibold text-text">
        {formatMonthYear(currentMonth)}
      </h3>

      <button
        onClick={() => onMonthChange(getNextMonth(currentMonth))}
        className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
