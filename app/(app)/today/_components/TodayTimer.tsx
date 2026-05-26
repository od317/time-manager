"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/store/timerStore";
import { Play, Pause, Square, Clock } from "lucide-react";
import { TimeEntry } from "@/types";

interface TodayTimerProps {
  runningTimer: TimeEntry | null;
}

export function TodayTimer({ runningTimer: initialTimer }: TodayTimerProps) {
  const {
    runningTimer,
    elapsed,
    isLoading,
    setRunningTimer,
    start,
    stop,
    pause,
    resume,
  } = useTimerStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial server data to store
  useEffect(() => {
    if (initialTimer) {
      setRunningTimer(initialTimer);
    }
  }, [initialTimer, setRunningTimer]);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Track elapsed time
  useEffect(() => {
    if (runningTimer?.status === "RUNNING" && runningTimer.startTime) {
      const startTime = new Date(runningTimer.startTime).getTime();

      const tick = () => {
        useTimerStore.setState({
          elapsed: Math.floor((Date.now() - startTime) / 1000),
        });
      };

      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else if (runningTimer?.duration) {
      useTimerStore.setState({ elapsed: runningTimer.duration });
    }

    return clearTimerInterval;
  }, [runningTimer, clearTimerInterval]);

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isRunning = runningTimer?.status === "RUNNING";
  const isPaused = runningTimer?.status === "PAUSED";

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-text">Focus Timer</h3>
      </div>

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
        {!runningTimer || runningTimer.status === "COMPLETED" ? (
          <button
            onClick={start}
            disabled={isLoading}
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
                <Pause size={18} />
                Pause
              </button>
            )}
            {isPaused && (
              <button
                onClick={resume}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
              >
                <Play size={18} />
                Resume
              </button>
            )}
            <button
              onClick={stop}
              className="flex items-center gap-2 px-5 py-2.5 bg-danger-bg text-danger rounded-lg font-medium hover:bg-danger/10 transition-all"
            >
              <Square size={18} />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}
