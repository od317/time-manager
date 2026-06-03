"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { Play, Pause, Square, Brain, Coffee, Zap } from "lucide-react";
import { resumeAudioContext } from "@/lib/sounds";
import { PomodoroSettings } from "./PomodoroSettings";
import { loadPomodoroConfig } from "@/lib/timerPersistence";

export function PomodoroTimer() {
  const {
    elapsed,
    isLoading,
    pomodoroState,
    pomodoroConfig,
    runningTimer,
    sessionStartTime,
    stop,
    pause,
    resume,
    handlePhaseComplete,
    selectedTask,
  } = useTimerStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSelection = selectedTask !== null;
  const selectedPreset = useTimerStore((s) => s.selectedPreset) || "Classic";

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const savedConfig =
    typeof window !== "undefined" ? loadPomodoroConfig() : null;

  useEffect(() => {
    if (pomodoroState && sessionStartTime) {
      const tick = () => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const timeLeft = Math.max(pomodoroState.timeLeftInPhase - elapsed, 0);

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
    resumeAudioContext();
    const { startPomodoro } = useTimerStore.getState();
    startPomodoro();
  };

  const isRunning = !!sessionStartTime;
  const isPaused = pomodoroState && !sessionStartTime;
  const isActive = isRunning || isPaused;

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
          {isRunning && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-text-muted"
            >
              In progress...
            </motion.p>
          )}
        </div>
        <PomodoroSettings />
      </div>

      {/* Session Dots */}
      {pomodoroState && (
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: pomodoroConfig.sessionsBeforeLongBreak }).map(
            (_, i) => (
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
            ),
          )}
          <span className="text-xs font-medium text-text-muted ml-2 bg-bg px-2 py-0.5 rounded-full">
            {pomodoroState.sessionsCompleted} done
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
          className={`text-7xl font-mono font-bold tabular-nums tracking-tight ${
            isRunning ? phaseInfo.color : "text-text"
          }`}
        >
          {formatTime(elapsed)}
        </span>
      </motion.div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-border rounded-full overflow-hidden mb-8">
        <motion.div
          className={`h-full rounded-full ${phaseInfo.color.replace("text", "bg")} bg-current`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.button
              key="start-pomodoro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartPomodoro}
              disabled={isLoading || !hasSelection}
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Play size={20} className="fill-current" />
              {isLoading
                ? "Starting..."
                : pomodoroState
                  ? "Continue"
                  : "Start Pomodoro"}
            </motion.button>
          ) : (
            <motion.div
              key="pomodoro-controls"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3"
            >
              {isRunning && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={pause}
                  className="flex items-center gap-2 px-6 py-3 bg-warning-bg text-warning rounded-2xl font-semibold hover:shadow-md transition-all"
                >
                  <Pause size={18} /> Pause
                </motion.button>
              )}
              {isPaused && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resume}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  <Play size={18} className="fill-current" /> Resume
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stop}
                className="flex items-center gap-2 px-6 py-3 bg-danger-bg text-danger rounded-2xl font-semibold hover:shadow-md transition-all"
              >
                <Square size={18} /> End
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
