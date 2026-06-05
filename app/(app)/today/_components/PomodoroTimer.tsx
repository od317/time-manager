"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Pause,
  RotateCcw,
  Timer,
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
    handlePhaseComplete,
    selectedTask,
    selectedPreset,
    recoveredPomodoro,
    isPomodoroPaused,
    resumePomodoro,
    endPomodoroSession,
    startPomodoro,
  } = useTimerStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSelection = selectedTask !== null;
  const [isOffline, setIsOffline] = useState(false);
  const [totalSessions, setTotalSessions] = useState(
    () => pomodoroState?.sessionsCompleted || 4,
  );
  const [isEnding, setIsEnding] = useState(false);

  // ============================================================================
  // ONLINE/OFFLINE TRACKING
  // ============================================================================

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

  // ============================================================================
  // TIMER INTERVAL MANAGEMENT
  // ============================================================================

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ============================================================================
  // COUNTDOWN LOGIC
  // ============================================================================

  useEffect(() => {
    if (pomodoroState && sessionStartTime && !isPomodoroPaused) {
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

      // Initial tick
      tick();

      // Start interval
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTimerInterval();
    }

    return clearTimerInterval;
  }, [
    pomodoroState?.phase,
    pomodoroState?.sessionsCompleted,
    sessionStartTime,
    isPomodoroPaused,
    clearTimerInterval,
    handlePhaseComplete,
  ]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleStartPomodoro = () => {
    if (isOffline) return;
    resumeAudioContext();
    startPomodoro(totalSessions);
  };

  const handleContinuePomodoro = () => {
    resumeAudioContext();
    resumePomodoro();
  };

  const handleEndSession = async () => {
    if (isEnding) return;
    setIsEnding(true);
    clearTimerInterval();
    await endPomodoroSession();
    setIsEnding(false);
  };

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const isRunning =
    !!sessionStartTime && !isPomodoroPaused && !recoveredPomodoro;
  const isPaused = !!pomodoroState && (isPomodoroPaused || recoveredPomodoro);
  const hasStarted = !!pomodoroState;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(Math.abs(seconds) / 60);
    const s = Math.floor(Math.abs(seconds) % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // ============================================================================
  // PHASE INFORMATION
  // ============================================================================

  const phase = pomodoroState?.phase;

  const getPhaseInfo = () => {
    if (!phase) {
      return {
        icon: Brain,
        label: "Ready",
        color: "text-primary",
        bg: "bg-primary-bg",
        borderColor: "border-primary/20",
      };
    }

    switch (phase) {
      case "WORK":
        return {
          icon: Brain,
          label: "Focus Time",
          color: "text-red-500",
          bg: "bg-red-50 dark:bg-red-950",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "SHORT_BREAK":
        return {
          icon: Coffee,
          label: "Short Break",
          color: "text-green-500",
          bg: "bg-green-50 dark:bg-green-950",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "LONG_BREAK":
        return {
          icon: Zap,
          label: "Long Break",
          color: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-950",
          borderColor: "border-amber-200 dark:border-amber-800",
        };
    }
  };

  const phaseInfo = getPhaseInfo();
  const PhaseIcon = phaseInfo.icon;
  const totalPhaseTime =
    pomodoroState?.timeLeftInPhase || pomodoroConfig.workDuration;
  const timeSpent = totalPhaseTime - elapsed; // How much time has passed
  const progress = totalPhaseTime > 0 ? (timeSpent / totalPhaseTime) * 100 : 0;

  // ============================================================================
  // SESSION CALCULATIONS
  // ============================================================================

  const totalWorkMinutes = (totalSessions * pomodoroConfig.workDuration) / 60;
  const totalBreakMinutes =
    ((totalSessions - 1) * pomodoroConfig.shortBreakDuration +
      pomodoroConfig.longBreakDuration) /
    60;

  // Use the stored total sessions if recovering, otherwise use the selected amount
  const effectiveTotalSessions = pomodoroState
    ? Math.max(totalSessions, pomodoroState.sessionsCompleted)
    : totalSessions;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto"
    >
      {/* ========================================================================
          PHASE INDICATOR
          ======================================================================== */}
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

          {/* Status indicators */}
          {isOffline && (
            <p className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
              <WifiOff size={10} /> Offline
            </p>
          )}
          {isPaused && !isOffline && (
            <p className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
              <Pause size={10} /> Paused
            </p>
          )}
          {recoveredPomodoro && (
            <p className="text-xs text-blue-500 flex items-center gap-1 mt-0.5">
              <Timer size={10} /> Session recovered
            </p>
          )}
        </div>

        <PomodoroSettings />
      </div>

      {/* ========================================================================
          SESSION SELECTOR (only when not started)
          ======================================================================== */}
      {!hasStarted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <p className="text-xs font-semibold text-text-muted text-center mb-3">
            Number of Sessions
          </p>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setTotalSessions(Math.max(1, totalSessions - 1))}
              className="p-2 rounded-xl border-2 border-border hover:border-primary/30 transition-all active:scale-95"
              aria-label="Decrease sessions"
            >
              <Minus size={16} />
            </button>

            <span className="text-2xl font-bold text-text w-12 text-center tabular-nums">
              {totalSessions}
            </span>

            <button
              onClick={() => setTotalSessions(Math.min(10, totalSessions + 1))}
              className="p-2 rounded-xl border-2 border-border hover:border-primary/30 transition-all active:scale-95"
              aria-label="Increase sessions"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Session Summary */}
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
        </motion.div>
      )}

      {/* ========================================================================
          SESSION DOTS
          ======================================================================== */}
      {pomodoroState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          {Array.from({ length: effectiveTotalSessions }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < pomodoroState.sessionsCompleted
                  ? "bg-primary shadow-sm shadow-primary/30"
                  : i === pomodoroState.sessionsCompleted && phase === "WORK"
                    ? "bg-primary/30 animate-pulse"
                    : "bg-border"
              }`}
            />
          ))}
          <span className="text-xs font-medium text-text-muted ml-2 bg-bg px-2 py-0.5 rounded-full">
            {pomodoroState.sessionsCompleted}/{effectiveTotalSessions}
          </span>
        </motion.div>
      )}

      {/* ========================================================================
          TIMER DISPLAY
          ======================================================================== */}
      <motion.div
        className="mb-6 text-center"
        animate={
          isRunning
            ? { scale: [1, 1.02, 1] }
            : isPaused
              ? { opacity: [0.7, 1, 0.7] }
              : {}
        }
        transition={
          isRunning
            ? { duration: 2, repeat: Infinity }
            : isPaused
              ? { duration: 2, repeat: Infinity }
              : {}
        }
      >
        <span
          className={`text-7xl font-mono font-bold tabular-nums tracking-tight select-none ${
            isRunning
              ? phaseInfo.color
              : isPaused
                ? "text-amber-500"
                : "text-text"
          }`}
        >
          {formatTime(elapsed)}
        </span>
      </motion.div>

      {/* ========================================================================
          PROGRESS BAR
          ======================================================================== */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden mb-8">
        <motion.div
          className={`h-full rounded-full ${
            isRunning || isPaused ? phaseInfo.color : "bg-primary"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* ========================================================================
          CONTROLS
          ======================================================================== */}
      <div className="flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          {/* START BUTTON */}
          {!hasStarted && (
            <motion.button
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartPomodoro}
              disabled={isLoading || !hasSelection || isOffline}
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play size={20} className="fill-current" />
              {isLoading ? "Starting..." : "Start Pomodoro"}
            </motion.button>
          )}

          {/* PAUSED CONTROLS (Recovery or manual pause) */}
          {isPaused && (
            <motion.div
              key="paused-controls"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleContinuePomodoro}
                className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Play size={20} className="fill-current" />
                Continue
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndSession}
                disabled={isEnding}
                className="flex items-center gap-2 px-6 py-3.5 bg-red-50 dark:bg-red-950 text-red-500 rounded-2xl font-semibold hover:shadow-md transition-all disabled:opacity-50 border border-red-200 dark:border-red-800"
              >
                <RotateCcw size={18} />
                {isEnding ? "Resetting..." : "Reset"}
              </motion.button>
            </motion.div>
          )}

          {/* RUNNING CONTROLS */}
          {isRunning && (
            <motion.button
              key="running"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEndSession}
              disabled={isEnding}
              className="flex items-center gap-2 px-8 py-3.5 bg-red-50 dark:bg-red-950 text-red-500 rounded-2xl font-semibold hover:shadow-md transition-all disabled:opacity-50 border border-red-200 dark:border-red-800"
            >
              <Square size={18} />
              {isEnding ? "Ending..." : "End Session"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================
          HELPER TEXT
          ======================================================================== */}
      {!hasSelection && !hasStarted && (
        <p className="text-xs text-text-muted text-center mt-4">
          Select a task to start focusing
        </p>
      )}

      {isOffline && hasSelection && !hasStarted && (
        <p className="text-xs text-amber-500 text-center mt-4">
          Pomodoro requires an internet connection to start
        </p>
      )}

      {recoveredPomodoro && (
        <p className="text-xs text-blue-500 text-center mt-4">
          Session recovered from {pomodoroConfig.workDuration / 60} minutes ago.
          Press Continue to resume.
        </p>
      )}
    </motion.div>
  );
}
