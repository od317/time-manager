"use client";

import { Task } from "@/types";
import { useTimerStore } from "@/store/timerStore";
import { Circle, Play } from "lucide-react";

export function TaskRow({ task }: { task: Task }) {
  const isSelected = useTimerStore((s) => s.selectedTask?.id === task.id);
  const setSelectedTask = useTimerStore((s) => s.setSelectedTask);

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
          : "text-text-secondary hover:bg-border-light"
      }`}
    >
      <Circle
        size={12}
        className={`flex-shrink-0 ${isSelected ? "text-primary" : "text-text-muted"}`}
      />
      <span className="truncate flex-1">{task.title}</span>
      {task.estimatedMinutes && (
        <span className="text-xs text-text-muted flex-shrink-0">
          {task.estimatedMinutes}m
        </span>
      )}
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
    </div>
  );
}
