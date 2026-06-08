"use client";

import { useState } from "react";
import { Task } from "@/types";
import { useTimerStore } from "@/store/timerStore";
import { useTaskStore } from "@/store/taskStore";
import { useModalStore } from "@/store/modalStore";
import { Circle, Play, CheckCircle2, Pencil, Loader2 } from "lucide-react";

interface TaskRowProps {
  task: Task;
  onToggle?: (task: Task) => void;
}

export function TaskRow({ task, onToggle }: TaskRowProps) {
  const isSelected = useTimerStore((s) => s.selectedTask?.id === task.id);
  const setSelectedTask = useTimerStore((s) => s.setSelectedTask);
  const isLocallyCompleted = useTaskStore((s) =>
    s.localCompletedIds.has(task.id),
  );
  const isCompleted = task.status === "COMPLETED" || isLocallyCompleted;
  const { openEditTask } = useModalStore();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (!onToggle) return;
    setIsToggling(true);
    await onToggle(task);
    setIsToggling(false);
  };

  const handleStartTask = () => {
    setSelectedTask(task);
    document
      .querySelector("#focus-timer")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all group ${
        isSelected
          ? "text-primary bg-primary-bg/30"
          : isCompleted
            ? "text-text-secondary bg-success-bg/10"
            : task.status === "OVERDUE"
              ? "text-amber-500 bg-amber-50 dark:bg-amber-950"
              : "text-text-secondary hover:bg-border-light"
      }`}
    >
      {onToggle ? (
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className="flex-shrink-0 text-text-muted hover:text-success transition-all"
        >
          {isToggling ? (
            <Loader2 size={14} className="animate-spin text-primary" />
          ) : isCompleted ? (
            <CheckCircle2 size={14} className="text-success" />
          ) : (
            <Circle size={14} />
          )}
        </button>
      ) : (
        <Circle
          size={12}
          className={`flex-shrink-0 ${isSelected ? "text-primary" : "text-text-muted"}`}
        />
      )}

      <span className={`truncate flex-1 ${isCompleted ? "line-through" : ""}`}>
        {task.title}
      </span>

      {task.estimatedMinutes && (
        <span className="text-xs text-text-muted flex-shrink-0">
          {task.estimatedMinutes}m
        </span>
      )}

      <button
        onClick={() => openEditTask(task)}
        className="p-1 text-text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
        title="Edit task"
      >
        <Pencil size={14} />
      </button>

      {!isCompleted && (
        <button
          onClick={handleStartTask}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all flex-shrink-0 ${
            isSelected
              ? "text-primary bg-primary-bg cursor-default"
              : "text-primary hover:bg-primary-bg opacity-0 group-hover:opacity-100 cursor-pointer"
          }`}
          title={
            isSelected ? "Task selected for timer" : "Start timer for this task"
          }
        >
          {isSelected ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{" "}
              Selected
            </>
          ) : (
            <>
              <Play size={12} /> Start
            </>
          )}
        </button>
      )}
    </div>
  );
}
