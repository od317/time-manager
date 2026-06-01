"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Habit, CalendarEvent } from "@/types";
import { Calendar } from "@/components/calendar/Calendar";
import { GoalFormSection } from "./GoalFormSection";
import { HabitFormSection } from "./HabitFormSection";
import { ContextPanel } from "./ContextPanel";
import {
  Target,
  Repeat,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
} from "lucide-react";
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
    gradient: "from-primary to-secondary",
  },
  {
    value: "habit" as CreateType,
    label: "Habit",
    icon: Repeat,
    description: "Build consistent routines",
    gradient: "from-secondary to-accent",
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
      if (endDate && date > endDate) {
        setEndDate(null);
        setEndTime("");
      }
    } else if (dateMode === "end") {
      if (selectedDate && date < selectedDate) {
        return;
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-surface rounded-2xl border border-border shadow-sm p-2"
        >
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <motion.button
                  key={tab.value}
                  whileHover={!isActive ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.value)}
                  className={`relative flex flex-col items-center gap-2 py-4 px-4 rounded-xl text-sm font-semibold transition-all overflow-hidden ${
                    isActive
                      ? "text-white shadow-lg"
                      : "text-text-secondary hover:bg-border-light hover:text-text"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className={`absolute inset-0 bg-gradient-to-r ${tab.gradient}`}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  <Icon size={24} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative z-10"
                    >
                      <Sparkles size={12} className="text-white/80" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-text-muted text-center mt-3 px-2 font-medium">
            {tabs.find((t) => t.value === activeTab)?.description}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "goal" && (
            <motion.div
              key="goal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <GoalFormSection
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                endDate={endDate}
                endTime={endTime}
                onSuccess={handleReset}
              />
            </motion.div>
          )}
          {activeTab === "habit" && (
            <motion.div
              key="habit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HabitFormSection onSuccess={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Sidebar */}
      {activeTab === "goal" && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Date Picker Card */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-bg">
                <CalendarIcon size={16} className="text-primary" />
              </div>
              Dates
            </h3>

            {/* Start Date */}
            <motion.div whileHover={{ scale: 1.01 }} className="relative">
              <button
                onClick={() =>
                  setDateMode(dateMode === "start" ? null : "start")
                }
                className={`w-full flex items-center gap-4 p-4 pr-12 rounded-xl border-2 transition-all text-left ${
                  dateMode === "start"
                    ? "border-primary bg-primary-bg/50 shadow-sm"
                    : selectedDate
                      ? "border-primary/30 bg-primary-bg/20"
                      : "border-dashed border-border bg-bg hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedDate || dateMode === "start"
                      ? "bg-primary text-white shadow-md"
                      : "bg-border/50 text-text-muted"
                  }`}
                >
                  <CalendarIcon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text">
                    {dateMode === "start" ? "Selecting start..." : "Start Date"}
                  </p>
                  {selectedDate ? (
                    <p className="text-xs text-primary font-medium mt-1">
                      {format(selectedDate, "MMM d, yyyy")}
                      {selectedTime
                        ? ` · ${formatDisplayTime(selectedTime)}`
                        : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">Required</p>
                  )}
                </div>
                {dateMode === "start" && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Sparkles size={16} className="text-primary" />
                  </motion.div>
                )}
              </button>
              {selectedDate && dateMode !== "start" && (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedTime("");
                  }}
                  className="absolute top-3 right-3 text-xs text-text-muted hover:text-danger p-1.5 rounded-lg hover:bg-danger-bg transition-all"
                >
                  ✕
                </motion.button>
              )}
            </motion.div>

            {/* End Date */}
            <motion.div whileHover={{ scale: 1.01 }} className="relative">
              <button
                onClick={() => setDateMode(dateMode === "end" ? null : "end")}
                className={`w-full flex items-center gap-4 p-4 pr-12 rounded-xl border-2 transition-all text-left ${
                  dateMode === "end"
                    ? "border-primary bg-primary-bg/50 shadow-sm"
                    : endDate
                      ? "border-primary/30 bg-primary-bg/20"
                      : "border-dashed border-border bg-bg hover:border-primary/30 hover:shadow-sm"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    endDate || dateMode === "end"
                      ? "bg-primary text-white shadow-md"
                      : "bg-border/50 text-text-muted"
                  }`}
                >
                  <CalendarIcon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text">
                    {dateMode === "end" ? "Selecting end..." : "End Date"}
                  </p>
                  {endDate ? (
                    <p className="text-xs text-primary font-medium mt-1">
                      {format(endDate, "MMM d, yyyy")}
                      {endTime ? ` · ${formatDisplayTime(endTime)}` : ""}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">
                      Optional deadline
                    </p>
                  )}
                </div>
                {dateMode === "end" && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <Sparkles size={16} className="text-primary" />
                  </motion.div>
                )}
              </button>
              {endDate && dateMode !== "end" && (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setEndDate(null);
                    setEndTime("");
                  }}
                  className="absolute top-3 right-3 text-xs text-text-muted hover:text-danger p-1.5 rounded-lg hover:bg-danger-bg transition-all"
                >
                  ✕
                </motion.button>
              )}
            </motion.div>

            {dateMode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-warning-bg/50 border border-warning/20 rounded-xl"
              >
                <Clock size={14} className="text-warning" />
                <p className="text-xs text-warning font-semibold">
                  Click a day for {dateMode === "start" ? "start" : "end"} date
                </p>
              </motion.div>
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
        </motion.div>
      )}
    </div>
  );
}
