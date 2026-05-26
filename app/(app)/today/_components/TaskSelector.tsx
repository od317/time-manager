"use client";

import { useState, useRef, useEffect } from "react";
import { useTimerStore } from "@/store/timerStore";
import { Goal, Task } from "@/types";
import { X, Target, CheckCircle2, ChevronDown } from "lucide-react";

interface TaskSelectorProps {
  goals: Goal[];
}

export function TaskSelector({ goals }: TaskSelectorProps) {
  const {
    selectedTask,
    selectedGoal,
    setSelectedTask,
    setSelectedGoal,
    clearSelection,
    runningTimer,
  } = useTimerStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Only disable when timer is actively counting, allow changes when paused or stopped
  const isRunning = runningTimer?.status === "RUNNING";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTask = (task: Task, goal: Goal) => {
    setSelectedTask(task);
    setIsOpen(false);
  };

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsOpen(false);
  };

  const selectedLabel = selectedTask
    ? selectedTask.title
    : selectedGoal
      ? selectedGoal.title
      : null;

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          selectedLabel
            ? "bg-primary-bg text-primary"
            : "bg-bg border border-border text-text-secondary hover:border-primary/30"
        }`}
      >
        {selectedLabel ? (
          <>
            {selectedTask ? <CheckCircle2 size={16} /> : <Target size={16} />}
            <span className="max-w-[150px] truncate">{selectedLabel}</span>
            <X
              size={14}
              className="text-text-muted hover:text-text"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            />
          </>
        ) : (
          <>
            <Target size={16} />
            <span className="max-w-[150px] truncate">
              What are you working on?
            </span>
          </>
        )}
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-surface rounded-xl border border-border shadow-lg z-50 animate-slide-down">
          <div className="max-h-64 overflow-y-auto p-2">
            {activeGoals.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">
                No active goals
              </p>
            ) : (
              activeGoals.map((goal) => (
                <div key={goal.id} className="mb-1">
                  <button
                    onClick={() => handleSelectGoal(goal)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-border-light transition-all text-left"
                  >
                    {goal.icon && <span>{goal.icon}</span>}
                    <span className="text-sm font-medium text-text flex-1 truncate">
                      {goal.title}
                    </span>
                    <span className="text-xs text-text-muted">
                      {Math.round(goal.progress)}%
                    </span>
                  </button>

                  {goal.tasks &&
                    goal.tasks.filter(
                      (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
                    ).length > 0 && (
                      <div className="ml-6 border-l-2 border-border pl-3 space-y-0.5">
                        {goal.tasks
                          .filter(
                            (t) =>
                              t.status === "TODO" || t.status === "IN_PROGRESS",
                          )
                          .map((task) => (
                            <button
                              key={task.id}
                              onClick={() => handleSelectTask(task, goal)}
                              className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-border-light transition-all text-left"
                            >
                              <CheckCircle2
                                size={14}
                                className="text-text-muted flex-shrink-0"
                              />
                              <span className="text-sm text-text-secondary truncate">
                                {task.title}
                              </span>
                              {task.estimatedMinutes && (
                                <span className="text-xs text-text-muted flex-shrink-0">
                                  {task.estimatedMinutes}m
                                </span>
                              )}
                            </button>
                          ))}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
