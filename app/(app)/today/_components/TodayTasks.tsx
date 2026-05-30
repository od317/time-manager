"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Task, Goal } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { useTimerStore } from "@/store/timerStore";
import {
  CheckCircle2,
  Circle,
  Clock,
  Play,
  ChevronRight,
  Pencil,
  CheckSquare,
  ChevronDown,
} from "lucide-react";
import { TaskEditModal } from "./TaskEditModal";
import { TaskItem } from "@/components/tasks/TaskItem";

interface TodayTasksProps {
  tasks: Task[];
  goals: Goal[];
}

export function TodayTasks({ tasks, goals }: TodayTasksProps) {
  const router = useRouter();
  const { setSelectedTask } = useTimerStore();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const handleToggle = async (task: Task) => {
    setCompletingId(task.id);
    try {
      await taskService.update(task.id, {
        status: task.status === "COMPLETED" ? "TODO" : "COMPLETED",
      });
      router.refresh();
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

  // Group tasks by goal
  const tasksByGoal = new Map<
    string,
    { goal: Goal | undefined; tasks: Task[] }
  >();
  const unassignedTasks: Task[] = [];

  tasks.forEach((task) => {
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

  // Sort tasks within each goal: incomplete first, then completed
  tasksByGoal.forEach((group) => {
    group.tasks.sort((a, b) => {
      if (a.status === "COMPLETED" && b.status !== "COMPLETED") return 1;
      if (a.status !== "COMPLETED" && b.status === "COMPLETED") return -1;
      return 0;
    });
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

  if (tasks.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-text mb-4">Tasks</h3>
        <p className="text-sm text-text-muted text-center py-8">
          No tasks yet. Add tasks to your goals to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <CheckSquare size={18} className="text-success" />
          <h3 className="text-sm font-semibold text-text">Focus Tasks</h3>
          <span className="text-xs text-text-muted">
            {completedTasks}/{totalTasks}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown size={18} className="text-text-muted" />
        ) : (
          <ChevronRight size={18} className="text-text-muted" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Unassigned tasks */}
          {unassignedTasks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
                No Goal
              </p>
              <div className="space-y-1">
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
                  <button
                    onClick={() => toggleGoalCollapse(goalId)}
                    className="w-full flex items-center gap-2 px-1 py-1 mb-2 hover:bg-bg rounded-lg transition-all group"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: group.goal.color || "#6366F1" }}
                    />
                    <Link
                      href={`/goals/${group.goal.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-medium text-text hover:text-primary transition-all truncate"
                    >
                      {group.goal.title}
                    </Link>
                    <span className="text-xs text-text-muted flex-shrink-0">
                      {completedInGroup}/{group.tasks.length}
                    </span>
                    <ChevronRight
                      size={14}
                      className={`text-text-muted transition-transform flex-shrink-0 ${
                        isCollapsed ? "" : "rotate-90"
                      }`}
                    />
                  </button>
                )}

                {!isCollapsed && (
                  <div className="space-y-1 ml-2">
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}
