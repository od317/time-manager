"use client";

import { Task } from "@/types";
import {
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";

interface TaskItemProps {
  task: Task;
  isCompleting?: boolean;
  onToggle?: (task: Task) => void;
  onStartTimer?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  showGoalColor?: boolean;
  goalColor?: string;
}

export function TaskItem({
  task,
  isCompleting = false,
  onToggle,
  onStartTimer,
  onEdit,
  onDelete,
  showGoalColor = false,
  goalColor = "#6366F1",
}: TaskItemProps) {
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
      {onToggle && (
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
      )}

      {/* Goal color dot */}
      {showGoalColor && (
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: goalColor }}
        />
      )}

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

      {/* Edit button */}
      {onEdit && (
        <button
          onClick={() => onEdit(task)}
          className="p-1 text-text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          title="Edit task"
        >
          <Pencil size={14} />
        </button>
      )}

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(task)}
          className="p-1 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Start timer button */}
      {!isCompleted && onStartTimer && (
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
