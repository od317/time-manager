"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Goal } from "@/types";
import { goalService } from "@/lib/services";
import {
  CheckCircle2,
  XCircle,
  Archive,
  Trash2,
  AlertTriangle,
  Settings,
  RotateCcw,
} from "lucide-react";

interface GoalActionsProps {
  goal: Goal;
}

export function GoalActions({ goal }: GoalActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await goalService.delete(goal.id);
      router.push("/goals");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = goal.status === "ACTIVE";

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
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 bg-success-bg text-success border-success/20 hover:shadow-md transition-all disabled:opacity-50"
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

        {!isActive && (
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

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 border-danger/30 text-danger hover:bg-danger-bg transition-all disabled:opacity-50 ml-auto hover:shadow-md"
        >
          <Trash2 size={18} />
          Delete
        </motion.button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface rounded-2xl shadow-2xl border-2 border-danger/20 w-full max-w-sm p-6"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-danger-bg">
                  <AlertTriangle size={24} className="text-danger" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-text mb-1">
                    Delete Goal?
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    This will permanently delete &quot;{goal.title}&quot; and
                    all its sub-goals and tasks. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 px-4 border-2 border-border text-text-secondary rounded-xl font-semibold hover:bg-border-light transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-danger text-white rounded-xl font-semibold hover:bg-danger/90 disabled:opacity-50 transition-all shadow-lg shadow-danger/25"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
