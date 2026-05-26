"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/store/timerStore";
import { Play, Pause, Square, Brain, Coffee, Zap } from "lucide-react";
import { resumeAudioContext } from "@/lib/sounds";

export function PomodoroTimer() {
  const {
    runningTimer,
    elapsed,
    isLoading,
    sessionStartTime,
    accumulatedBeforePause,
    pomodoroState,
    pomodoroConfig,
    start,
    stop,
    pause,
    resume,
    handlePhaseComplete,
    selectedGoal,
    selectedTask,
  } = useTimerStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSelection = selectedTask !== null || selectedGoal !== null;

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Countdown timer for pomodoro
  useEffect(() => {
    if (
      runningTimer?.status === "RUNNING" &&
      sessionStartTime &&
      pomodoroState
    ) {
      const tick = () => {
        const elapsedInPhase = Math.floor(
          (Date.now() - sessionStartTime) / 1000,
        );
        const timeLeft = Math.max(
          pomodoroState.timeLeftInPhase - elapsedInPhase,
          0,
        );

        useTimerStore.setState({
          elapsed: timeLeft,
        });

        // Phase complete
        if (timeLeft <= 0) {
          clearTimerInterval();
          handlePhaseComplete();
        }
      };

      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else if (runningTimer?.status === "PAUSED") {
      clearTimerInterval();
    }

    return clearTimerInterval;
  }, [
    runningTimer?.status,
    sessionStartTime,
    pomodoroState,
    handlePhaseComplete,
    clearTimerInterval,
  ]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const isRunning = runningTimer?.status === "RUNNING";
  const isPaused = runningTimer?.status === "PAUSED";
  const isActive = isRunning || isPaused;
  const phase = pomodoroState?.phase;

  const getPhaseInfo = () => {
    if (!phase)
      return {
        icon: Brain,
        label: "Ready",
        color: "text-primary",
        bg: "bg-primary-bg",
      };
    switch (phase) {
      case "WORK":
        return {
          icon: Brain,
          label: "Focus",
          color: "text-danger",
          bg: "bg-danger-bg",
        };
      case "SHORT_BREAK":
        return {
          icon: Coffee,
          label: "Short Break",
          color: "text-success",
          bg: "bg-success-bg",
        };
      case "LONG_BREAK":
        return {
          icon: Zap,
          label: "Long Break",
          color: "text-warning",
          bg: "bg-warning-bg",
        };
    }
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;
  const totalPhaseTime =
    pomodoroState?.timeLeftInPhase || pomodoroConfig.workDuration;
  const progress =
    totalPhaseTime > 0
      ? ((totalPhaseTime - elapsed) / totalPhaseTime) * 100
      : 0;

  return (
    <div className="text-center">
      {/* Phase indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div
          className={`w-8 h-8 rounded-lg ${phaseInfo.bg} flex items-center justify-center`}
        >
          <PhaseIcon size={18} className={phaseInfo.color} />
        </div>
        <span className={`text-sm font-semibold ${phaseInfo.color}`}>
          {phaseInfo.label}
        </span>
      </div>

      {/* Sessions counter */}
      {pomodoroState && (
        <div className="flex items-center justify-center gap-1 mb-4">
          {Array.from({ length: pomodoroConfig.sessionsBeforeLongBreak }).map(
            (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < pomodoroState.sessionsCompleted
                    ? "bg-primary"
                    : i === pomodoroState.sessionsCompleted && phase === "WORK"
                      ? "bg-primary/30 animate-pulse"
                      : "bg-border"
                }`}
              />
            ),
          )}
          <span className="text-xs text-text-muted ml-2">
            {pomodoroState.sessionsCompleted} sessions
          </span>
        </div>
      )}

      {/* Timer display */}
      <div className="mb-6">
        <span
          className={`text-5xl font-mono font-bold tabular-nums ${
            isRunning ? phaseInfo.color : "text-text"
          }`}
        >
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-6">
        <div
          className={`h-full rounded-full transition-all ${phaseInfo.color.replace("text", "bg")}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isActive ? (
          <button
            onClick={() => {
              resumeAudioContext();
              start();
            }}
            disabled={isLoading || !hasSelection}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
          >
            <Play size={18} />
            {isLoading
              ? "Starting..."
              : pomodoroState
                ? "Continue"
                : "Start Pomodoro"}
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
              <Square size={18} /> End Session
            </button>
          </>
        )}
      </div>
    </div>
  );
}
