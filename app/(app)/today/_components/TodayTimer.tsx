"use client";

import { useEffect, useRef, useCallback } from "react";
import { Goal, TimeEntry } from "@/types";
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSelection = selectedTask !== null;

  // Sync initial server timer to store ONCE
  useEffect(() => {
    if (initialTimer && !store.runningTimer) {
      store.setRunningTimer(initialTimer);
    }
  }, []); // Empty deps - run once

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
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text">Focus Timer</h3>
          <SessionHistory />
        </div>
        <TaskSelector goals={goals} />
      </div>

      <div className="mb-6">
        <TimerModeTabs />
      </div>

      {timerMode === "QUICK_LOG" && <QuickLogForm />}
      {timerMode === "POMODORO" && <PomodoroTimer />}

      {timerMode === "SIMPLE" && (
        <>
          <div className="text-center mb-6">
            <span
              className={`text-5xl font-mono font-bold tabular-nums ${isRunning ? "text-primary" : "text-text"}`}
            >
              {formatTime(elapsed)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            {!isActive ? (
              <button
                onClick={() => useTimerStore.getState().start()}
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
                    onClick={() => useTimerStore.getState().pause()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-warning-bg text-warning rounded-lg font-medium hover:bg-warning/10 transition-all"
                  >
                    <Pause size={18} /> Pause
                  </button>
                )}
                {isPaused && (
                  <button
                    onClick={() => useTimerStore.getState().resume()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
                  >
                    <Play size={18} /> Resume
                  </button>
                )}
                <button
                  onClick={() => useTimerStore.getState().stop()}
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
