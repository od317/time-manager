// components/timer/TimerBar.tsx
"use client";

import { motion } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { Pause, Play, Square, RotateCcw } from "lucide-react";

export function TimerBar() {
  const {
    timerMode,
    elapsed,
    selectedTask,
    runningTimer,
    pomodoroState,
    isPomodoroPaused,
    pause,
    resume,
    stop,
    endPomodoroSession,
    getCurrentPhaseLabel,
  } = useTimerStore();

  const isSimple = timerMode === "SIMPLE";
  const isPomodoro = timerMode === "POMODORO";

  // Don't show if no timer is active
  if (!selectedTask) return null;
  if (isSimple && !runningTimer) return null;
  if (isPomodoro && !pomodoroState) return null;

  const isRunning = runningTimer?.status === "RUNNING" && !isPomodoroPaused;
  const isPaused = runningTimer?.status === "PAUSED" || isPomodoroPaused;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(Math.abs(seconds) / 60);
    const s = Math.floor(Math.abs(seconds) % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-primary-bg/50 border border-primary/20 text-sm"
    >
      {/* Indicator */}
      {isRunning ? (
        <span className="w-2 h-2 rounded-full bg-success animate-pulse flex-shrink-0" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-warning flex-shrink-0" />
      )}

      {/* Time */}
      <span className="font-mono font-bold text-text tabular-nums">
        {formatTime(elapsed)}
      </span>

      {/* Phase (Pomodoro only) */}
      {isPomodoro && pomodoroState && (
        <span className="text-xs text-text-muted">
          {getCurrentPhaseLabel()} ({pomodoroState.sessionsCompleted + 1}/
          {pomodoroState.sessionsCompleted + 1})
        </span>
      )}

      {/* Task name */}
      <span className="text-xs text-text-secondary truncate max-w-[160px]">
        {selectedTask.title}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {isSimple && isRunning && (
          <button
            onClick={pause}
            className="p-1 rounded-lg hover:bg-warning-bg text-text-muted hover:text-warning transition-colors"
            title="Pause"
          >
            <Pause size={14} />
          </button>
        )}
        {isSimple && isPaused && (
          <button
            onClick={resume}
            className="p-1 rounded-lg hover:bg-primary-bg text-text-muted hover:text-primary transition-colors"
            title="Resume"
          >
            <Play size={14} className="fill-current" />
          </button>
        )}
        {isPomodoro && isPaused && (
          <button
            onClick={() => useTimerStore.getState().resumePomodoro()}
            className="p-1 rounded-lg hover:bg-primary-bg text-text-muted hover:text-primary transition-colors"
            title="Continue"
          >
            <Play size={14} className="fill-current" />
          </button>
        )}
        {isSimple && (
          <button
            onClick={stop}
            className="p-1 rounded-lg hover:bg-danger-bg text-text-muted hover:text-danger transition-colors"
            title="Stop timer"
          >
            <Square size={14} />
          </button>
        )}
        {isPomodoro && (
          <button
            onClick={endPomodoroSession}
            className="p-1 rounded-lg hover:bg-danger-bg text-text-muted hover:text-danger transition-colors"
            title="End session"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
