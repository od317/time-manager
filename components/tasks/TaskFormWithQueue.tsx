// components/tasks/TaskFormWithQueue.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Clock,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Priority, Task } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { useTaskStore } from "@/store/taskStore";
import { useDataStore } from "@/store/dataStore";

interface QueuedTask {
  title: string;
  priority: Priority;
  estimatedMinutes: string;
}

interface TaskFormWithQueueProps {
  goalId: string;
  goalColor?: string;
  onClose: () => void;
}

export function TaskFormWithQueue({
  goalId,
  goalColor,
  onClose,
}: TaskFormWithQueueProps) {
  // Current input
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");

  // Task queue
  const [queuedTasks, setQueuedTasks] = useState<QueuedTask[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addToQueue = () => {
    if (!title.trim()) return;
    setQueuedTasks((prev) => [
      ...prev,
      { title: title.trim(), priority, estimatedMinutes },
    ]);
    setTitle("");
    setPriority("MEDIUM");
    setEstimatedMinutes("");
  };

  const removeFromQueue = (index: number) => {
    setQueuedTasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addToQueue();
    }
  };

  const handleSubmit = async () => {
    if (queuedTasks.length === 0) return;
    setError("");

    setIsSubmitting(true);
    try {
      const payload = {
        tasks: queuedTasks.map((t) => ({
          title: t.title,
          goalId,
          priority: t.priority,
          estimatedMinutes: t.estimatedMinutes
            ? parseInt(t.estimatedMinutes)
            : undefined,
        })),
      };

      const createdTasks = await taskService.bulkCreate(payload);

      // Add to stores
      createdTasks.forEach((task) => {
        useTaskStore.getState().addTask(goalId, task);
      });
      useDataStore.getState().bulkAddTasksToCache(goalId, createdTasks);

      onClose();
    } catch {
      setError("Failed to create tasks. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-6 mb-4 p-5 bg-bg rounded-2xl border-2 border-dashed border-border space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text">Add Tasks</h4>
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors"
        >
          <X size={16} />
        </motion.button>
      </div>

      {error && (
        <div className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-3 text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Input row */}
      <div className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
          autoFocus
        />

        <div className="flex items-center gap-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="px-3 py-2 rounded-xl border-2 border-border bg-surface text-sm text-text"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <div className="relative flex-1">
            <input
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              placeholder="Estimated minutes"
              className="w-full px-3 py-2 pl-9 rounded-xl border-2 border-border bg-surface text-sm text-text"
            />
            <Clock
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addToQueue}
            disabled={!title.trim()}
            className="px-4 py-2 bg-primary-bg text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
          >
            <Plus size={16} />
          </motion.button>
        </div>
      </div>

      {/* Queued tasks */}
      <AnimatePresence>
        {queuedTasks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="space-y-2"
          >
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider pt-2 border-t border-border">
              {queuedTasks.length} task{queuedTasks.length !== 1 ? "s" : ""} to
              add
            </div>
            {queuedTasks.map((task, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 p-2.5 bg-surface rounded-lg border border-border"
              >
                <CheckCircle2
                  size={14}
                  className="text-primary flex-shrink-0"
                />
                <span className="text-sm text-text flex-1 truncate">
                  {task.title}
                </span>
                <span className="text-[10px] text-text-muted">
                  {task.priority}
                </span>
                {task.estimatedMinutes && (
                  <span className="text-[10px] text-text-muted">
                    {task.estimatedMinutes}m
                  </span>
                )}
                <button
                  onClick={() => removeFromQueue(index)}
                  className="p-0.5 text-text-muted hover:text-danger"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 px-4 border-2 border-border text-text-secondary rounded-xl text-sm font-semibold hover:bg-border-light transition-all"
        >
          Cancel
        </button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting || queuedTasks.length === 0}
          className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Submit {queuedTasks.length > 0 ? `(${queuedTasks.length})` : ""}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
