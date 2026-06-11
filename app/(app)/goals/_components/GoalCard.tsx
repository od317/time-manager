"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Goal } from "@/types";
import {
  ChevronRight,
  Plus,
  Target,
  Calendar,
  TrendingUp,
  Layers,
} from "lucide-react";
import { GoalForm } from "./GoalForm";

interface GoalCardProps {
  goal: Goal;
  subGoals: Goal[];
  allGoals: Goal[];
}

export function GoalCard({ goal, subGoals, allGoals }: GoalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubGoalForm, setShowSubGoalForm] = useState(false);

  const hasChildren = subGoals.length > 0;
  const getChildrenOf = (parentId: string) =>
    allGoals.filter((g) => g.parentId === parentId);

  const getPriorityConfig = () => {
    switch (goal.priority) {
      case "URGENT":
        return {
          color: "text-danger",
          bg: "bg-danger-bg",
          border: "border-danger/20",
        };
      case "HIGH":
        return {
          color: "text-warning",
          bg: "bg-warning-bg",
          border: "border-warning/20",
        };
      case "MEDIUM":
        return {
          color: "text-info",
          bg: "bg-info-bg",
          border: "border-info/20",
        };
      default:
        return {
          color: "text-text-muted",
          bg: "bg-bg",
          border: "border-border",
        };
    }
  };

  const getStatusConfig = () => {
    switch (goal.status) {
      case "ACTIVE":
        return {
          color: "text-primary",
          bg: "bg-primary-bg",
          label: "Active",
        };
      case "COMPLETED":
        return {
          color: "text-success",
          bg: "bg-success-bg",
          label: "Completed",
        };
      case "OVERDUE":
        return {
          color: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-950",
          label: "Overdue",
        };
      case "PAUSED":
        return {
          color: "text-slate-500",
          bg: "bg-slate-100 dark:bg-slate-800",
          label: "Paused",
        };
      case "FAILED":
        return {
          color: "text-danger",
          bg: "bg-danger-bg",
          label: "Failed",
        };
      case "ARCHIVED":
        return {
          color: "text-text-muted",
          bg: "bg-border",
          label: "Archived",
        };
      default:
        return { color: "text-text-muted", bg: "bg-bg", label: goal.status };
    }
  };

  const priorityConfig = getPriorityConfig();
  const statusConfig = getStatusConfig();
  const progress = Math.min(goal.progress || 0, 100);
  return (
    <motion.div layout>
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-surface rounded-2xl border-2 border-border hover:border-primary/20 hover:shadow-lg transition-all overflow-hidden"
      >
        {/* Color bar */}
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: goal.color || "#9FA1FF" }}
        />

        <Link href={`/goals/${goal.id}`} className="block p-5">
          <div className="flex items-start gap-4">
            {/* Expand button */}
            {hasChildren ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="mt-1 p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight size={16} />
                </motion.div>
              </motion.button>
            ) : (
              <div className="w-9" />
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {goal.icon && <span className="text-lg">{goal.icon}</span>}
                <h3 className="font-bold text-text truncate flex-1">
                  {goal.title}
                </h3>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border}`}
                  >
                    {goal.priority}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              </div>

              {goal.description && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-1 leading-relaxed">
                  {goal.description}
                </p>
              )}

              {/* Progress Bar */}
              {goal.goalType !== "project" && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-text-muted" />
                      <span className="text-[10px] font-semibold text-text-muted uppercase">
                        Progress
                      </span>
                    </div>
                    <span className="text-xs font-bold text-text">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${goal.color || "#9FA1FF"}80, ${goal.color || "#9FA1FF"})`,
                      }}
                    />
                  </div>
                </div>
              )}
              {/* Stats */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  {goal.currentValue > 0 && goal.targetValue && (
                    <span className="font-semibold text-text flex items-center gap-1.5">
                      <Target size={12} className="text-text-muted" />
                      {goal.currentValue} / {goal.targetValue} {goal.unit || ""}
                    </span>
                  )}
                  {subGoals.length > 0 && (
                    <span className="text-text-muted flex items-center gap-1.5">
                      <Layers size={12} />
                      {subGoals.length} sub-goal
                      {subGoals.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {goal.endDate && (
                  <span className="text-text-muted flex items-center gap-1.5">
                    <Calendar size={12} />
                    {new Date(goal.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Add sub-goal button */}
        <div className="px-5 pb-4">
          {goal.status !== "COMPLETED" && (
            <motion.button
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.preventDefault();
                setShowSubGoalForm(true);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-primary transition-all group"
            >
              <div className="p-1 rounded-md bg-bg group-hover:bg-primary-bg transition-colors">
                <Plus size={12} />
              </div>
              Add sub-goal
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Sub-goals */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-2 space-y-2 border-l-2 border-border pl-6">
              {subGoals.map((child) => (
                <GoalCard
                  key={child.id}
                  goal={child}
                  subGoals={getChildrenOf(child.id)}
                  allGoals={allGoals}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-goal form modal */}
      <AnimatePresence>
        {showSubGoalForm && (
          <GoalForm
            parentId={goal.id}
            parentColor={goal.color || undefined}
            onClose={() => setShowSubGoalForm(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
