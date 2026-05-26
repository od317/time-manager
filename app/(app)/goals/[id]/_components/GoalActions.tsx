"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Goal } from "@/types";
import { goalService } from "@/lib/services";
import { CheckCircle2, XCircle, Archive, Trash2 } from "lucide-react";

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
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Actions</h3>

      <div className="flex flex-wrap gap-3">
        {isActive && (
          <>
            <button
              onClick={() => handleStatusChange("COMPLETED")}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-success-bg text-success rounded-lg font-medium hover:bg-success/10 disabled:opacity-50 transition-all"
            >
              <CheckCircle2 size={18} />
              Mark Complete
            </button>
            <button
              onClick={() => handleStatusChange("FAILED")}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-danger-bg text-danger rounded-lg font-medium hover:bg-danger/10 disabled:opacity-50 transition-all"
            >
              <XCircle size={18} />
              Mark Failed
            </button>
            <button
              onClick={() => handleStatusChange("ARCHIVED")}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-border text-text-secondary rounded-lg font-medium hover:bg-border/50 disabled:opacity-50 transition-all"
            >
              <Archive size={18} />
              Archive
            </button>
          </>
        )}

        {!isActive && (
          <button
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-bg text-primary rounded-lg font-medium hover:bg-primary/10 disabled:opacity-50 transition-all"
          >
            Re-activate
          </button>
        )}

        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 border border-danger/30 text-danger rounded-lg font-medium hover:bg-danger-bg disabled:opacity-50 transition-all ml-auto"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-sm p-6 animate-slide-up">
            <h4 className="text-lg font-semibold text-text mb-2">
              Delete Goal?
            </h4>
            <p className="text-sm text-text-secondary mb-6">
              This will permanently delete &quot;{goal.title}&quot; and all its
              sub-goals and tasks. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-border text-text-secondary rounded-lg font-medium hover:bg-border-light transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-danger text-white rounded-lg font-medium hover:bg-danger/90 disabled:opacity-50 transition-all"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
