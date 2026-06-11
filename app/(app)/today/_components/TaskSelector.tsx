"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { useTaskStore } from "@/store/taskStore";
import { Goal, Task } from "@/types";
import {
  X,
  CheckCircle2,
  ChevronDown,
  Layers,
  Search,
  Loader2,
} from "lucide-react";
import { taskService } from "@/lib/services/taskService";
import { useDataStore } from "@/store/dataStore";

interface TaskSelectorProps {
  goals: Goal[];
}

export function TaskSelector({ goals }: TaskSelectorProps) {
  const { selectedTask, setSelectedTask, clearSelection, runningTimer } =
    useTimerStore();
  const { localCompletedIds, markComplete } = useTaskStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Get all store state
  const localTasks = useTaskStore((s) => s.localTasks);
  const updatedTasks = useTaskStore((s) => s.updatedTasks);
  const deletedTaskIds = useTaskStore((s) => s.deletedTaskIds);

  const isRunning = runningTimer?.status === "RUNNING";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsOpen(false);
    setSearch("");
  };

  const getAllTasksFromGoal = (goal: Goal): (Task & { goal: Goal })[] => {
    // Local tasks for this goal (filter out deleted)
    const localGoalTasks = (localTasks.get(goal.id) || []).filter(
      (t) => !deletedTaskIds.has(t.id),
    );

    // Server tasks (deduplicate, filter deleted, apply updates)
    const localIds = new Set(localGoalTasks.map((t) => t.id));
    const serverTasks = (goal.tasks || [])
      .filter((t) => !localIds.has(t.id))
      .filter((t) => !deletedTaskIds.has(t.id))
      .filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS")
      .filter((t) => !localCompletedIds.has(t.id))
      .map((task) => {
        // Apply updates from store
        const updates = updatedTasks.get(task.id);
        return { ...task, ...updates, goal };
      });

    // Active local tasks
    const activeLocalTasks = localGoalTasks
      .filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS")
      .filter((t) => !localCompletedIds.has(t.id))
      .map((task) => {
        const updates = updatedTasks.get(task.id);
        return { ...task, ...updates, goal };
      });

    // Recurse into children
    const childTasks = (goal.children || []).flatMap((child) =>
      getAllTasksFromGoal(child),
    );

    return [...activeLocalTasks, ...serverTasks, ...childTasks];
  };

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");

  const allTasks = activeGoals.flatMap((goal) => getAllTasksFromGoal(goal));

  const filteredTasks = search
    ? allTasks.filter((t) =>
        t.title.toLowerCase().includes(search.toLowerCase()),
      )
    : allTasks;

  const selectedGoal = selectedTask
    ? activeGoals.find((g) => g.id === selectedTask.goalId)
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          selectedTask
            ? "bg-primary-bg text-primary shadow-sm"
            : "bg-bg border-2 border-dashed border-border text-text-secondary hover:border-primary/50 hover:text-text"
        }`}
      >
        {selectedTask ? (
          <>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-surface"
              style={{
                backgroundColor:
                  selectedTask.color || selectedGoal?.color || "#9FA1FF",
              }}
            />
            <CheckCircle2 size={16} />
            <span className="max-w-[150px] truncate font-medium">
              {selectedTask.title}
            </span>
            {selectedGoal && (
              <span className="text-xs text-text-muted truncate max-w-[100px] bg-bg px-2 py-0.5 rounded-full">
                {selectedGoal.title}
              </span>
            )}
            {!isRunning && (
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="p-0.5 hover:bg-danger-bg rounded-md transition-colors"
              >
                <X size={14} className="text-text-muted hover:text-danger" />
              </motion.div>
            )}
          </>
        ) : (
          <>
            <div className="p-1 rounded-md bg-primary-bg">
              <Layers size={16} className="text-primary" />
            </div>
            <span className="max-w-[150px] truncate">Select a task</span>
          </>
        )}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="text-text-muted flex-shrink-0" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 w-80 bg-surface rounded-2xl border border-border shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 px-3 py-2 bg-bg rounded-xl">
                <Search size={14} className="text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tasks..."
                  className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Layers size={24} className="text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">No tasks found</p>
                  <p className="text-xs text-text-muted mt-1">
                    Add tasks to your goals first
                  </p>
                </div>
              ) : (
                (() => {
                  const groupedByGoal = new Map<
                    string,
                    { goal: Goal; tasks: (Task & { goal: Goal })[] }
                  >();

                  filteredTasks.forEach((task) => {
                    const goalId = task.goal?.id || task.goalId || "unknown";
                    if (!groupedByGoal.has(goalId)) {
                      groupedByGoal.set(goalId, { goal: task.goal, tasks: [] });
                    }
                    groupedByGoal.get(goalId)!.tasks.push(task);
                  });

                  return Array.from(groupedByGoal.values()).map(
                    ({ goal, tasks }) => (
                      <div key={goal.id} className="mb-1">
                        <div className="flex items-center gap-2 px-3 py-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: goal.color || "#9FA1FF" }}
                          />
                          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider flex-1 truncate">
                            {goal.title}
                          </span>
                          <span className="text-[10px] text-text-muted bg-bg px-2 py-0.5 rounded-full">
                            {tasks.length}
                          </span>
                        </div>
                        <div className="ml-4 border-l-2 border-border/50 pl-3 space-y-0.5">
                          {tasks.map((task) => (
                            <div key={task.id} className="relative group">
                              <motion.button
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectTask(task)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                                  selectedTask?.id === task.id
                                    ? "bg-primary-bg text-primary"
                                    : "hover:bg-bg text-text-secondary hover:text-text"
                                }`}
                              >
                                <CheckCircle2
                                  size={16}
                                  className={`flex-shrink-0 ${selectedTask?.id === task.id ? "text-primary" : "text-text-muted"}`}
                                />
                                <span className="text-sm truncate flex-1 font-medium">
                                  {task.title}
                                </span>
                                {task.estimatedMinutes && (
                                  <span className="text-[10px] text-text-muted bg-bg px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                                    {task.estimatedMinutes}m
                                  </span>
                                )}
                                {task.priority === "URGENT" && (
                                  <span className="w-2 h-2 rounded-full bg-danger flex-shrink-0 animate-pulse" />
                                )}
                              </motion.button>
                              <div
                                // In the complete button onClick:
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (completingId) return;
                                  setCompletingId(task.id);
                                  try {
                                    await taskService.update(task.id, {
                                      status: "COMPLETED",
                                    });
                                    markComplete(task.id);
                                    useTaskStore
                                      .getState()
                                      .updateTask(task.id, {
                                        status: "COMPLETED",
                                      });

                                    useDataStore
                                      .getState()
                                      .updateTaskInCache(task.id, {
                                        status: "COMPLETED",
                                      });

                                    // If this was the selected task, find next
                                    if (selectedTask?.id === task.id) {
                                      // Use fresh data that includes local tasks
                                      const freshLocalTasks =
                                        useTaskStore.getState().localTasks;
                                      const freshUpdatedTasks =
                                        useTaskStore.getState().updatedTasks;
                                      const freshCompletedIds =
                                        useTaskStore.getState()
                                          .localCompletedIds;

                                      const getAllFreshTasks = (
                                        goalList: Goal[],
                                      ): (Task & { goal: Goal })[] => {
                                        return goalList.flatMap((g) => {
                                          const localGoalTasks = (
                                            freshLocalTasks.get(g.id) || []
                                          )
                                            .filter(
                                              (t) =>
                                                !freshCompletedIds.has(t.id),
                                            )
                                            .filter(
                                              (t) =>
                                                t.status === "TODO" ||
                                                t.status === "IN_PROGRESS",
                                            )
                                            .map((t) => ({ ...t, goal: g }));

                                          const localIds = new Set(
                                            localGoalTasks.map((t) => t.id),
                                          );
                                          const serverTasks = (g.tasks || [])
                                            .filter((t) => !localIds.has(t.id))
                                            .filter(
                                              (t) =>
                                                t.status === "TODO" ||
                                                t.status === "IN_PROGRESS",
                                            )
                                            .filter(
                                              (t) =>
                                                !freshCompletedIds.has(t.id),
                                            )
                                            .map((t) => {
                                              const updates =
                                                freshUpdatedTasks.get(t.id);
                                              return {
                                                ...(updates
                                                  ? { ...t, ...updates }
                                                  : t),
                                                goal: g,
                                              };
                                            });

                                          const childTasks = getAllFreshTasks(
                                            g.children || [],
                                          );
                                          return [
                                            ...localGoalTasks,
                                            ...serverTasks,
                                            ...childTasks,
                                          ];
                                        });
                                      };

                                      const remaining = getAllFreshTasks(
                                        activeGoals,
                                      ).filter((t) => t.id !== task.id);

                                      if (remaining.length > 0) {
                                        handleSelectTask(remaining[0]);
                                      } else {
                                        // No tasks left - stop timer or end session
                                        const timerState =
                                          useTimerStore.getState();
                                        clearSelection();
                                        if (
                                          timerState.timerMode === "POMODORO" &&
                                          timerState.pomodoroState
                                        ) {
                                          await timerState.endPomodoroSession();
                                        } else if (timerState.runningTimer) {
                                          timerState.pause();
                                        }
                                        clearSelection();
                                      }
                                    }
                                  } catch {
                                    // Toast will go here
                                  } finally {
                                    setCompletingId(null);
                                  }
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-success-bg text-text-muted hover:text-success transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Mark complete"
                              >
                                {completingId === task.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={14} />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  );
                })()
              )}
            </div>
            <div className="p-3 border-t border-border bg-bg">
              <p className="text-[10px] text-text-muted text-center">
                {filteredTasks.length} task
                {filteredTasks.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
