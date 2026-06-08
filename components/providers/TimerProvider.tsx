"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timerStore";
import {
  saveTimerState,
  buildPersistedState,
  loadTimerState,
} from "@/lib/timerPersistence";
import {
  loadPomodoroSession,
  savePomodoroSession,
} from "@/lib/pomodoroPersistence";
import { Task, TimeEntry, TimerMode } from "@/types";

export function TimerProvider() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const state = useTimerStore.getState();
      const {
        runningTimer,
        sessionStartTime,
        accumulatedBeforePause,
        timerMode,
        pomodoroState,
        isPomodoroPaused,
      } = state;

      // Simple timer tick
      if (
        timerMode === "SIMPLE" &&
        runningTimer?.status === "RUNNING" &&
        sessionStartTime
      ) {
        const currentElapsed = Math.floor(
          (Date.now() - sessionStartTime) / 1000,
        );
        const totalElapsed = accumulatedBeforePause + currentElapsed;
        useTimerStore.setState({ elapsed: totalElapsed });
      }

      // Pomodoro tick
      if (
        timerMode === "POMODORO" &&
        pomodoroState &&
        sessionStartTime &&
        !isPomodoroPaused
      ) {
        const phaseElapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const timeLeft = Math.max(
          pomodoroState.timeLeftInPhase - phaseElapsed,
          0,
        );
        useTimerStore.setState({ elapsed: timeLeft });

        // Save Pomodoro progress to localStorage
        const data = loadPomodoroSession();
        if (data) {
          data.timeLeftInPhase = timeLeft;
          data.lastTickTime = Date.now();
          data.lastActiveAt = Date.now();
          savePomodoroSession(data);
        }

        // Phase complete
        if (timeLeft <= 0) {
          state.handlePhaseComplete();
        }
      }
    };

    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Restore Simple Timer on mount
  // Restore timer state on mount (both Simple and Pomodoro)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const currentState = useTimerStore.getState();

    // Already running - don't touch
    if (currentState.runningTimer?.status === "RUNNING") return;
    if (
      currentState.pomodoroState &&
      currentState.sessionStartTime &&
      !currentState.isPomodoroPaused
    )
      return;

    // Check Pomodoro session first
    const pomodoroData = loadPomodoroSession();
    if (pomodoroData) {
      const secondsSinceLastSave =
        (Date.now() - pomodoroData.lastActiveAt) / 1000;
      if (secondsSinceLastSave < 30 && pomodoroData.currentPhase === "WORK") {
        // Restore running Pomodoro
        const phaseElapsed = Math.floor(
          (Date.now() - pomodoroData.sessionStartTime) / 1000,
        );
        const timeLeft = Math.max(
          pomodoroData.timeLeftInPhase - phaseElapsed,
          0,
        );

        if (timeLeft > 0) {
          useTimerStore.setState({
            pomodoroState: {
              phase: pomodoroData.currentPhase as any,
              sessionsCompleted: pomodoroData.sessionsCompleted,
              timeLeftInPhase: pomodoroData.timeLeftInPhase,
            },
            sessionStartTime: pomodoroData.sessionStartTime,
            elapsed: timeLeft,
            timerMode: "POMODORO" as TimerMode,
            isPomodoroPaused: false,
            recoveredPomodoro: false,
          });
          return;
        }
      }
    }

    // Check Simple timer
    const persisted = loadTimerState();
    if (!persisted || persisted.timerMode !== "SIMPLE") return;

    const secondsSinceLastSave = (Date.now() - persisted.savedAt) / 1000;
    if (secondsSinceLastSave > 30) return;

    if (persisted.runningTimerId && persisted.sessionStartTime) {
      const actualElapsed = Math.floor(
        (Date.now() - persisted.sessionStartTime) / 1000,
      );
      const totalElapsed =
        (persisted.accumulatedBeforePause || 0) + actualElapsed;

      useTimerStore.setState({
        runningTimer: {
          id: persisted.runningTimerId,
          status: "RUNNING" as const,
        } as TimeEntry,
        sessionStartTime: persisted.sessionStartTime,
        accumulatedBeforePause: persisted.accumulatedBeforePause || 0,
        elapsed: totalElapsed,
        selectedTask: persisted.selectedTaskId
          ? ({
              id: persisted.selectedTaskId,
              title: persisted.selectedTaskTitle || "",
              color: persisted.selectedTaskColor || "#6366F1",
              goalId: persisted.selectedTaskGoalId || null,
            } as Task)
          : null,
        timerMode: "SIMPLE" as TimerMode,
        sessionHistory: persisted.sessionHistory || [],
      });
    }
  }, []);

  return null;
}
