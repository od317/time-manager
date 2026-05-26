"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Goal, Task, Priority } from "@/types";
import { goalService } from "@/lib/services";
import { taskService } from "@/lib/services/taskService";
import { Plus, CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";

interface GoalTasksProps {
  goal: Goal;
}

export function GoalTasks({ goal }: GoalTasksProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tasks = goal.tasks || [];
  const activeTasks = tasks.filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
  );
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await taskService.create({
        title: title.trim(),
        goalId: goal.id,
        priority,
        estimatedMinutes: estimatedMinutes
          ? parseInt(estimatedMinutes)
          : undefined,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setEstimatedMinutes("");
      setDueDate("");
      setShowForm(false);
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      await taskService.update(task.id, { status: newStatus });
      router.refresh();
    } catch {
      // Handle error
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.delete(taskId);
      router.refresh();
    } catch {
      // Handle error
    }
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">
          Tasks ({tasks.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium transition-all"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Create task form */}
      {showForm && (
        <form
          onSubmit={handleCreateTask}
          className="mb-4 p-4 bg-bg rounded-lg border border-border space-y-3"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1">
                Est. Minutes
              </label>
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="e.g., 30"
                min="1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">
              Due Date (optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 px-4 border border-border text-text-secondary rounded-lg text-sm font-medium hover:bg-border-light transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 py-2 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>
      )}

      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-1 mb-4">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border hover:border-primary/20 transition-all group"
            >
              <button
                onClick={() => handleToggleTask(task)}
                className="text-text-muted hover:text-success transition-all flex-shrink-0"
              >
                <Circle size={20} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {task.estimatedMinutes && (
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={10} />
                      {task.estimatedMinutes}m
                    </span>
                  )}
                  {task.priority && task.priority !== "MEDIUM" && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        task.priority === "URGENT"
                          ? "bg-danger-bg text-danger"
                          : task.priority === "HIGH"
                            ? "bg-warning-bg text-warning"
                            : "bg-primary-bg text-primary"
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <p className="text-xs text-text-muted font-medium mb-2">
            Completed ({completedTasks.length})
          </p>
          <div className="space-y-1">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-success-bg/30 border border-success/10"
              >
                <button
                  onClick={() => handleToggleTask(task)}
                  className="text-success flex-shrink-0"
                >
                  <CheckCircle2 size={20} />
                </button>
                <span className="text-sm text-text-secondary line-through truncate flex-1">
                  {task.title}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-text-muted hover:text-danger transition-all flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tasks.length === 0 && !showForm && (
        <p className="text-sm text-text-muted text-center py-6">
          No tasks yet. Break down your goal into actionable steps.
        </p>
      )}
    </div>
  );
}
