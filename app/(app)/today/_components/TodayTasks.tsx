"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Task, Goal } from "@/types";
import { taskService } from "@/lib/services/taskService";
import { useTimerStore } from "@/store/timerStore";
import { CheckCircle2, Circle, Clock, Play, ChevronRight } from "lucide-react";

interface TodayTasksProps {
  tasks: Task[];
  goals: Goal[];
}

export function TodayTasks({ tasks, goals }: TodayTasksProps) {
  const router = useRouter();
  const { setSelectedTask } = useTimerStore();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [collapsedGoals, setCollapsedGoals] = useState<Set<string>>(new Set());

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
    <div
      id="focus-timer"
      className="bg-surface rounded-xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Tasks</h3>
        <span className="text-sm text-text-muted">
          {completedTasks}/{totalTasks} done
        </span>
      </div>

      <div className="space-y-4">
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
              {/* Goal header */}
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

              {/* Tasks */}
              {!isCollapsed && (
                <div className="space-y-1 ml-2">
                  {group.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isCompleting={completingId === task.id}
                      onToggle={handleToggle}
                      onStartTimer={handleStartTimer}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Individual task item component
function TaskItem({
  task,
  isCompleting,
  onToggle,
  onStartTimer,
}: {
  task: Task;
  isCompleting: boolean;
  onToggle: (task: Task) => void;
  onStartTimer: (task: Task) => void;
}) {
  const isCompleted = task.status === "COMPLETED";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all group ${
        isCompleted
          ? "bg-success-bg/20 border-success/10"
          : "bg-bg border-border hover:border-primary/20"
      }`}
    >
      {/* Complete button */}
      <button
        onClick={() => onToggle(task)}
        disabled={isCompleting}
        className="text-text-muted hover:text-success transition-all flex-shrink-0"
      >
        {isCompleting ? (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 size={20} className="text-success" />
        ) : (
          <Circle size={20} />
        )}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isCompleted ? "text-text-secondary line-through" : "text-text"
          }`}
        >
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

      {/* Start timer button (only for incomplete tasks) */}
      {!isCompleted && (
        <button
          onClick={() => onStartTimer(task)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-primary-bg rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
          title="Start timer for this task"
        >
          <Play size={12} />
          Start
        </button>
      )}
    </div>
  );
}
