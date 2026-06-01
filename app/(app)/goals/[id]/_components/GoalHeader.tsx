"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Goal } from "@/types";
import { ArrowLeft, Target, Calendar, Flag } from "lucide-react";

interface GoalHeaderProps {
  goal: Goal;
}

export function GoalHeader({ goal }: GoalHeaderProps) {
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
      case "COMPLETED":
        return {
          color: "text-success",
          bg: "bg-success-bg",
          label: "Completed",
        };
      case "FAILED":
        return { color: "text-danger", bg: "bg-danger-bg", label: "Failed" };
      case "ACTIVE":
        return {
          color: "text-success",
          bg: "bg-success-bg/50",
          label: "Active",
        };
      default:
        return { color: "text-text-muted", bg: "bg-bg", label: goal.status };
    }
  };

  const priorityConfig = getPriorityConfig();
  const statusConfig = getStatusConfig();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link
        href="/goals"
        className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text mb-6 transition-all group"
      >
        <motion.div whileHover={{ x: -4 }} transition={{ duration: 0.2 }}>
          <ArrowLeft size={16} />
        </motion.div>
        <span className="group-hover:underline">Back to goals</span>
      </Link>

      <div className="flex items-start gap-5">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ duration: 0.3 }}
          className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg"
          style={{
            backgroundColor: `${goal.color || "#9FA1FF"}20`,
            border: `2px solid ${goal.color || "#9FA1FF"}30`,
          }}
        >
          {goal.icon ? (
            <span className="text-3xl">{goal.icon}</span>
          ) : (
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: goal.color || "#9FA1FF" }}
            />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-text">{goal.title}</h1>
          {goal.description && (
            <p className="text-text-secondary mt-2 leading-relaxed">
              {goal.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${priorityConfig.bg} ${priorityConfig.color} ${priorityConfig.border} flex items-center gap-1.5`}
            >
              <Flag size={12} />
              {goal.priority}
            </span>

            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}
            >
              {statusConfig.label}
            </span>

            {goal.category && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg text-text-secondary border border-border">
                {goal.category}
              </span>
            )}

            {goal.endDate && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-bg text-text-secondary border border-border flex items-center gap-1.5">
                <Calendar size={12} />
                Due {new Date(goal.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
