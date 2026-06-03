"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Goal } from "@/types";
import { ChevronRight, Target, TrendingUp } from "lucide-react";

interface GoalSubgoalsProps {
  subGoals: Goal[];
}

export function GoalSubgoals({ subGoals }: GoalSubgoalsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  if (subGoals.length === 0) {
    return (
      <div className="text-center py-10">
        <Target size={32} className="text-text-muted mx-auto mb-3 opacity-50" />
        <p className="text-sm text-text-muted font-medium">No sub-goals yet</p>
        <p className="text-xs text-text-muted mt-1">
          Break down your goal into smaller milestones
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      {subGoals.map((subGoal) => (
        <motion.div key={subGoal.id} variants={item} layout>
          <Link href={`/goals/${subGoal.id}`} className="block group">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-bg border-2 border-border hover:border-primary/20 hover:shadow-md transition-all"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-bg"
                style={{ backgroundColor: subGoal.color || "#9FA1FF" }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {subGoal.icon && <span>{subGoal.icon}</span>}
                  <span className="text-sm font-semibold text-text truncate group-hover:text-primary transition-colors">
                    {subGoal.title}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      subGoal.status === "COMPLETED"
                        ? "bg-success-bg text-success border border-success/20"
                        : subGoal.status === "FAILED"
                          ? "bg-danger-bg text-danger border border-danger/20"
                          : "bg-primary-bg text-primary border border-primary/20"
                    }`}
                  >
                    {subGoal.status}
                  </span>
                </div>
                {subGoal.goalType === "project" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted flex items-center gap-1.5">
                        <TrendingUp size={12} />
                        Progress
                      </span>
                      <span className="font-bold text-text">
                        {Math.round(subGoal.progress || 0)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(subGoal.progress || 0, 100)}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: subGoal.color || "#9FA1FF",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <motion.div
                whileHover={{ x: 4 }}
                className="text-text-muted group-hover:text-text transition-colors"
              >
                <ChevronRight size={18} />
              </motion.div>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
