"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Task, Priority } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { X, Trash2, AlertTriangle } from "lucide-react";

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
  const router = useRouter();
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
      router.refresh();
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
      router.refresh();
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-bg/50">
            <h3 className="text-lg font-bold text-text">Edit Task</h3>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
            >
              <X size={20} />
            </motion.button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
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
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                autoFocus
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-text mb-2">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {priorities.map((p) => (
                  <motion.button
                    key={p.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPriority(p.value)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      priority === p.value
                        ? `${p.color} text-white shadow-sm`
                        : "bg-bg text-text-secondary border-2 border-border hover:border-primary/30"
                    }`}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Estimated Time & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Est. Time
                </label>
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="30"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-3 border-2 border-danger/30 text-danger rounded-xl font-semibold hover:bg-danger-bg transition-all flex items-center gap-2"
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
                  className="flex-1 py-3 px-4 border-2 border-border text-text-secondary rounded-xl font-semibold hover:bg-border-light transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all"
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
                className="border-t-2 border-danger/20 bg-danger-bg/10 p-6"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-danger-bg">
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
                    className="flex-1 py-2.5 px-4 border-2 border-border text-text-secondary rounded-xl font-semibold hover:bg-border-light transition-all"
                  >
                    Keep Task
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 px-4 bg-danger text-white rounded-xl font-semibold hover:bg-danger/90 disabled:opacity-50 transition-all"
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
