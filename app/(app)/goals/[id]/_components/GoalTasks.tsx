"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Task, Priority } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { TaskEditModal } from "@/app/(app)/today/_components/TaskEditModal";
import { Plus, ListTodo, X, Calendar, Clock } from "lucide-react";
import { TaskItem } from "@/components/tasks/TaskItem";

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
  const [editingTask, setEditingTask] = useState<Task | null>(null);

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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary-bg hover:bg-primary hover:text-white rounded-xl transition-all"
        >
          <Plus size={16} />
          Add Task
        </motion.button>
      </div>

      {/* Create task form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
            onSubmit={handleCreateTask}
          >
            <div className="mx-6 mb-4 p-5 bg-bg rounded-2xl border-2 border-dashed border-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-text">New Task</h4>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowForm(false)}
                  className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors"
                >
                  <X size={16} />
                </motion.button>
              </div>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
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
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-surface text-sm text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium"
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
                      className="w-full px-3 py-2.5 pl-9 rounded-xl border-2 border-border bg-surface text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <Clock
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1.5">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 pl-9 rounded-xl border-2 border-border bg-surface text-sm text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <Calendar
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 px-4 border-2 border-border text-text-secondary rounded-xl text-sm font-semibold hover:bg-border-light transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSubmitting || !title.trim()}
                  className="flex-1 py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Add Task
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Tasks list */}
      <div className="px-6 pb-6">
        {activeTasks.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <AnimatePresence mode="popLayout">
              {activeTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={setEditingTask}
                  onDelete={(t) => handleDeleteTask(t.id)}
                  showGoalColor
                  goalColor={goal.color || "#9FA1FF"}
                />
              ))}
            </AnimatePresence>
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
                />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && !showForm && (
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

      {/* Edit Modal */}
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
