"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { timeEntryService } from "@/lib/services";
import { Clock, Save, CheckCircle } from "lucide-react";

export function QuickLogForm() {
  const router = useRouter();
  const { selectedTask, selectedGoal, clearSelection } = useTimerStore();
  const [duration, setDuration] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const hasSelection = selectedTask !== null;

  const selectedLabel = selectedTask?.title || "No task selected";

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

  const quickTimes = [15, 30, 60];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* Selected Task Info */}
      <motion.div
        layout
        className="mb-6 p-4 bg-bg rounded-2xl border border-border"
      >
        <p className="text-xs font-medium text-text-muted mb-1">
          Logging time for:
        </p>
        <div className="flex items-center gap-2">
          {selectedTask?.color && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedTask.color }}
            />
          )}
          <p className="text-sm font-semibold text-text truncate">
            {selectedLabel}
          </p>
        </div>
      </motion.div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger-bg text-danger border border-danger/20 rounded-2xl p-4 mb-4 text-sm font-medium"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-success-bg text-success border border-success/20 rounded-2xl p-4 mb-4 text-sm font-medium flex items-center gap-2"
          >
            <CheckCircle size={16} />
            Time logged successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Duration Input */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Duration (minutes)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 30"
            min="1"
            step="5"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
            autoFocus
          />
        </div>

        {/* Quick Time Buttons */}
        <div className="flex gap-2">
          {quickTimes.map((time) => (
            <motion.button
              key={time}
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDuration(String(time))}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                duration === String(time)
                  ? "bg-primary text-white shadow-sm"
                  : "bg-bg border-2 border-border text-text-secondary hover:border-primary/30"
              }`}
            >
              {time}m
            </motion.button>
          ))}
        </div>

        {/* Note Input */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What did you work on?"
            className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || !duration || !hasSelection}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock size={18} />
              </motion.div>
              Logging...
            </>
          ) : (
            <>
              <Save size={18} />
              Log Time
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
