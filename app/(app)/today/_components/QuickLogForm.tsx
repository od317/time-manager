"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTimerStore } from "@/store/timerStore";
import { timeEntryService } from "@/lib/services";
import { Clock, Save } from "lucide-react";

export function QuickLogForm() {
  const router = useRouter();
  const { selectedTask, selectedGoal, clearSelection } = useTimerStore();
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const hasSelection = selectedTask !== null || selectedGoal !== null;

  const selectedLabel =
    selectedTask?.title || selectedGoal?.title || "No task selected";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const minutes = parseFloat(duration);
    if (isNaN(minutes) || minutes <= 0) {
      setError("Please enter a valid duration");
      return;
    }

    setIsSubmitting(true);
    try {
      await timeEntryService.quickLog({
        duration: minutes,
        goalId: selectedGoal?.id,
        taskId: selectedTask?.id,
        note: note.trim() || undefined,
      });

      setDuration("");
      setNote("");
      setSuccess(true);
      clearSelection();
      router.refresh();

      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to log time");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-center">
      {/* Info */}
      <div className="mb-4 p-3 bg-bg rounded-lg border border-border text-left">
        <p className="text-xs text-text-muted">Logging time for:</p>
        <p className="text-sm font-medium text-text truncate">
          {selectedLabel}
        </p>
      </div>

      {error && (
        <div className="bg-danger-bg text-danger border border-danger/20 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success-bg text-success border border-success/20 rounded-lg p-3 mb-4 text-sm">
          Time logged successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5 text-left">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30"
            min="1"
            step="5"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5 text-left">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you work on?"
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setDuration("15");
            }}
            className="flex-1 py-2 px-3 bg-bg border border-border rounded-lg text-sm text-text-secondary hover:border-primary/30 transition-all"
          >
            15m
          </button>
          <button
            type="button"
            onClick={() => {
              setDuration("30");
            }}
            className="flex-1 py-2 px-3 bg-bg border border-border rounded-lg text-sm text-text-secondary hover:border-primary/30 transition-all"
          >
            30m
          </button>
          <button
            type="button"
            onClick={() => {
              setDuration("60");
            }}
            className="flex-1 py-2 px-3 bg-bg border border-border rounded-lg text-sm text-text-secondary hover:border-primary/30 transition-all"
          >
            1h
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !duration || !hasSelection}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
        >
          <Save size={18} />
          {isSubmitting ? "Logging..." : "Log Time"}
        </button>
      </form>
    </div>
  );
}
