"use client";

import { useEffect, useRef, useCallback } from "react";
import { TimeEntry, Goal } from "@/types";
import { useTimerStore } from "@/store/timerStore";
import { TaskSelector } from "./TaskSelector";
import { TimerModeTabs } from "./TimerModeTabs";
import { QuickLogForm } from "./QuickLogForm";
import { PomodoroTimer } from "./PomodoroTimer";
import { Play, Pause, Square, Clock } from "lucide-react";
import { SessionHistory } from "./SessionHistory";

interface TodayTimerProps {
  runningTimer: TimeEntry | null;
  goals: Goal[];
}

export function TodayTimer({
  runningTimer: initialTimer,
  goals,
}: TodayTimerProps) {
  const {
    runningTimer,
    elapsed,
    isLoading,
    sessionStartTime,
    accumulatedBeforePause,
    timerMode,
    setRunningTimer,
    start,
    stop,
    pause,
    resume,
    selectedTask,
    selectedGoal,
  } = useTimerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSelection = selectedTask !== null;

  useEffect(() => {
    if (initialTimer && !runningTimer) {
      setRunningTimer(initialTimer);
    }
  }, [initialTimer, runningTimer, setRunningTimer]);

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
        const currentElapsed = Math.floor(
          (Date.now() - sessionStartTime) / 1000,
        );
        useTimerStore.setState({
          elapsed: accumulatedBeforePause + currentElapsed,
        });
      };

      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else if (runningTimer?.status === "PAUSED") {
      clearTimerInterval();
    } else if (!runningTimer || runningTimer.status === "COMPLETED") {
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
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isRunning = runningTimer?.status === "RUNNING";
  const isPaused = runningTimer?.status === "PAUSED";
  const isActive = isRunning || isPaused;

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      {/* Header with task selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text">Focus Timer</h3>
          <SessionHistory />
        </div>
        <TaskSelector goals={goals} />
      </div>

      {/* Mode switcher */}
      <div className="mb-6">
        <TimerModeTabs />
      </div>

      {/* Quick Log Mode */}
      {timerMode === "QUICK_LOG" && <QuickLogForm />}

      {/* Pomodoro Mode */}
      {timerMode === "POMODORO" && <PomodoroTimer />}

      {/* Simple Mode */}
      {timerMode === "SIMPLE" && (
        <>
          <div className="text-center mb-6">
            <span
              className={`text-5xl font-mono font-bold tabular-nums ${
                isRunning ? "text-primary" : "text-text"
              }`}
            >
              {formatTime(elapsed)}
            </span>
            {runningTimer?.note && (
              <p className="text-sm text-text-muted mt-2 truncate">
                {runningTimer.note}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            {!isActive ? (
              <button
                onClick={() => start()}
                disabled={isLoading || !hasSelection}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
              >
                <Play size={18} />
                {isLoading ? "Starting..." : "Start"}
              </button>
            ) : (
              <>
                {isRunning && (
                  <button
                    onClick={pause}
                    className="flex items-center gap-2 px-5 py-2.5 bg-warning-bg text-warning rounded-lg font-medium hover:bg-warning/10 transition-all"
                  >
                    <Pause size={18} /> Pause
                  </button>
                )}
                {isPaused && (
                  <button
                    onClick={resume}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
                  >
                    <Play size={18} /> Resume
                  </button>
                )}
                <button
                  onClick={stop}
                  className="flex items-center gap-2 px-5 py-2.5 bg-danger-bg text-danger rounded-lg font-medium hover:bg-danger/10 transition-all"
                >
                  <Square size={18} /> Stop
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
