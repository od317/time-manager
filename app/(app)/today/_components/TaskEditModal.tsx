"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Task, Priority } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { X, Trash2 } from "lucide-react";

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "LOW", label: "Low", color: "bg-priority-low" },
  { value: "MEDIUM", label: "Medium", color: "bg-priority-medium" },
  { value: "HIGH", label: "High", color: "bg-priority-high" },
  { value: "URGENT", label: "Urgent", color: "bg-priority-urgent" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-text">Edit Task</h3>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="bg-danger-bg text-danger border border-danger/20 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              autoFocus
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    priority === p.value
                      ? `${p.color} text-white`
                      : "bg-bg text-text-secondary border border-border hover:border-primary/30"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g., 30"
              min="1"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 border border-danger/30 text-danger rounded-lg font-medium hover:bg-danger-bg transition-all flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <div className="flex-1 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-border text-text-secondary rounded-lg font-medium hover:bg-border-light transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="border-t border-border p-6">
            <p className="text-sm text-text-secondary mb-4">
              Are you sure you want to delete &quot;{task.title}&quot;? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-border text-text-secondary rounded-lg font-medium hover:bg-border-light transition-all"
              >
                Keep Task
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-danger text-white rounded-lg font-medium hover:bg-danger/90 disabled:opacity-50 transition-all"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
