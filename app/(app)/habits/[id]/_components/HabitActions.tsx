"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Habit } from "@/types";
import { habitService } from "@/lib/services";
import { Pause, Play, Archive, Trash2 } from "lucide-react";

interface HabitActionsProps {
  habit: Habit;
}

export function HabitActions({ habit }: HabitActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = async (status: string) => {
    setIsLoading(true);
    try {
      await habitService.update(habit.id, {
        status: status as Habit["status"],
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
      await habitService.delete(habit.id);
      router.push("/habits");
      router.refresh();
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = habit.status === "ACTIVE";
  const isPaused = habit.status === "PAUSED";

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Actions</h3>

      <div className="flex flex-wrap gap-3">
        {isActive && (
          <button
            onClick={() => handleStatusChange("PAUSED")}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-warning-bg text-warning rounded-lg font-medium hover:bg-warning/10 disabled:opacity-50 transition-all"
          >
            <Pause size={18} />
            Pause Habit
          </button>
        )}

        {isPaused && (
          <button
            onClick={() => handleStatusChange("ACTIVE")}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-success-bg text-success rounded-lg font-medium hover:bg-success/10 disabled:opacity-50 transition-all"
          >
            <Play size={18} />
            Resume Habit
          </button>
        )}

        <button
          onClick={() => handleStatusChange("ARCHIVED")}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-border text-text-secondary rounded-lg font-medium hover:bg-border/50 disabled:opacity-50 transition-all"
        >
          <Archive size={18} />
          Archive
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 border border-danger/30 text-danger rounded-lg font-medium hover:bg-danger-bg disabled:opacity-50 transition-all ml-auto"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-sm p-6 animate-slide-up">
            <h4 className="text-lg font-semibold text-text mb-2">
              Delete Habit?
            </h4>
            <p className="text-sm text-text-secondary mb-6">
              This will permanently delete &quot;{habit.title}&quot; and all its
              history. This action cannot be undone.
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
