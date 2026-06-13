"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Task, Priority } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { TaskEditModal } from "@/app/(app)/today/_components/TaskEditModal";
import { Calendar } from "@/components/calendar/Calendar";
import {
  Plus,
  ListTodo,
  X,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react";
import { TaskItem } from "@/components/tasks/TaskItem";
import { format } from "date-fns";
import { useTaskStore } from "@/store/taskStore";
import { useDataStore } from "@/store/dataStore";
import { useTimerStore } from "@/store/timerStore";
import { useBulkTaskSelection } from "@/hooks/useBulkTaskSelection";
import { TaskFormWithQueue } from "@/components/tasks/TaskFormWithQueue";

interface GoalTasksProps {
  goal: Goal;
}

export function GoalTasks({ goal }: GoalTasksProps) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    selectMode,
    selectedTasks,
    isLoading: bulkLoading,
    toggleTask: toggleBulkSelect,
    isSelected: isBulkSelected,
    bulkComplete,
    bulkDelete,
    error,
  } = useBulkTaskSelection(goal.id);

  const tasks = goal.tasks || [];

  const localGoalTasks = useTaskStore((s) => s.localTasks.get(goal.id)) || [];
  const deletedTaskIds = useTaskStore((s) => s.deletedTaskIds);

  const localIds = new Set(localGoalTasks.map((t) => t.id));
  const serverTasks = (goal.tasks || [])
    .filter((t) => !localIds.has(t.id))
    .filter((t) => !deletedTaskIds.has(t.id));

  const updatedTasks = useTaskStore((s) => s.updatedTasks);

  // Apply updates to tasks before filtering
  const allTasks = [...localGoalTasks, ...serverTasks].map((t) => {
    const updates = updatedTasks.get(t.id);
    return updates ? { ...t, ...updates } : t;
  });

  const activeTasks = allTasks.filter(
    (t) =>
      (t.status === "TODO" ||
        t.status === "IN_PROGRESS" ||
        t.status === "OVERDUE") &&
      t.id !== togglingId, // Don't move if currently toggling
  );
  const completedTasks = allTasks.filter(
    (t) => t.status === "COMPLETED" && t.id !== togglingId, // Don't move if currently toggling
  );

  const togglingTask = togglingId
    ? allTasks.find((t) => t.id === togglingId)
    : null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const dueDate = selectedDate
        ? selectedTime
          ? new Date(
              `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`,
            ).toISOString()
          : format(selectedDate, "yyyy-MM-dd") + "T00:00:00.000Z"
        : undefined;

      const taskResponse = await taskService.create({
        title: title.trim(),
        goalId: goal.id,
        priority,
        estimatedMinutes: estimatedMinutes
          ? parseInt(estimatedMinutes)
          : undefined,
        dueDate,
      });

      // Add to store for instant UI update
      useTaskStore.getState().addTask(goal.id, taskResponse as Task);
      useDataStore.getState().addTaskToCache(goal.id, taskResponse as Task);

      setTitle("");
      setEstimatedMinutes("");
      setSelectedDate(null);
      setSelectedTime("");
      setShowForm(false);
      // Remove router.refresh()
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    setTogglingId(task.id);
    const newStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
    try {
      await taskService.update(task.id, { status: newStatus });

      if (newStatus === "COMPLETED") {
        useTaskStore.getState().markComplete(task.id);

        // If this was the selected task in the timer, find next task
        const timerState = useTimerStore.getState();
        if (timerState.selectedTask?.id === task.id) {
          const nextTask = activeTasks.find(
            (t) => t.id !== task.id && t.status !== "COMPLETED",
          );
          if (nextTask) {
            useTimerStore.getState().setSelectedTask(nextTask);
          } else {
            // No tasks left - pause the timer
            useTimerStore.getState().clearSelection();
            if (
              timerState.timerMode === "POMODORO" &&
              timerState.pomodoroState
            ) {
              await timerState.endPomodoroSession();
            } else if (timerState.runningTimer) {
              timerState.pause();
            }
          }
        }
      } else {
        useTaskStore.getState().unmarkComplete(task.id);
      }

      useTaskStore.getState().updateTask(task.id, { status: newStatus });
      useDataStore.getState().updateTaskInCache(task.id, { status: newStatus });
    } catch {
      // Handle error
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      await taskService.delete(taskId);
      useTaskStore.getState().removeTask(taskId, goal.id);
      useDataStore.getState().removeTaskFromCache(taskId, goal.id);
    } catch {
      // Handle error
    } finally {
      setDeletingId(null);
    }
  };

  const formatDisplayTime = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-bg">
            <ListTodo size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">Tasks</h3>
            <p className="text-xs text-text-muted">{tasks.length} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {goal.status !== "COMPLETED" && goal.status !== "FAILED" && (
            <>
              <button
                onClick={() => {
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary-bg hover:bg-primary hover:text-white rounded-xl transition-all"
              >
                <Plus size={16} /> Add Tasks
              </button>
            </>
          )}
        </div>
      </div>

      {selectMode && selectedTasks.size > 0 && (
        <div className="px-6 pb-3 space-y-2">
          {error && (
            <div className="text-xs text-danger bg-danger-bg px-3 py-1.5 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">
              {selectedTasks.size} selected
            </span>
            <button
              onClick={bulkComplete}
              disabled={bulkLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-success-bg text-success rounded-lg text-xs font-semibold hover:bg-success/10 transition-all disabled:opacity-50"
            >
              {bulkLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CheckCircle2 size={12} />
              )}
              Complete
            </button>
            <button
              onClick={bulkDelete}
              disabled={bulkLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-danger-bg text-danger rounded-lg text-xs font-semibold hover:bg-danger/10 transition-all disabled:opacity-50"
            >
              {bulkLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              Delete
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <TaskFormWithQueue
            goalId={goal.id}
            goalColor={goal.color || undefined}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Tasks list */}
      <div className="px-6 pb-6">
        {activeTasks.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {activeTasks.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {activeTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggleTask}
                    onEdit={setEditingTask}
                    onDelete={(t) => handleDeleteTask(t.id)}
                    showGoalColor
                    goalColor={goal.color || "#9FA1FF"}
                    isCompleting={togglingId === task.id}
                    isDeleting={deletingId === task.id}
                    isSelected={isBulkSelected(task.id)}
                    onSelect={() => toggleBulkSelect(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Show toggling task in its original section during transition */}
        {togglingTask && togglingTask.status !== "COMPLETED" && (
          <div className="space-y-1.5 mb-4">
            <TaskItem
              task={togglingTask}
              onToggle={handleToggleTask}
              onEdit={setEditingTask}
              onDelete={(t) => handleDeleteTask(t.id)}
              showGoalColor
              goalColor={goal.color || "#9FA1FF"}
              isCompleting={true}
              isDeleting={false}
            />
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Completed ({completedTasks.length})
              </p>
            </div>
            <div className="space-y-1.5">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={setEditingTask}
                  onDelete={(t) => handleDeleteTask(t.id)}
                  isDeleting={deletingId === task.id}
                />
              ))}
            </div>
          </div>
        )}

        {togglingTask && togglingTask.status === "COMPLETED" && (
          <div className="space-y-1.5">
            <TaskItem
              task={togglingTask}
              onToggle={handleToggleTask}
              onEdit={setEditingTask}
              onDelete={(t) => handleDeleteTask(t.id)}
              showGoalColor
              goalColor={goal.color || "#9FA1FF"}
              isCompleting={true}
              isDeleting={false}
            />
          </div>
        )}

        {allTasks.length === 0 && !showForm && (
          <div className="text-center py-10">
            <ListTodo
              size={32}
              className="text-text-muted mx-auto mb-3 opacity-50"
            />
            <p className="text-sm text-text-muted font-medium">No tasks yet</p>
            <p className="text-xs text-text-muted mt-1">
              Break down your goal into actionable steps
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingTask && (
          <TaskEditModal
            task={editingTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
