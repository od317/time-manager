"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Goal } from "@/types";
import { goalService } from "@/lib/services";
import { useTimerStore } from "@/store/timerStore";
import { Plus, TrendingUp, Clock, AlertCircle } from "lucide-react";

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

  const isTimeBased = goal.goalType === "time";
  const isQuantity = goal.goalType === "quantity";

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

    if (trackedInUnit <= (currentGoal.currentValue || 0)) return;
    if (isAutoSyncing.current) return;

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary-bg">
          <TrendingUp size={18} className="text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text">Update Progress</h3>
          <p className="text-xs text-text-muted">
            {isTimeBased ? "Track time spent" : "Log your progress"}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-3 mb-4 text-sm font-medium flex items-center gap-2"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-6 p-4 bg-bg rounded-xl">
        <div>
          <p className="text-xs font-semibold text-text-muted mb-1">
            Current Progress
          </p>
          <p className="text-lg font-bold text-text">
            {isTimeBased
              ? formatValue(currentGoal.currentValue || 0)
              : `${currentGoal.currentValue || 0} ${currentGoal.unit || ""}`}
            <span className="text-sm text-text-muted font-normal ml-1">
              /{" "}
              {isTimeBased
                ? formatValue(currentGoal.targetValue)
                : `${currentGoal.targetValue} ${currentGoal.unit || ""}`}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-text-muted mb-1">
            Remaining
          </p>
          <p className="text-lg font-bold text-primary">
            {formatValue(remaining)}
          </p>
        </div>
      </div>

      {isTimeBased && trackedSeconds > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-info-bg border border-info/20 rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-info" />
            <p className="text-xs font-semibold text-info">
              Tracked time: {formatValue(trackedHours)}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleQuickAdd(trackedHours)}
            disabled={isSubmitting}
            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
          >
            + Apply tracked time to progress
          </motion.button>
        </motion.div>
      )}

      <div className="flex gap-2 mb-4">
        {quickAdds.map((value) => (
          <motion.button
            key={value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickAdd(value)}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-3 bg-bg border-2 border-border rounded-xl text-sm font-bold text-text-secondary hover:border-primary/30 hover:text-primary disabled:opacity-50 transition-all"
          >
            +{isTimeBased ? formatValue(value) : value}
          </motion.button>
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
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
          />
          {currentGoal.unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-muted">
              {isTimeBased ? "hours" : currentGoal.unit}
            </span>
          )}
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting || !amount}
          className="px-5 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all"
        >
          <Plus size={20} />
        </motion.button>
      </form>
    </motion.div>
  );
}
