"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Priority, Task } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { Calendar } from "@/components/calendar/Calendar";
import { useCalendarData } from "@/hooks/useCalendarData";
import { CalendarEvent } from "@/types/calendar";
import {
  X,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useTaskStore } from "@/store/taskStore";

interface QuickTaskModalProps {
  goal: Goal;
  onClose: () => void;
}

export function QuickTaskModal({ goal, onClose }: QuickTaskModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { data: calendarData } = useCalendarData();

  const calendarEvents: CalendarEvent[] = calendarData
    ? [
        ...(calendarData.goals || []).map((g) => ({
          id: g.id,
          type: "goal" as const,
          title: g.title,
          color: g.color || "#9FA1FF",
          date: g.endDate || g.startDate,
          status: g.status,
          time: undefined,
        })),
        ...(goal.tasks || []).map((t) => ({
          id: t.id,
          type: "task" as const,
          title: t.title,
          color: goal.color || "#9FA1FF",
          date: t.dueDate || new Date().toISOString(),
          status: t.status,
          time: undefined,
        })),
      ]
    : [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const formatDisplayTime = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const dueDate = selectedDate
        ? selectedTime
          ? new Date(
              `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`,
            ).toISOString()
          : format(selectedDate, "yyyy-MM-dd") + "T00:00:00.000Z" // Force UTC midnight
        : undefined;
      console.log(dueDate);
      const taskResponse = await taskService.create({
        title: title.trim(),
        goalId: goal.id,
        priority,
        estimatedMinutes: estimatedMinutes
          ? parseInt(estimatedMinutes)
          : undefined,
        dueDate,
      });

      // Add task locally - use the actual API response
      useTaskStore.getState().addTask(goal.id, taskResponse as Task);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch {
      setError("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-hidden py-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-surface z-10">
            <div>
              <h3 className="text-lg font-bold text-text">Add Task</h3>
              <div className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: goal.color || "#9FA1FF" }}
                />
                {goal.title}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
            {/* Form Section */}
            <form
              onSubmit={handleSubmit}
              className="md:col-span-3 p-5 space-y-4"
            >
              {error && (
                <div className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-3 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} /> {error}
                </div>
              )}
              {success && (
                <div className="bg-success-bg text-success border border-success/20 rounded-xl p-3 text-sm flex items-center gap-2">
                  <CheckCircle size={16} /> Task created!
                </div>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-bg text-sm text-text focus:outline-none focus:border-primary"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-1.5">
                    Est. Time
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={estimatedMinutes}
                      onChange={(e) => setEstimatedMinutes(e.target.value)}
                      placeholder="30"
                      min="1"
                      className="w-full px-3 py-2.5 pl-9 rounded-xl border-2 border-border bg-bg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                    />
                    <Clock
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                  </div>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Due Date
                </label>
                {selectedDate ? (
                  <div className="flex items-center gap-3 p-3 bg-primary-bg/20 rounded-xl border border-primary/20">
                    <CalendarIcon size={16} className="text-primary" />
                    <span className="text-sm font-medium text-primary flex-1">
                      {format(selectedDate, "EEE, MMM d, yyyy")}
                      {selectedTime
                        ? ` at ${formatDisplayTime(selectedTime)}`
                        : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedTime("");
                      }}
                      className="p-1 text-text-muted hover:text-danger"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-primary/30 hover:text-text transition-all text-sm"
                  >
                    <CalendarIcon size={16} /> Pick a due date (optional)
                  </button>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border-2 border-border text-text-secondary rounded-xl text-sm font-semibold hover:bg-border-light transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Plus size={16} />
                  )}
                  {isSubmitting ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>

            {/* Calendar Section */}
            <div className="md:col-span-2 p-5 border-t md:border-t-0 md:border-l border-border bg-bg/50">
              <AnimatePresence>
                {showCalendar && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <Calendar
                      events={calendarEvents}
                      existingEvents={calendarEvents}
                      selectedDate={selectedDate}
                      onDateSelect={(date) => {
                        setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      showTimePicker={!!selectedDate}
                      onTimeSelect={setSelectedTime}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              {!showCalendar && !selectedDate && (
                <div className="text-center py-8">
                  <CalendarIcon
                    size={32}
                    className="text-text-muted mx-auto mb-3 opacity-50"
                  />
                  <p className="text-sm text-text-muted">Set a due date</p>
                  <p className="text-xs text-text-muted mt-1">
                    Click {"Pick a due date"} to open the calendar
                  </p>
                </div>
              )}
              {!showCalendar && selectedDate && (
                <div className="text-center py-8">
                  <div className="p-3 rounded-full bg-primary-bg inline-flex mb-3">
                    <CalendarIcon size={24} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-text">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                  {selectedTime && (
                    <p className="text-xs text-primary mt-1">
                      {formatDisplayTime(selectedTime)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className="mt-3 text-xs text-primary font-medium hover:underline"
                  >
                    Change date
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
