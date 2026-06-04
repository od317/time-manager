"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import {
  Play,
  Square,
  Brain,
  Coffee,
  Zap,
  WifiOff,
  Minus,
  Plus,
} from "lucide-react";
import { resumeAudioContext } from "@/lib/sounds";
import { PomodoroSettings } from "./PomodoroSettings";

export function PomodoroTimer() {
  const {
    elapsed,
    isLoading,
    pomodoroState,
    pomodoroConfig,
    sessionStartTime,
    stop,
    handlePhaseComplete,
    selectedTask,
    selectedPreset,
  } = useTimerStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSelection = selectedTask !== null;
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);
  const [totalSessions, setTotalSessions] = useState(4);
  const [isEnding, setIsEnding] = useState(false);

  // Track online/offline
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync pending sessions when online
  useEffect(() => {
    if (!isOffline && pendingSync) {
      syncPendingSessions();
    }
  }, [isOffline, pendingSync]);

  const syncPendingSessions = async () => {
    try {
      const pending = localStorage.getItem("pomodoro-pending");
      if (pending) {
        const sessions = JSON.parse(pending);
        for (const session of sessions) {
          await useTimerStore.getState().syncPomodoroSession(session);
        }
        localStorage.removeItem("pomodoro-pending");
        setPendingSync(false);
      }
    } catch {}
  };

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Countdown
  useEffect(() => {
    if (pomodoroState && sessionStartTime) {
      const tick = () => {
        const phaseElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const timeLeft = Math.max(
          pomodoroState.timeLeftInPhase - phaseElapsed,
          0,
        );
        useTimerStore.setState({ elapsed: timeLeft });

        if (timeLeft <= 0) {
          clearTimerInterval();
          handlePhaseComplete();
        }
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTimerInterval();
    }
    return clearTimerInterval;
  }, [
    pomodoroState?.phase,
    sessionStartTime,
    clearTimerInterval,
    handlePhaseComplete,
  ]);

  const handleStartPomodoro = () => {
    if (isOffline) return;
    resumeAudioContext();
    const { startPomodoro } = useTimerStore.getState();
    // Set the number of sessions before starting
    useTimerStore.setState({
      pomodoroConfig: {
        ...pomodoroConfig,
        sessionsBeforeLongBreak: totalSessions,
      },
    });
    startPomodoro();
  };

  const handleEndSession = async () => {
    if (isEnding) return;
    setIsEnding(true);
    clearTimerInterval();

    const state = useTimerStore.getState();

    // Only save if at least one work session was completed
    const sessionsCompleted = state.pomodoroState?.sessionsCompleted || 0;

    if (sessionsCompleted > 0) {
      // Save completed sessions
      const workTimeSpent = pomodoroConfig.workDuration;
      const sessionData = {
        taskId: state.selectedTask?.id,
        goalId: state.selectedTask?.goalId ?? undefined,
        duration: workTimeSpent * sessionsCompleted,
        sessionsCompleted,
        timestamp: Date.now(),
      };

      if (isOffline) {
        const pending = JSON.parse(
          localStorage.getItem("pomodoro-pending") || "[]",
        );
        pending.push(sessionData);
        localStorage.setItem("pomodoro-pending", JSON.stringify(pending));
        setPendingSync(true);
      } else {
        try {
          await useTimerStore.getState().syncPomodoroSession(sessionData);
        } catch {
          const pending = JSON.parse(
            localStorage.getItem("pomodoro-pending") || "[]",
          );
          pending.push(sessionData);
          localStorage.setItem("pomodoro-pending", JSON.stringify(pending));
          setPendingSync(true);
        }
      }
    }

    // Always stop and clear
    stop();
    setIsEnding(false);
  };

  const isRunning = !!sessionStartTime;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(Math.abs(seconds) / 60);
    const s = Math.floor(Math.abs(seconds) % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const phase = pomodoroState?.phase;

  const getPhaseInfo = () => {
    if (!phase)
      return {
        icon: Brain,
        label: "Ready",
        color: "text-primary",
        bg: "bg-primary-bg",
        borderColor: "border-primary/20",
      };
    switch (phase) {
      case "WORK":
        return {
          icon: Brain,
          label: "Focus Time",
          color: "text-danger",
          bg: "bg-danger-bg",
          borderColor: "border-danger/20",
        };
      case "SHORT_BREAK":
        return {
          icon: Coffee,
          label: "Short Break",
          color: "text-success",
          bg: "bg-success-bg",
          borderColor: "border-success/20",
        };
      case "LONG_BREAK":
        return {
          icon: Zap,
          label: "Long Break",
          color: "text-warning",
          bg: "bg-warning-bg",
          borderColor: "border-warning/20",
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

  // Calculate session summary
  const totalWorkMinutes = (totalSessions * pomodoroConfig.workDuration) / 60;
  const totalBreakMinutes =
    ((totalSessions - 1) * pomodoroConfig.shortBreakDuration +
      pomodoroConfig.longBreakDuration) /
    60;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto"
    >
      {/* Phase Indicator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <motion.div
          className={`p-3 rounded-2xl ${phaseInfo.bg} border ${phaseInfo.borderColor}`}
          animate={isRunning ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <PhaseIcon size={24} className={phaseInfo.color} />
        </motion.div>
        <div>
          <span className={`text-sm font-bold ${phaseInfo.color}`}>
            {phaseInfo.label}
          </span>
          <span className="text-xs text-text-muted block">
            {selectedPreset}
          </span>
          {isOffline && (
            <p className="text-xs text-warning flex items-center gap-1">
              <WifiOff size={10} /> Offline
            </p>
          )}
          {pendingSync && !isOffline && (
            <p className="text-xs text-warning">Syncing...</p>
          )}
        </div>
        <PomodoroSettings />
      </div>

      {/* Session Selector - only when not running */}
      {!isRunning && !pomodoroState && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-text-muted text-center mb-3">
            Number of Sessions
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setTotalSessions(Math.max(1, totalSessions - 1))}
              className="p-2 rounded-xl border-2 border-border hover:border-primary/30 transition-all"
            >
              <Minus size={16} />
            </button>
            <span className="text-2xl font-bold text-text w-12 text-center">
              {totalSessions}
            </span>
            <button
              onClick={() => setTotalSessions(Math.min(10, totalSessions + 1))}
              className="p-2 rounded-xl border-2 border-border hover:border-primary/30 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-3 p-3 bg-bg rounded-xl border border-border">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>Work time</span>
              <span className="font-medium text-text">
                {totalWorkMinutes} min
              </span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>Break time</span>
              <span className="font-medium text-text">
                {totalBreakMinutes} min
              </span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary mt-1 pt-1 border-t border-border">
              <span>Total</span>
              <span className="font-medium text-text">
                {totalWorkMinutes + totalBreakMinutes} min
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Session Dots */}
      {pomodoroState && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: totalSessions }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-3 h-3 rounded-full transition-all ${
                i < pomodoroState.sessionsCompleted
                  ? "bg-primary"
                  : i === pomodoroState.sessionsCompleted && phase === "WORK"
                    ? "bg-primary/30 animate-pulse"
                    : "bg-border"
              }`}
            />
          ))}
          <span className="text-xs font-medium text-text-muted ml-2 bg-bg px-2 py-0.5 rounded-full">
            {pomodoroState.sessionsCompleted}/{totalSessions}
          </span>
        </div>
      )}

      {/* Timer Display */}
      <motion.div
        className="mb-6"
        animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span
          className={`text-7xl font-mono font-bold tabular-nums tracking-tight ${isRunning ? phaseInfo.color : "text-text"}`}
        >
          {formatTime(elapsed)}
        </span>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-8">
        <motion.div
          className={`h-full rounded-full bg-current ${phaseInfo.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartPomodoro}
            disabled={isLoading || !hasSelection || isOffline}
            className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Play size={20} className="fill-current" />
            {isLoading ? "Starting..." : "Start Pomodoro"}
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndSession}
            disabled={isEnding}
            className="flex items-center gap-2 px-8 py-3.5 bg-danger-bg text-danger rounded-2xl font-semibold hover:shadow-md transition-all disabled:opacity-50"
          >
            <Square size={18} />
            {isEnding ? "Ending..." : "End Session"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
