"use client";

import { motion } from "framer-motion";
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
  isDeleting: boolean;
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
  isDeleting = false,
  onToggle,
  onStartTimer,
  onEdit,
  onDelete,
  showGoalColor = false,
  goalColor = "#9FA1FF",
}: TaskItemProps) {
  const isCompleted = task.status === "COMPLETED";
  console.log(task.status, isCompleted);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      whileHover={{ scale: 1.01 }}
      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all group ${
        isCompleted
          ? "bg-success-bg/20 border-success/10"
          : "bg-bg border-border hover:border-primary/20 hover:shadow-sm"
      }`}
    >
      {/* Goal color dot */}
      {showGoalColor && (
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: goalColor }}
        />
      )}

      {/* Complete button */}
      {onToggle && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(task)}
          disabled={isCompleting}
          className="flex-shrink-0"
        >
          {isCompleting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
            />
          ) : isCompleted ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CheckCircle2 size={20} className="text-success" />
            </motion.div>
          ) : (
            <Circle
              size={20}
              className="text-text-muted hover:text-primary transition-colors"
            />
          )}
        </motion.button>
      )}

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate transition-all ${
            isCompleted
              ? "text-text-secondary line-through opacity-75"
              : "text-text"
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {task.estimatedMinutes && (
            <span className="text-xs text-text-muted flex items-center gap-1 font-medium">
              <Clock size={11} />
              {task.estimatedMinutes}m
            </span>
          )}
          {task.priority && task.priority !== "MEDIUM" && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
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

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
        {onEdit && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onEdit(task)}
            className="p-1.5 text-text-muted hover:text-text hover:bg-border-light rounded-lg transition-all"
            title="Edit task"
          >
            <Pencil size={14} />
          </motion.button>
        )}

        {onDelete && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(task)}
            disabled={isDeleting}
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-bg rounded-lg transition-all"
            title="Delete task"
          >
            {isDeleting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-3.5 h-3.5 border-2 border-danger border-t-transparent rounded-full"
              />
            ) : (
              <Trash2 size={14} />
            )}
          </motion.button>
        )}

        {!isCompleted && onStartTimer && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStartTimer(task)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary-bg hover:bg-primary hover:text-white rounded-lg transition-all"
            title="Start timer for this task"
          >
            <Play size={12} className="fill-current" />
            Start
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
