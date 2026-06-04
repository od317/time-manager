"use client";

import { useEffect, useRef, useCallback } from "react";
import { Goal, TimeEntry } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { useTaskStore } from "@/store/taskStore";
import { TaskSelector } from "./TaskSelector";
import { TimerModeTabs } from "./TimerModeTabs";
import { QuickLogForm } from "./QuickLogForm";
import { PomodoroTimer } from "./PomodoroTimer";
import { Play, Pause, Square, Clock, CheckCircle2 } from "lucide-react";
import { SessionHistory } from "./SessionHistory";
import { taskService } from "@/lib/services/taskService";
import { buildPersistedState, saveTimerState } from "@/lib/timerPersistence";

interface TodayTimerProps {
  runningTimer: TimeEntry | null;
  goals: Goal[];
}

export function TodayTimer({
  runningTimer: initialTimer,
  goals,
}: TodayTimerProps) {
  const store = useTimerStore();
  const {
    runningTimer,
    elapsed,
    isLoading,
    sessionStartTime,
    accumulatedBeforePause,
    timerMode,
    selectedTask,
  } = store;
  const { markComplete } = useTaskStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSelection = useTimerStore((s) => s.selectedTask !== null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (
      runningTimer?.status === "RUNNING" &&
      sessionStartTime &&
      timerMode === "SIMPLE"
    ) {
      const tick = () => {
        const state = useTimerStore.getState();
        const currentElapsed = Math.floor(
          (Date.now() - sessionStartTime) / 1000,
        );
        const totalElapsed = state.accumulatedBeforePause + currentElapsed;

        useTimerStore.setState({ elapsed: totalElapsed });

        // Save to localStorage every tick
        saveTimerState(
          buildPersistedState(
            {
              ...state,
              elapsed: totalElapsed,
              accumulatedBeforePause: totalElapsed,
            },
            state.runningTimer?.id || null,
          ),
        );
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTimerInterval();
    }
    return clearTimerInterval;
  }, [
    runningTimer?.status,
    sessionStartTime,
    accumulatedBeforePause,
    timerMode,
    clearTimerInterval,
  ]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(Math.abs(seconds) / 3600);
    const m = Math.floor((Math.abs(seconds) % 3600) / 60);
    const s = Math.floor(Math.abs(seconds) % 60);
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isRunning = runningTimer?.status === "RUNNING";
  const isPaused = runningTimer?.status === "PAUSED";
  const isActive = isRunning || isPaused;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-surface rounded-2xl border border-border shadow-sm"
    >
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-bg">
            <Clock size={20} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text">Focus Timer</h3>
          <SessionHistory />
        </div>
        <TaskSelector goals={goals} />
      </div>
      <div className="px-6 pb-4">
        <TimerModeTabs />
      </div>
      <div className="px-6 pb-6">
        {timerMode === "QUICK_LOG" && <QuickLogForm />}
        {timerMode === "POMODORO" && <PomodoroTimer />}
        {timerMode === "SIMPLE" && (
          <div className="text-center">
            <motion.div
              className="mb-8"
              animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span
                className={`text-7xl font-mono font-bold tabular-nums tracking-tight ${isRunning ? "text-primary" : isPaused ? "text-warning" : "text-text"}`}
              >
                {formatTime(elapsed)}
              </span>
              {isRunning && (
                <motion.div
                  className="mt-2 flex items-center justify-center gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs font-medium text-success">
                    Running
                  </span>
                </motion.div>
              )}
              {isPaused && (
                <motion.div
                  className="mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-xs font-medium text-warning">
                    Paused
                  </span>
                </motion.div>
              )}
            </motion.div>
            <div className="flex items-center justify-center gap-3">
              <AnimatePresence mode="wait">
                {!isActive ? (
                  <motion.button
                    key="start"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => useTimerStore.getState().start()}
                    disabled={isLoading || !hasSelection}
                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Play size={20} className="fill-current" />
                    {isLoading ? "Starting..." : "Start Focus"}
                  </motion.button>
                ) : (
                  <motion.div
                    key="controls"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-3"
                  >
                    {isRunning && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => useTimerStore.getState().pause()}
                        className="flex items-center gap-2 px-6 py-3 bg-warning-bg text-warning rounded-2xl font-semibold hover:shadow-md transition-all"
                      >
                        <Pause size={18} /> Pause
                      </motion.button>
                    )}
                    {isPaused && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => useTimerStore.getState().resume()}
                        disabled={!hasSelection}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${hasSelection ? "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30" : "bg-border text-text-muted cursor-not-allowed"}`}
                      >
                        <Play size={18} className="fill-current" /> Resume
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => useTimerStore.getState().stop()}
                      className="flex items-center gap-2 px-6 py-3 bg-danger-bg text-danger rounded-2xl font-semibold hover:shadow-md transition-all"
                    >
                      <Square size={18} /> Stop
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {isPaused && !hasSelection && (
              <p className="text-xs text-text-muted mt-3">
                Select a task to resume
              </p>
            )}
          </div>
        )}
      </div>
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 py-3 bg-bg border-t border-border flex items-center gap-3"
        >
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: selectedTask.color || "#9FA1FF" }}
          />
          <span className="text-sm text-text-secondary flex-1 truncate">
            Focusing on:{" "}
            <span className="font-medium text-text">{selectedTask.title}</span>
          </span>
          <button
            onClick={async () => {
              try {
                if (isRunning) await useTimerStore.getState().pause();
                await taskService.update(selectedTask.id, {
                  status: "COMPLETED",
                });
                markComplete(selectedTask.id);
                useTimerStore.getState().clearSelection();
              } catch {}
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-success hover:bg-success-bg transition-all flex-shrink-0"
            title="Mark task as complete"
          >
            <CheckCircle2 size={14} /> Complete
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
