// app/(app)/create-plan/_components/PlanPreview.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Target,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Trash2,
  GripVertical,
  Save,
  Loader2,
} from "lucide-react";
import {
  GeneratedPlan,
  GeneratedSubGoal,
  GeneratedTask,
} from "@/lib/services/aiService";

interface PlanPreviewProps {
  plan: GeneratedPlan;
  onUpdate: (plan: GeneratedPlan) => void;
  onCreate: (plan: GeneratedPlan) => void;
  isCreating: boolean;
  error: string;
}

export function PlanPreview({
  plan,
  onUpdate,
  onCreate,
  isCreating,
  error,
}: PlanPreviewProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(
    new Set([0]),
  ); // First phase open by default

  const togglePhase = (index: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  // Goal editing
  const updateGoal = (field: string, value: string) => {
    onUpdate({
      ...plan,
      goal: { ...plan.goal, [field]: value },
    });
  };

  // Sub-goal editing
  const updateSubGoal = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newSubGoals = [...plan.subGoals];
    newSubGoals[index] = { ...newSubGoals[index], [field]: value };
    onUpdate({ ...plan, subGoals: newSubGoals });
  };

  const removeSubGoal = (index: number) => {
    onUpdate({
      ...plan,
      subGoals: plan.subGoals.filter((_, i) => i !== index),
    });
  };

  const addSubGoal = () => {
    onUpdate({
      ...plan,
      subGoals: [
        ...plan.subGoals,
        {
          title: "New Phase",
          description: "",
          priority: "MEDIUM",
          order: plan.subGoals.length + 1,
          estimatedHours: 10,
          deadlineOffset: "2 weeks",
          tasks: [],
        },
      ],
    });
  };

  // Task editing
  const updateTask = (
    subGoalIndex: number,
    taskIndex: number,
    field: string,
    value: string | number,
  ) => {
    const newSubGoals = [...plan.subGoals];
    const newTasks = [...newSubGoals[subGoalIndex].tasks];
    newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
    newSubGoals[subGoalIndex] = {
      ...newSubGoals[subGoalIndex],
      tasks: newTasks,
    };
    onUpdate({ ...plan, subGoals: newSubGoals });
  };

  const removeTask = (subGoalIndex: number, taskIndex: number) => {
    const newSubGoals = [...plan.subGoals];
    newSubGoals[subGoalIndex] = {
      ...newSubGoals[subGoalIndex],
      tasks: newSubGoals[subGoalIndex].tasks.filter((_, i) => i !== taskIndex),
    };
    onUpdate({ ...plan, subGoals: newSubGoals });
  };

  const addTask = (subGoalIndex: number) => {
    const newSubGoals = [...plan.subGoals];
    newSubGoals[subGoalIndex] = {
      ...newSubGoals[subGoalIndex],
      tasks: [
        ...newSubGoals[subGoalIndex].tasks,
        {
          title: "New Task",
          description: "",
          priority: "MEDIUM",
          estimatedMinutes: 60,
          dueDateOffset: "1 week",
        },
      ],
    };
    onUpdate({ ...plan, subGoals: newSubGoals });
  };

  const totalHours = plan.subGoals.reduce(
    (sum, sg) => sum + sg.estimatedHours,
    0,
  );
  const totalTasks = plan.subGoals.reduce(
    (sum, sg) => sum + sg.tasks.length,
    0,
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-4 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Goal Header - Editable */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-xl bg-primary-bg">
            <Target size={24} className="text-primary" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={plan.goal.title}
              onChange={(e) => updateGoal("title", e.target.value)}
              className="w-full text-xl font-bold text-text bg-transparent border-b-2 border-transparent hover:border-primary/30 focus:border-primary focus:outline-none px-1 py-0.5 transition-all"
            />
            <textarea
              value={plan.goal.description}
              onChange={(e) => updateGoal("description", e.target.value)}
              rows={2}
              className="w-full text-sm text-text-secondary bg-transparent border-b-2 border-transparent hover:border-primary/30 focus:border-primary focus:outline-none px-1 py-0.5 mt-1 transition-all resize-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <Clock size={16} />
            <span className="font-medium text-text">{totalHours}h</span>{" "}
            estimated
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Target size={16} />
            <span className="font-medium text-text">
              {plan.subGoals.length}
            </span>{" "}
            phases
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <Sparkles size={16} />
            <span className="font-medium text-text">{totalTasks}</span> tasks
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold bg-warning-bg text-warning border border-warning/20`}
          >
            {plan.goal.priority}
          </span>
        </div>
      </div>

      {/* Sub-goals / Phases */}
      <div className="space-y-3">
        {plan.subGoals.map((subGoal, sgIndex) => (
          <motion.div
            key={sgIndex}
            layout
            className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            {/* Phase Header */}
            <div
              role="button"
              onClick={() => togglePhase(sgIndex)}
              className="w-full flex items-center gap-4 p-5 hover:bg-bg/50 transition-colors text-left cursor-pointer"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: "#F9731620",
                  color: "#F97316",
                }}
              >
                {sgIndex + 1}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={subGoal.title}
                  onChange={(e) =>
                    updateSubGoal(sgIndex, "title", e.target.value)
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm font-bold text-text bg-transparent border-b-2 border-transparent hover:border-primary/30 focus:border-primary focus:outline-none px-1 py-0.5 transition-all w-full"
                />
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">
                    {subGoal.estimatedHours}h
                  </span>
                  <span className="text-xs text-text-muted">
                    {subGoal.tasks.length} tasks
                  </span>
                  <span className="text-xs text-text-muted">
                    {subGoal.deadlineOffset}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSubGoal(sgIndex);
                  }}
                  className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <motion.div
                  animate={{ rotate: expandedPhases.has(sgIndex) ? 180 : 0 }}
                >
                  <ChevronDown size={18} className="text-text-muted" />
                </motion.div>
              </div>
            </div>

            {/* Tasks */}
            <AnimatePresence>
              {expandedPhases.has(sgIndex) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-2">
                    {subGoal.tasks.map((task, tIndex) => (
                      <motion.div
                        key={tIndex}
                        layout
                        className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-border group"
                      >
                        <div className="w-2 h-2 rounded-full bg-primary/50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) =>
                              updateTask(
                                sgIndex,
                                tIndex,
                                "title",
                                e.target.value,
                              )
                            }
                            className="text-sm font-medium text-text bg-transparent border-b-2 border-transparent hover:border-primary/30 focus:border-primary focus:outline-none px-1 py-0.5 transition-all w-full"
                          />
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-text-muted">
                              {task.estimatedMinutes}m
                            </span>
                            <span className="text-xs text-text-muted">
                              {task.dueDateOffset}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                task.priority === "HIGH"
                                  ? "bg-warning-bg text-warning"
                                  : task.priority === "MEDIUM"
                                    ? "bg-primary-bg text-primary"
                                    : "bg-bg text-text-muted"
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeTask(sgIndex, tIndex)}
                          className="p-1 text-text-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                    <button
                      onClick={() => addTask(sgIndex)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-border rounded-xl text-sm text-text-muted hover:text-text hover:border-primary/30 transition-all"
                    >
                      <Plus size={14} />
                      Add Task
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Add Phase */}
        <button
          onClick={addSubGoal}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border rounded-2xl text-sm font-medium text-text-muted hover:text-text hover:border-primary/30 transition-all"
        >
          <Plus size={16} />
          Add Phase
        </button>
      </div>

      {/* Create Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onCreate(plan)}
        disabled={isCreating}
        className="w-full py-4 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Creating Plan...
          </>
        ) : (
          <>
            <Save size={18} />
            Create Plan
          </>
        )}
      </motion.button>
    </div>
  );
}
