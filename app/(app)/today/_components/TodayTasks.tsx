"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Task, Goal } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { useTimerStore } from "@/store/timerStore";
import {
  CheckCircle2,
  Clock,
  Play,
  ChevronRight,
  CheckSquare,
  ChevronDown,
  ListTodo,
} from "lucide-react";
import { TaskEditModal } from "./TaskEditModal";
import { TaskItem } from "@/components/tasks/TaskItem";
import { useTaskStore } from "@/store/taskStore";

interface TodayTasksProps {
  tasks: Task[];
  goals: Goal[];
}

export function TodayTasks({ tasks, goals }: TodayTasksProps) {
  const { setSelectedTask } = useTimerStore();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const { localCompletedIds, markComplete } = useTaskStore();
  const localTasks = useTaskStore((s) => s.localTasks);
  const updatedTasks = useTaskStore((s) => s.updatedTasks);
  const deletedTaskIds = useTaskStore((s) => s.deletedTaskIds);

  // Get locally added tasks that are due today (or have no due date)
  const todayStr = new Date().toLocaleDateString("en-CA");
  const localTasksForToday = Array.from(localTasks.values())
    .flat()
    .filter((t) => !deletedTaskIds.has(t.id))
    .filter((t) => {
      if (!t.dueDate) return false; // ← No due date = don't show here
      return new Date(t.dueDate).toLocaleDateString("en-CA") === todayStr;
    })
    .filter((t) => !localCompletedIds.has(t.id));

  // Merge with server tasks (deduplicate by id)
  const localIds = new Set(localTasksForToday.map((t) => t.id));
  const serverTasks = tasks.filter((t) => !localIds.has(t.id));

  // After computing allVisibleTasks, apply updates and filter deleted:
  const allVisibleTasks = [...localTasksForToday, ...serverTasks]
    .filter((t) => !deletedTaskIds.has(t.id)) // Hide deleted
    .map((t) => {
      const updates = updatedTasks.get(t.id);
      return updates ? { ...t, ...updates } : t;
    });

  const visibleTasks = allVisibleTasks;

  const handleToggle = async (task: Task) => {
    setCompletingId(task.id);
    try {
      const newStatus = task.status === "COMPLETED" ? "TODO" : "COMPLETED";
      await taskService.update(task.id, { status: newStatus });
      if (newStatus === "COMPLETED") {
        markComplete(task.id);
      }
      useTaskStore.getState().updateTask(task.id, { status: newStatus });
      // Remove router.refresh()
    } catch {
      // Handle silently
    } finally {
      setCompletingId(null);
    }
  };

  const handleStartTimer = (task: Task) => {
    setSelectedTask(task);
    document
      .querySelector("#focus-timer")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleGoalCollapse = (goalId: string) => {
    setCollapsedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  const tasksByGoal = new Map<
    string,
    { goal: Goal | undefined; tasks: Task[] }
  >();
  const unassignedTasks: Task[] = [];

  visibleTasks.forEach((task) => {
    if (task.goalId) {
      const goal = goals.find((g) => g.id === task.goalId);
      if (!tasksByGoal.has(task.goalId)) {
        tasksByGoal.set(task.goalId, { goal, tasks: [] });
      }
      tasksByGoal.get(task.goalId)!.tasks.push(task);
    } else {
      unassignedTasks.push(task);
    }
  });

  tasksByGoal.forEach((group) => {
    group.tasks.sort((a, b) => {
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
      return 0;
    });
  });

  const totalTasks = visibleTasks.length;
  const completedTasks = visibleTasks.filter(
    (t) => t.status === "COMPLETED",
  ).length;

  if (visibleTasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-5"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-success-bg">
            <CheckSquare size={18} className="text-success" />
          </div>
          <h3 className="text-sm font-bold text-text">Focus Tasks</h3>
        </div>
        <div className="text-center py-8">
          <ListTodo
            size={32}
            className="text-text-muted mx-auto mb-3 opacity-50"
          />
          <p className="text-sm text-text-muted font-medium">No tasks yet</p>
          <p className="text-xs text-text-muted mt-1">
            Add tasks to your goals to see them here
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-success-bg">
            <CheckSquare size={18} className="text-success" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-text">Focus Tasks</h3>
            <p className="text-xs text-text-muted">
              {completedTasks} of {totalTasks} completed
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-text-muted" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Unassigned tasks */}
              {unassignedTasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
                    Unassigned
                  </p>
                  <div className="space-y-1.5">
                    <AnimatePresence mode="popLayout">
                      {unassignedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          isCompleting={completingId === task.id}
                          onToggle={handleToggle}
                          onStartTimer={handleStartTimer}
                          onEdit={setEditingTask}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Tasks grouped by goal */}
              {Array.from(tasksByGoal.entries()).map(([goalId, group]) => {
                const isCollapsed = collapsedGoals.has(goalId);
                const completedInGroup = group.tasks.filter(
                  (t) => t.status === "COMPLETED",
                ).length;

                return (
                  <div key={goalId}>
                    {group.goal && (
                      <motion.button
                        whileHover={{ x: 2 }}
                        onClick={() => toggleGoalCollapse(goalId)}
                        className="w-full flex items-center gap-3 px-2 py-2 hover:bg-bg rounded-xl transition-all group mb-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-surface"
                          style={{
                            backgroundColor: group.goal.color || "#9FA1FF",
                          }}
                        />
                        <Link
                          href={`/goals/${group.goal.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-semibold text-text hover:text-primary transition-all truncate flex-1"
                        >
                          {group.goal.title}
                        </Link>
                        <span className="text-xs font-medium text-text-muted bg-bg px-2 py-0.5 rounded-full">
                          {completedInGroup}/{group.tasks.length}
                        </span>
                        <motion.div
                          animate={{ rotate: isCollapsed ? 0 : 90 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight size={16} className="text-text-muted" />
                        </motion.div>
                      </motion.button>
                    )}

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1.5 ml-6 border-l-2 border-border/50 pl-4">
                            {group.tasks.map((task) => (
                              <TaskItem
                                key={task.id}
                                task={task}
                                isCompleting={completingId === task.id}
                                onToggle={handleToggle}
                                onStartTimer={handleStartTimer}
                                onEdit={setEditingTask}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </motion.div>
  );
}
