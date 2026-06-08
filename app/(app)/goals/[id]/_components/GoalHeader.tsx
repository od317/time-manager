"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Priority } from "@/types";
import { goalService } from "@/lib/services";
import {
  ArrowLeft,
  Flag,
  Pencil,
  X,
  Check,
  Loader2,
  AlertTriangle,
  CalendarIcon,
} from "lucide-react";
import { ColorPicker } from "../../_components/ColorPicker";
import { format } from "date-fns";
import { Calendar } from "@/components/calendar/Calendar";

interface GoalHeaderProps {
  goal: Goal;
}

export function GoalHeader({ goal: initialGoal }: GoalHeaderProps) {
  const router = useRouter();
  const [goal, setGoal] = useState(initialGoal);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editDescription, setEditDescription] = useState(
    goal.description || "",
  );
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [editPriority, setEditPriority] = useState<Priority>(
    goal.priority as Priority,
  );
  const [editEndDate, setEditEndDate] = useState(
    goal.endDate ? goal.endDate.split("T")[0] : "",
  );
  const [editColor, setEditColor] = useState(goal.color || "#6366F1");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const canEdit = goal.status === "ACTIVE" || goal.status === "OVERDUE";
  const isOverdue = goal.status === "OVERDUE";
  const canEditDates = goal.status === "ACTIVE";

  const handleSave = async () => {
    setError("");

    // Title is required
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }

    // If goal already has a due date, cannot remove it
    if (goal.endDate && !editEndDate) {
      setError(
        "Cannot remove the due date. Please set a new date or keep the existing one.",
      );
      return;
    }

    // If user set a due date, validate it's after start date
    if (editEndDate && goal.startDate) {
      const endDateObj = new Date(editEndDate);
      const startDateObj = new Date(goal.startDate);
      startDateObj.setHours(0, 0, 0, 0);
      endDateObj.setHours(0, 0, 0, 0);

      if (endDateObj <= startDateObj) {
        setError("Due date must be after the start date");
        return;
      }
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        priority: editPriority,
        color: editColor,
      };

      if (canEditDates) {
        if (editEndDate) {
          updateData.endDate = new Date(editEndDate).toISOString();
        }
      }

      const updated = await goalService.update(goal.id, updateData);
      setGoal(updated);
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to update goal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(goal.title);
    setEditDescription(goal.description || "");
    setEditPriority(goal.priority as Priority);
    setEditEndDate(goal.endDate ? goal.endDate.split("T")[0] : "");
    setEditColor(goal.color || "#6366F1");
    setError("");
    setIsEditing(false);
  };

  const getPriorityConfig = () => {
    switch (goal.priority) {
      case "URGENT":
        return {
          color: "text-danger",
          bg: "bg-danger-bg",
          border: "border-danger/20",
        };
      case "HIGH":
        return {
          color: "text-warning",
          bg: "bg-warning-bg",
          border: "border-warning/20",
        };
      case "MEDIUM":
        return {
          color: "text-info",
          bg: "bg-info-bg",
          border: "border-info/20",
        };
      default:
        return {
          color: "text-text-muted",
          bg: "bg-bg",
          border: "border-border",
        };
    }
  };

  const getStatusConfig = () => {
    switch (goal.status) {
      case "ACTIVE":
        return { color: "text-primary", bg: "bg-primary-bg", label: "Active" };
      case "COMPLETED":
        return {
          color: "text-success",
          bg: "bg-success-bg",
          label: "Completed",
        };
      case "OVERDUE":
        return {
          color: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-950",
          label: "Overdue",
        };
      case "PAUSED":
        return {
          color: "text-slate-500",
          bg: "bg-slate-100 dark:bg-slate-800",
          label: "Paused",
        };
      case "FAILED":
        return { color: "text-danger", bg: "bg-danger-bg", label: "Failed" };
      case "ARCHIVED":
        return { color: "text-text-muted", bg: "bg-border", label: "Archived" };
      default:
        return { color: "text-text-muted", bg: "bg-bg", label: goal.status };
    }
  };

  const priorityConfig = getPriorityConfig();
  const statusConfig = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className="bg-surface rounded-2xl border border-border shadow-sm p-6 overflow-hidden relative"
        style={{
          borderLeftWidth: "4px",
          borderLeftColor: goal.color || "#6366F1",
        }}
      >
        <Link
          href="/goals"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text mb-6 transition-all group"
        >
          <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
            <ArrowLeft size={16} />
          </motion.div>
          <span className="group-hover:underline">Back to goals</span>
        </Link>

        <div className="flex items-start gap-5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg"
            style={{
              backgroundColor: `${goal.color || "#9FA1FF"}20`,
              border: `2px solid ${goal.color || "#9FA1FF"}30`,
            }}
          >
            {goal.icon ? (
              <span className="text-3xl">{goal.icon}</span>
            ) : (
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: goal.color || "#9FA1FF" }}
              />
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-3">
                {error && (
                  <div className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-3 text-sm flex items-center gap-2">
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}

                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold text-text bg-bg border-2 border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary"
                  placeholder="Goal title"
                />

                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full text-sm text-text-secondary bg-bg border-2 border-border rounded-xl px-3 py-2 focus:outline-none focus:border-primary resize-none"
                  placeholder="Description (optional)"
                />

                {isOverdue && (
                  <p className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                    ⚠️ Overdue goals can only edit title, description, and
                    color. Extend the due date to unlock full editing.
                  </p>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Priority */}
                  {canEditDates && (
                    <select
                      value={editPriority}
                      onChange={(e) =>
                        setEditPriority(e.target.value as Priority)
                      }
                      className="px-3 py-2 rounded-xl border-2 border-border bg-bg text-sm text-text focus:outline-none focus:border-primary"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  )}

                  {/* Color - Inline Color Picker */}
                  <div className="relative">
                    <label className="block text-[10px] font-semibold text-text-muted mb-1">
                      Color
                    </label>
                    <ColorPicker value={editColor} onChange={setEditColor} />
                  </div>
                </div>

                {/* Due Date */}
                {canEditDates && (
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Due Date{" "}
                      {goal.endDate && (
                        <span className="text-text-muted">
                          (cannot remove, only change)
                        </span>
                      )}
                    </label>

                    {editEndDate ? (
                      <button
                        type="button"
                        onClick={() => setShowEndCalendar(true)}
                        className="w-full flex items-center gap-3 p-3 bg-primary-bg/20 rounded-xl border border-primary/20 hover:bg-primary-bg/30 transition-colors"
                      >
                        <CalendarIcon size={16} className="text-primary" />
                        <span className="text-sm font-medium text-primary flex-1 text-left">
                          {format(new Date(editEndDate), "EEE, MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-primary/70">Change</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowEndCalendar(true)}
                        className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-primary/30 hover:text-text transition-all text-sm"
                      >
                        <CalendarIcon size={16} /> Pick a due date
                      </button>
                    )}

                    {showEndCalendar && (
                      <div className="mt-2">
                        <Calendar
                          selectedDate={
                            editEndDate ? new Date(editEndDate) : null
                          }
                          onDateSelect={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const startDate = goal.startDate
                              ? new Date(goal.startDate)
                              : today;
                            startDate.setHours(0, 0, 0, 0);

                            if (date <= startDate) return;

                            setEditEndDate(format(date, "yyyy-MM-dd"));
                            setShowEndCalendar(false);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowEndCalendar(false)}
                          className="mt-2 w-full py-2 text-xs text-text-muted hover:text-text transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {editEndDate && canEditDates && (
                  <p className="text-[11px] text-amber-500 bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
                    ⚠️ Miss the deadline? Your goal goes {"Overdue"} for 30
                    days, then auto-fails. Choose wisely!
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isSaving || !editTitle.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {isSaving ? "Saving..." : "Save"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-border text-text-secondary rounded-xl text-sm font-semibold hover:bg-border-light"
                  >
                    <X size={14} /> Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text">{goal.title}</h1>
                  {canEdit && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors"
                      title="Edit goal"
                    >
                      <Pencil size={16} />
                    </motion.button>
                  )}
                </div>
                {goal.description && (
                  <p className="text-text-secondary mt-2 leading-relaxed">
                    {goal.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border} flex items-center gap-1.5`}
                  >
                    <Flag size={12} /> {goal.priority}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                  {goal.category && (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg text-text-secondary border border-border">
                      {goal.category}
                    </span>
                  )}
                  {goal.endDate && (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg text-text-secondary border border-border flex items-center gap-1.5">
                      <CalendarIcon size={12} /> Due{" "}
                      {new Date(goal.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
