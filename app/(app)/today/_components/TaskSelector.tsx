"use client";

import { useState, useRef, useEffect } from "react";
import { useTimerStore } from "@/store/timerStore";
import { Goal, Task } from "@/types";
import { X, CheckCircle2, ChevronDown, Layers } from "lucide-react";

interface TaskSelectorProps {
  goals: Goal[];
}

export function TaskSelector({ goals }: TaskSelectorProps) {
  const { selectedTask, setSelectedTask, clearSelection, runningTimer } =
    useTimerStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setIsOpen(false);
  };

  const activeGoals = goals.filter((g) => g.status === "ACTIVE");

  // Collect all active tasks across all goals
  const allTasks = activeGoals.flatMap((goal) =>
    (goal.tasks || [])
      .filter((t) => t.status === "TODO" || t.status === "IN_PROGRESS")
      .map((task) => ({ ...task, goal })),
  );

  // Get the goal for the selected task
  const selectedGoal = selectedTask
    ? activeGoals.find((g) => g.id === selectedTask.goalId)
    : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          selectedTask
            ? "bg-primary-bg text-primary"
            : "bg-bg border border-border text-text-secondary hover:border-primary/30"
        }`}
      >
        {selectedTask ? (
          <>
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  selectedTask.color || selectedGoal?.color || "#6366F1",
              }}
            />
            <CheckCircle2 size={16} />
            <span className="max-w-[150px] truncate">{selectedTask.title}</span>
            {selectedGoal && (
              <span className="text-xs text-text-muted truncate max-w-[100px]">
                in {selectedGoal.title}
              </span>
            )}
            <X
              size={14}
              className="text-text-muted hover:text-text flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            />
          </>
        ) : (
          <>
            <Layers size={16} />
            <span className="max-w-[150px] truncate">Select a task</span>
          </>
        )}
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-surface rounded-xl border border-border shadow-lg z-50 animate-slide-down">
          <div className="max-h-80 overflow-y-auto p-2">
            {allTasks.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">
                No tasks available. Add tasks to your goals first.
              </p>
            ) : (
              // Group tasks by goal
              activeGoals
                .filter((goal) =>
                  (goal.tasks || []).some(
                    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
                  ),
                )
                .map((goal) => {
                  const goalTasks = (goal.tasks || []).filter(
                    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
                  );

                  return (
                    <div key={goal.id} className="mb-1">
                      {/* Goal header */}
                      <div className="flex items-center gap-2 px-3 py-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: goal.color || "#6366F1" }}
                        />
                        <span className="text-xs font-medium text-text-muted uppercase tracking-wider flex-1 truncate">
                          {goal.title}
                        </span>
                        <span className="text-xs text-text-muted">
                          {goalTasks.length} task
                          {goalTasks.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Tasks under this goal */}
                      <div className="ml-6 border-l-2 border-border pl-3 space-y-0.5">
                        {goalTasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => handleSelectTask(task)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left ${
                              selectedTask?.id === task.id
                                ? "bg-primary-bg text-primary"
                                : "hover:bg-border-light text-text-secondary"
                            }`}
                          >
                            <CheckCircle2
                              size={14}
                              className={`flex-shrink-0 ${
                                selectedTask?.id === task.id
                                  ? "text-primary"
                                  : "text-text-muted"
                              }`}
                            />
                            <span className="text-sm truncate flex-1">
                              {task.title}
                            </span>
                            {task.estimatedMinutes && (
                              <span className="text-xs text-text-muted flex-shrink-0">
                                {task.estimatedMinutes}m
                              </span>
                            )}
                            {task.priority === "URGENT" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-danger flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
