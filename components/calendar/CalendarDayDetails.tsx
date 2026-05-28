"use client";

import { useState } from "react";
import { CalendarEvent } from "@/types/calendar";
import { formatFullDate, formatDay } from "@/lib/calendarUtils";
import { isBefore, startOfToday, isSameDay } from "date-fns";
import {
  Target,
  CheckSquare,
  Repeat,
  Clock,
  Plus,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface CalendarDayDetailsProps {
  date: Date;
  events: CalendarEvent[];
  onAddEvent?: (date: Date) => void;
}

export function CalendarDayDetails({
  date,
  events,
  onAddEvent,
}: CalendarDayDetailsProps) {
  const today = startOfToday();
  const isPast = isBefore(date, today) && !isSameDay(date, today);
  const isToday = isSameDay(date, today);

  const goals = events.filter((e) => e.type === "goal");
  const tasks = events.filter((e) => e.type === "task");
  const habits = events.filter((e) => e.type === "habit");

  const formatDisplayTime = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
      case "TODO":
        return { label: "Active", color: "bg-primary-bg text-primary" };
      case "COMPLETED":
        return { label: "Done", color: "bg-success-bg text-success" };
      case "FAILED":
        return { label: "Missed", color: "bg-danger-bg text-danger" };
      case "IN_PROGRESS":
        return { label: "In Progress", color: "bg-warning-bg text-warning" };
      default:
        return { label: status, color: "bg-border text-text-muted" };
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div
        className={`px-5 py-4 border-b border-border ${isToday ? "bg-primary-bg/30" : isPast ? "bg-bg" : "bg-bg"}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-text">
              {formatFullDate(date)}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              {isToday && (
                <span className="text-xs font-medium text-primary bg-primary-bg px-2 py-0.5 rounded-full">
                  Today
                </span>
              )}
              {isPast && !isToday && (
                <span className="text-xs font-medium text-text-muted bg-border px-2 py-0.5 rounded-full">
                  Past
                </span>
              )}
              <span className="text-xs text-text-muted">
                {events.length} event{events.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-3xl font-bold text-text">
              {formatDay(date)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {events.length === 0 ? (
          <div className="text-center py-8">
            <Calendar size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary mb-1">
              No events for this day
            </p>
            <p className="text-xs text-text-muted">
              {isPast ? "No activity was recorded" : "Nothing planned yet"}
            </p>
            {!isPast && onAddEvent && (
              <button
                onClick={() => onAddEvent(date)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-all"
              >
                <Plus size={16} />
                Add event
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {goals.length > 0 && (
              <EventSection
                icon={Target}
                title="Goals"
                color="text-primary"
                count={goals.length}
              >
                {goals.map((event) => {
                  const badge = getStatusBadge(event.status);
                  return (
                    <EventItem
                      key={event.id}
                      event={event}
                      formatTime={formatDisplayTime}
                    >
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </EventItem>
                  );
                })}
              </EventSection>
            )}

            {tasks.length > 0 && (
              <EventSection
                icon={CheckSquare}
                title="Tasks"
                color="text-success"
                count={tasks.length}
              >
                {tasks.map((event) => {
                  const badge = getStatusBadge(event.status);
                  return (
                    <EventItem
                      key={event.id}
                      event={event}
                      formatTime={formatDisplayTime}
                    >
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                    </EventItem>
                  );
                })}
              </EventSection>
            )}

            {habits.length > 0 && (
              <EventSection
                icon={Repeat}
                title="Habits"
                color="text-purple-500"
                count={habits.length}
              >
                {habits.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    formatTime={formatDisplayTime}
                  >
                    {event.status === "COMPLETED" ? (
                      <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center">
                        <CheckSquare size={12} className="text-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border" />
                    )}
                  </EventItem>
                ))}
              </EventSection>
            )}
          </div>
        )}

        {!isPast && events.length > 0 && onAddEvent && (
          <button
            onClick={() => onAddEvent(date)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 text-sm text-primary hover:bg-primary-bg rounded-lg transition-all border border-dashed border-primary/30"
          >
            <Plus size={14} />
            Add event for this day
          </button>
        )}
      </div>
    </div>
  );
}

// Sub-components

function EventSection({
  icon: Icon,
  title,
  color,
  count,
  children,
}: {
  icon: typeof Target;
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-1"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className={color} />
          <span className="text-sm font-semibold text-text">{title}</span>
          <span className="text-xs text-text-muted">({count})</span>
        </div>
        <ChevronRight
          size={14}
          className={`text-text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
        />
      </button>

      {isExpanded && <div className="mt-2 space-y-1.5 ml-6">{children}</div>}
    </div>
  );
}

function EventItem({
  event,
  formatTime,
  children,
}: {
  event: CalendarEvent;
  formatTime: (time: string) => string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-bg border border-border hover:border-primary/20 transition-all group">
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: event.color }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {event.time && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Clock size={10} />
              {formatTime(event.time)}
            </span>
          )}
          {event.estimatedMinutes && (
            <span className="text-xs text-text-muted">
              {event.estimatedMinutes}m
            </span>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
