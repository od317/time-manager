"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Goal } from "@/types";
import { goalService } from "@/lib/services";
import {
  CheckCircle2,
  XCircle,
  Archive,
  Settings,
  RotateCcw,
} from "lucide-react";

interface GoalActionsProps {
  goal: Goal;
}

export function GoalActions({ goal }: GoalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const hasCompletedParent = goal.parent?.status === "COMPLETED";

  const handleStatusChange = async (status: string) => {
    setIsLoading(true);
    try {
      await goalService.update(goal.id, {
        status: status as Goal["status"],
      });
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = goal.status === "ACTIVE" || goal.status === "OVERDUE";

  const hasActiveChildren = goal.children?.some(
    (c) =>
      c.status === "ACTIVE" || c.status === "PAUSED" || c.status === "OVERDUE",
  );
  const hasActiveTasks = (goal.tasks || []).some(
    (t) =>
      t.status === "TODO" ||
      t.status === "IN_PROGRESS" ||
      t.status === "OVERDUE",
  );
  const canComplete = !hasActiveChildren && !hasActiveTasks;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-bg">
          <Settings size={18} className="text-text-muted" />
        </div>
        <h3 className="text-lg font-bold text-text">Actions</h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {isActive && (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange("COMPLETED")}
              disabled={isLoading || !canComplete}
              title={
                !canComplete
                  ? "Complete all sub-goals and tasks first"
                  : "Mark as complete"
              }
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                canComplete
                  ? "bg-success-bg text-success hover:bg-success/10"
                  : "bg-border text-text-muted cursor-not-allowed"
              }`}
            >
              <CheckCircle2 size={18} />
              Mark Complete
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange("FAILED")}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 bg-danger-bg text-danger border-danger/20 hover:shadow-md transition-all disabled:opacity-50"
            >
              <XCircle size={18} />
              Mark Failed
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange("ARCHIVED")}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 bg-bg text-text-secondary border-border hover:shadow-md transition-all disabled:opacity-50"
            >
              <Archive size={18} />
              Archive
            </motion.button>
          </>
        )}
        {!isActive && !hasCompletedParent && goal.status !== "FAILED" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 bg-primary-bg text-primary border-primary/20 hover:shadow-md transition-all disabled:opacity-50"
          >
            <RotateCcw size={18} />
            Re-activate
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
