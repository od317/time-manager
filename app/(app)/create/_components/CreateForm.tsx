"use client";

import { useState } from "react";
import { Goal, Habit, CalendarEvent } from "@/types";
import { Calendar } from "@/components/calendar/Calendar";
import { GoalFormSection } from "./GoalFormSection";
import { HabitFormSection } from "./HabitFormSection";
import { ContextPanel } from "./ContextPanel";
import { Target, Repeat, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { useSearchParams } from "next/navigation";

type CreateType = "goal" | "habit";

interface CreateFormProps {
  existingEvents: CalendarEvent[];
  goals: Goal[];
  habits: Habit[];
}

const tabs = [
  {
    value: "goal" as CreateType,
    label: "Goal",
    icon: Target,
    description: "Track progress toward a target",
  },
  {
    value: "habit" as CreateType,
    label: "Habit",
    icon: Repeat,
    description: "Build consistent routines",
  },
];

type DateMode = "start" | "end" | null;

export function CreateForm({ existingEvents, goals, habits }: CreateFormProps) {
  const params = useSearchParams();
  const tab = params.get("tab") as CreateType;
  const [activeTab, setActiveTab] = useState<CreateType>(tab || "goal");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>(null);

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const activeHabits = habits.filter((h) => h.status === "ACTIVE");
  const upcomingDeadlines = goals.filter(
    (g) =>
      g.endDate && new Date(g.endDate) > new Date() && g.status === "ACTIVE",
  ).length;

  const handleDateSelect = (date: Date) => {
    if (dateMode === "start") {
      setSelectedDate(date);
      setSelectedTime("");
      // If end date is before new start date, clear end date
      if (endDate && date > endDate) {
        setEndDate(null);
        setEndTime("");
      }
    } else if (dateMode === "end") {
      if (selectedDate && date < selectedDate) {
        // End is before start - don't allow
        return; // Or show a message
      }
      setEndDate(date);
      setEndTime("");
    }
    setDateMode(null);
  };

  const handleTimeSelect = (time: string) => {
    if (dateMode === "start") {
      setSelectedTime(time);
    } else if (dateMode === "end") {
      setEndTime(time);
    }
  };

  const getActiveDate = () => {
    if (dateMode === "start") return selectedDate;
    if (dateMode === "end") return endDate;
    return null;
  };

  const handleReset = () => {
    setSelectedDate(null);
    setSelectedTime("");
    setEndDate(null);
    setEndTime("");
    setDateMode(null);
  };

  const formatDisplayTime = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Tab Selector */}
        <div className="bg-surface rounded-xl border border-border p-2">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex flex-col items-center gap-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:bg-border-light hover:text-text"
                  }`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-text-muted text-center mt-2 px-2">
            {tabs.find((t) => t.value === activeTab)?.description}
          </p>
        </div>

        {activeTab === "goal" && (
          <GoalFormSection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            endDate={endDate}
            endTime={endTime}
            onSuccess={handleReset}
          />
        )}
        {activeTab === "habit" && <HabitFormSection onSuccess={handleReset} />}
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {/* Date Picker Card */}
        <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <CalendarIcon size={16} className="text-primary" />
            Dates
          </h3>

          {/* Start Date */}
          <div className="relative">
            <button
              onClick={() => setDateMode(dateMode === "start" ? null : "start")}
              className={`w-full flex items-center gap-3 p-3 pr-10 rounded-lg border-2 transition-all text-left ${
                dateMode === "start"
                  ? "border-primary bg-primary-bg/30"
                  : selectedDate
                    ? "border-primary/30 bg-primary-bg/10"
                    : "border-border border-dashed bg-bg hover:border-primary/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selectedDate
                    ? "bg-primary text-white"
                    : "bg-border text-text-muted"
                }`}
              >
                <CalendarIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">
                  {dateMode === "start" ? "Selecting start..." : "Start Date"}
                </p>
                {selectedDate ? (
                  <p className="text-xs text-primary mt-0.5">
                    {format(selectedDate, "MMM d, yyyy")}
                    {selectedTime
                      ? ` · ${formatDisplayTime(selectedTime)}`
                      : ""}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted mt-0.5">Required</p>
                )}
              </div>
            </button>
            {selectedDate && dateMode !== "start" && (
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedTime("");
                }}
                className="absolute top-2 right-2 text-xs text-text-muted hover:text-danger p-1 rounded"
              >
                ✕
              </button>
            )}
          </div>

          {/* End Date */}
          <div className="relative">
            <button
              onClick={() => setDateMode(dateMode === "end" ? null : "end")}
              className={`w-full flex items-center gap-3 p-3 pr-10 rounded-lg border-2 transition-all text-left ${
                dateMode === "end"
                  ? "border-primary bg-primary-bg/30"
                  : endDate
                    ? "border-primary/30 bg-primary-bg/10"
                    : "border-border border-dashed bg-bg hover:border-primary/30"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  endDate
                    ? "bg-primary text-white"
                    : "bg-border text-text-muted"
                }`}
              >
                <CalendarIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">
                  {dateMode === "end" ? "Selecting end..." : "End Date"}
                </p>
                {endDate ? (
                  <p className="text-xs text-primary mt-0.5">
                    {format(endDate, "MMM d, yyyy")}
                    {endTime ? ` · ${formatDisplayTime(endTime)}` : ""}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted mt-0.5">
                    Optional deadline
                  </p>
                )}
              </div>
            </button>
            {endDate && dateMode !== "end" && (
              <button
                onClick={() => {
                  setEndDate(null);
                  setEndTime("");
                }}
                className="absolute top-2 right-2 text-xs text-text-muted hover:text-danger p-1 rounded"
              >
                ✕
              </button>
            )}
          </div>

          {dateMode && (
            <div className="flex items-center gap-2 p-2 bg-warning-bg/30 rounded-lg">
              <Clock size={14} className="text-warning" />
              <p className="text-xs text-warning font-medium">
                Click a day for {dateMode === "start" ? "start" : "end"} date
              </p>
            </div>
          )}
        </div>

        {/* Calendar */}
        <Calendar
          events={existingEvents}
          selectedDate={getActiveDate()}
          onDateSelect={handleDateSelect}
          showTimePicker={!!dateMode && !!getActiveDate()}
          onTimeSelect={handleTimeSelect}
        />

        <ContextPanel
          activeGoals={activeGoals.length}
          activeHabits={activeHabits.length}
          upcomingDeadlines={upcomingDeadlines}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}
