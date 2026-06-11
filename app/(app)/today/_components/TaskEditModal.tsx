"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task, Priority } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { useTaskStore } from "@/store/taskStore";
import { X, Trash2, AlertTriangle } from "lucide-react";
import { useDataStore } from "@/store/dataStore";

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
}

const priorities: {
  value: Priority;
  label: string;
  color: string;
  bg: string;
}[] = [
  { value: "LOW", label: "Low", color: "bg-priority-low", bg: "bg-blue-50" },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "bg-priority-medium",
    bg: "bg-indigo-50",
  },
  {
    value: "HIGH",
    label: "High",
    color: "bg-priority-high",
    bg: "bg-amber-50",
  },
  {
    value: "URGENT",
    label: "Urgent",
    color: "bg-priority-urgent",
    bg: "bg-red-50",
  },
];

export function TaskEditModal({ task, onClose }: TaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState<Priority>(
    (task.priority as Priority) || "MEDIUM",
  );
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    task.estimatedMinutes?.toString() || "",
  );
  const [dueDate, setDueDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await taskService.update(task.id, {
        title: title.trim(),
        priority,
        estimatedMinutes: estimatedMinutes
          ? parseInt(estimatedMinutes)
          : undefined,
        dueDate: dueDate || undefined,
      });

      // Update task locally in the store
      useTaskStore.getState().updateTask(task.id, {
        title: title.trim(),
        priority,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        dueDate: dueDate || null,
      });

      useDataStore.getState().updateTaskInCache(task.id, {
        title: title.trim(),
        priority,
        estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
        dueDate: dueDate || null,
      });

      onClose();
    } catch {
      setError("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await taskService.delete(task.id);

      // Remove task locally from the store
      useTaskStore.getState().removeTask(task.id, task.goalId!);
      useDataStore.getState().removeTaskFromCache(task.id, task.goalId!);

      onClose();
    } catch {
      setError("Failed to delete task");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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
          className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-surface z-10">
            <div>
              <h3 className="text-lg font-bold text-text">Edit Task</h3>
              <p className="text-xs text-text-muted mt-0.5">{task.title}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
            >
              <X size={18} />
            </motion.button>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-3 text-sm font-medium flex items-center gap-2"
                >
                  <AlertTriangle size={16} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
              autoFocus
            />

            {/* Priority & Est. Time */}
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
                  Est. Time (min)
                </label>
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="30"
                  min="1"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-bg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-bg text-sm text-text focus:outline-none focus:border-primary"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2.5 border-2 border-danger/30 text-danger rounded-xl text-sm font-semibold hover:bg-danger-bg transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </motion.button>
              <div className="flex-1 flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 border-2 border-border text-text-secondary rounded-xl text-sm font-semibold hover:bg-border-light transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </motion.button>
              </div>
            </div>
          </form>

          {/* Delete Confirmation */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t-2 border-danger/20 bg-danger-bg/10 p-5"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-danger-bg flex-shrink-0">
                    <AlertTriangle size={18} className="text-danger" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      Delete Task?
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      &quot;{task.title}&quot; will be permanently removed. This
                      cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 px-4 border-2 border-border text-text-secondary rounded-xl text-sm font-semibold hover:bg-border-light transition-all"
                  >
                    Keep Task
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-danger text-white rounded-xl text-sm font-semibold hover:bg-danger/90 disabled:opacity-50 transition-all"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
