"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Goal } from "@/types";
import { goalService } from "@/lib/services";
import { useTimerStore } from "@/store/timerStore";
import { Plus } from "lucide-react";

interface ProgressUpdateProps {
  goal: Goal;
}

export function ProgressUpdate({ goal }: ProgressUpdateProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentGoal, setCurrentGoal] = useState(goal);
  const { lastStoppedId, clearLastStopped } = useTimerStore();
  const isAutoSyncing = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const timeUnits = ["hours", "minutes", "h", "m", "hrs", "mins"];
  const isTimeBased = currentGoal.unit
    ? timeUnits.includes(currentGoal.unit.toLowerCase())
    : false;

  // Re-fetch goal when timer stops
  const refreshGoal = useCallback(async () => {
    try {
      const updated = await goalService.getById(currentGoal.id);
      setCurrentGoal(updated);
    } catch {
      // Silently fail
    }
  }, [currentGoal.id]);

  useEffect(() => {
    if (lastStoppedId) {
      refreshGoal();
      clearLastStopped();
      router.refresh();
    }
  }, [lastStoppedId, refreshGoal, clearLastStopped, router]);

  // Auto-sync tracked time for time-based goals (debounced)
  useEffect(() => {
    if (!isTimeBased || !currentGoal.targetValue) return;

    const trackedSeconds = (currentGoal.timeEntries || []).reduce(
      (sum, entry) => sum + (entry.duration || 0),
      0,
    );
    const trackedInUnit =
      currentGoal.unit?.toLowerCase() === "minutes"
        ? trackedSeconds / 60
        : trackedSeconds / 3600;

    // Only sync if tracked time is greater than current value
    if (trackedInUnit <= (currentGoal.currentValue || 0)) return;
    // Don't sync if already syncing
    if (isAutoSyncing.current) return;

    // Debounce: wait 2 seconds after last time entry change
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      if (isAutoSyncing.current) return;
      isAutoSyncing.current = true;

      try {
        const newProgress = Math.min(
          (trackedInUnit / currentGoal.targetValue!) * 100,
          100,
        );
        await goalService.update(currentGoal.id, {
          currentValue: trackedInUnit,
          progress: newProgress,
          status: newProgress >= 100 ? "COMPLETED" : undefined,
        });

        setCurrentGoal((prev) => ({
          ...prev,
          currentValue: trackedInUnit,
          progress: newProgress,
          status: newProgress >= 100 ? "COMPLETED" : prev.status,
        }));
        router.refresh();
      } catch {
        // Silently fail auto-sync
      } finally {
        isAutoSyncing.current = false;
      }
    }, 2000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    currentGoal.timeEntries,
    isTimeBased,
    currentGoal.targetValue,
    currentGoal.unit,
    currentGoal.currentValue,
    currentGoal.id,
    router,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const newValue = (currentGoal.currentValue || 0) + value;
      const newProgress = currentGoal.targetValue
        ? Math.min((newValue / currentGoal.targetValue) * 100, 100)
        : currentGoal.progress;

      await goalService.update(currentGoal.id, {
        currentValue: newValue,
        progress: newProgress,
        status: newProgress >= 100 ? "COMPLETED" : undefined,
      });

      setAmount("");
      setCurrentGoal((prev) => ({
        ...prev,
        currentValue: newValue,
        progress: newProgress,
        status: newProgress >= 100 ? "COMPLETED" : prev.status,
      }));
      router.refresh();
    } catch {
      setError("Failed to update progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (value: number) => {
    setIsSubmitting(true);
    try {
      const newValue = (currentGoal.currentValue || 0) + value;
      const newProgress = currentGoal.targetValue
        ? Math.min((newValue / currentGoal.targetValue) * 100, 100)
        : currentGoal.progress;

      await goalService.update(currentGoal.id, {
        currentValue: newValue,
        progress: newProgress,
        status: newProgress >= 100 ? "COMPLETED" : undefined,
      });

      setCurrentGoal((prev) => ({
        ...prev,
        currentValue: newValue,
        progress: newProgress,
        status: newProgress >= 100 ? "COMPLETED" : prev.status,
      }));
      router.refresh();
    } catch {
      // Handle silently
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentGoal.targetValue || currentGoal.status !== "ACTIVE") return null;

  const remaining = currentGoal.targetValue - (currentGoal.currentValue || 0);
  const quickAdds = isTimeBased ? [0.25, 0.5, 1, 2] : [1, 5, 10, 25];

  const formatValue = (val: number): string => {
    if (isTimeBased) {
      const hours = Math.floor(val);
      const minutes = Math.round((val - hours) * 60);
      if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return "0m";
    }
    return `${val}`;
  };

  const trackedSeconds = (currentGoal.timeEntries || []).reduce(
    (sum, entry) => sum + (entry.duration || 0),
    0,
  );
  const trackedHours = trackedSeconds / 3600;

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text mb-4">Update Progress</h3>

      {error && (
        <div className="bg-danger-bg text-danger border border-danger/20 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-text-secondary">
          {isTimeBased
            ? `${formatValue(currentGoal.currentValue || 0)} / ${formatValue(currentGoal.targetValue)}`
            : `${currentGoal.currentValue || 0} / ${currentGoal.targetValue} ${currentGoal.unit || ""}`}
        </span>
        <span className="text-text-muted">
          {isTimeBased
            ? `${formatValue(remaining)} remaining`
            : `${remaining} ${currentGoal.unit || ""} remaining`}
        </span>
      </div>

      {isTimeBased && trackedSeconds > 0 && (
        <div className="mb-4 p-3 bg-bg rounded-lg border border-border">
          <p className="text-xs text-text-muted">
            Time tracked via timer:{" "}
            <span className="text-text font-medium">
              {formatValue(trackedHours)}
            </span>
          </p>
          <button
            onClick={() => handleQuickAdd(trackedHours)}
            disabled={isSubmitting}
            className="mt-2 text-xs text-primary hover:text-primary-dark font-medium transition-all"
          >
            + Apply tracked time to progress
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {quickAdds.map((value) => (
          <button
            key={value}
            onClick={() => handleQuickAdd(value)}
            disabled={isSubmitting}
            className="flex-1 py-2 px-3 bg-bg border border-border rounded-lg text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-primary disabled:opacity-50 transition-all"
          >
            +{isTimeBased ? formatValue(value) : value}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            placeholder={
              isTimeBased
                ? "Add hours (e.g., 1.5)"
                : `Add ${currentGoal.unit || "amount"}`
            }
            min="0.01"
            step={isTimeBased ? "0.25" : "1"}
            max={remaining}
            className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {currentGoal.unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
              {isTimeBased ? "hours" : currentGoal.unit}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !amount}
          className="px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
        >
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
}
