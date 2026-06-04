import { create } from "zustand";
import { TimeEntry, Task, Goal, TimerMode, PomodoroPhase } from "@/types";
import { timeEntryService } from "@/lib/services";
import {
  playWorkStartSound,
  playBreakStartSound,
  playLongBreakSound,
  playAllSessionsCompleteSound,
} from "@/lib/sounds";

import {
  saveTimerState,
  loadTimerState,
  clearTimerState,
} from "@/lib/timerPersistence";

interface PomodoroConfig {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

interface PomodoroState {
  phase: PomodoroPhase;
  sessionsCompleted: number;
  timeLeftInPhase: number;
}

interface TimerSessionEntry {
  taskId: string;
  taskTitle: string;
  startTime: number;
  endTime: number | null;
  color: string;
}

interface TimerState {
  runningTimer: TimeEntry | null;
  syncInterval: NodeJS.Timeout | null;
  elapsed: number;
  selectedPreset: string;
  isLoading: boolean;
  selectedTask: Task | null;
  selectedGoal: Goal | null;
  lastStoppedId: string | null;
  timerMode: TimerMode;
  currentTaskStartTime: number | null;
  initializeFromStorage: (goals: Goal[]) => Promise<void>;
  syncPomodoroSession: (sessionData: {
    taskId?: string;
    goalId?: string;
    duration: number;
    sessionsCompleted: number;
    timestamp: number;
  }) => Promise<void>;
  sessionStartTime: number | null;
  accumulatedBeforePause: number;
  sessionHistory: TimerSessionEntry[];

  pomodoroConfig: PomodoroConfig;
  pomodoroState: PomodoroState | null;

  setRunningTimer: (timer: TimeEntry | null) => void;
  setSelectedTask: (task: Task | null) => void;
  setSelectedGoal: (goal: Goal | null) => void;
  clearSelection: () => void;
  clearLastStopped: () => void;
  setTimerMode: (mode: TimerMode) => void;

  start: (note?: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => void;
  resume: () => void;

  startPomodoro: () => Promise<void>;
  handlePhaseComplete: () => void;
  getCurrentPhaseLabel: () => string;
}

const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 5,
  shortBreakDuration: 3,
  longBreakDuration: 5,
  sessionsBeforeLongBreak: 4,
};

function buildPersistedState(state: TimerState, runningTimerId: string | null) {
  return {
    runningTimerId,
    sessionStartTime: state.sessionStartTime,
    currentTaskStartTime: state.currentTaskStartTime,
    accumulatedBeforePause: state.accumulatedBeforePause,
    selectedTaskId: state.selectedTask?.id || null,
    selectedTaskTitle: state.selectedTask?.title || null,
    selectedTaskColor: state.selectedTask?.color || null,
    selectedTaskGoalId: state.selectedTask?.goalId || null,
    sessionHistory: state.sessionHistory,
    timerMode: state.timerMode,
    pomodoroPhase: state.pomodoroState?.phase || null,
    pomodoroSessionsCompleted: state.pomodoroState?.sessionsCompleted || 0,
    pomodoroTimeLeft: state.pomodoroState?.timeLeftInPhase || null,
    savedAt: Date.now(),
  };
}

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTimer: null,
  elapsed: 0,
  selectedPreset: "classic",
  syncInterval: null,
  isLoading: false,
  selectedTask: null,
  selectedGoal: null,
  lastStoppedId: null,
  currentTaskStartTime: null,
  timerMode: "SIMPLE",
  sessionStartTime: null,
  accumulatedBeforePause: 0,
  sessionHistory: [],
  pomodoroConfig: { ...DEFAULT_POMODORO_CONFIG },
  pomodoroState: null,

  initializeFromStorage: async (goals: Goal[]) => {
    const persisted = loadTimerState();

    let backendTimer: TimeEntry | null = null;

    if (persisted?.runningTimerId) {
      try {
        backendTimer = await timeEntryService.getById(persisted.runningTimerId);
      } catch {}
    }

    if (!backendTimer) {
      try {
        const runningTimer = await timeEntryService.getRunning();
        if (runningTimer) backendTimer = runningTimer;
      } catch {}
    }

    if (!backendTimer || backendTimer.status === "COMPLETED") {
      try {
        const runningTimers = await timeEntryService.getAll({ limit: 100 });
        for (const timer of runningTimers) {
          if (timer.status === "RUNNING" || timer.status === "PAUSED") {
            const hoursSinceStart =
              (Date.now() - new Date(timer.startTime).getTime()) / 3600000;
            if (hoursSinceStart > 12) {
              await timeEntryService.stop(timer.id).catch(() => {});
            }
          }
        }
      } catch {}
      clearTimerState();
      return;
    }

    const hoursSinceStart =
      (Date.now() - new Date(backendTimer.startTime).getTime()) / 3600000;
    if (hoursSinceStart > 12) {
      try {
        await timeEntryService.update(backendTimer.id, {
          duration: backendTimer.duration || 0,
        });
        await timeEntryService.stop(backendTimer.id);
      } catch {}
      clearTimerState();
      return;
    }

    let selectedTask: Task | null = null;
    if (persisted?.selectedTaskId && persisted?.selectedTaskGoalId) {
      const goal = goals.find((g) => g.id === persisted.selectedTaskGoalId);
      if (goal?.tasks) {
        selectedTask =
          goal.tasks.find((t) => t.id === persisted.selectedTaskId) || null;
      }
    }

    // Calculate elapsed: use localStorage if available, otherwise calculate from backend startTime
    let elapsed: number;
    if (persisted?.accumulatedBeforePause) {
      elapsed = persisted.accumulatedBeforePause;
    } else if (backendTimer.duration) {
      elapsed = backendTimer.duration;
    } else {
      elapsed = Math.floor(
        (Date.now() - new Date(backendTimer.startTime).getTime()) / 1000,
      );
    }

    const fixedHistory = (persisted?.sessionHistory || []).map((entry) => ({
      ...entry,
      endTime: entry.endTime === null ? Date.now() : entry.endTime,
    }));

    // Always restore as PAUSED
    set({
      runningTimer: { ...backendTimer, status: "PAUSED" },
      selectedTask,
      sessionStartTime: null,
      currentTaskStartTime: null,
      accumulatedBeforePause: elapsed,
      elapsed,
      sessionHistory: fixedHistory,
      timerMode: (persisted?.timerMode as TimerMode) || "SIMPLE",
    });

    const state = get();
    saveTimerState(buildPersistedState(state, backendTimer.id));

    timeEntryService
      .update(backendTimer.id, {
        status: "PAUSED",
        duration: elapsed,
      })
      .catch(() => {});
  },
  setRunningTimer: (timer) => set({ runningTimer: timer }),

  setTimerMode: (mode) => {
    const { runningTimer } = get();
    if (
      runningTimer &&
      (runningTimer.status === "RUNNING" || runningTimer.status === "PAUSED")
    ) {
      return;
    }
    set({
      timerMode: mode,
      elapsed: 0,
      pomodoroState: null,
      sessionStartTime: null,
      accumulatedBeforePause: 0,
    });
  },

  getCurrentPhaseLabel: () => {
    const { pomodoroState } = get();
    if (!pomodoroState) return "Ready";
    switch (pomodoroState.phase) {
      case "WORK":
        return "Focus";
      case "SHORT_BREAK":
        return "Short Break";
      case "LONG_BREAK":
        return "Long Break";
    }
  },
  syncPomodoroSession: async (sessionData: {
    taskId?: string;
    goalId?: string;
    duration: number;
    sessionsCompleted: number;
    timestamp: number;
  }) => {
    try {
      await timeEntryService.start({
        entryType: "POMODORO",
        taskId: sessionData.taskId,
        goalId: sessionData.goalId,
        note: `Pomodoro session - ${sessionData.sessionsCompleted + 1} completed`,
      });
      const runningTimer = await timeEntryService.getRunning();
      if (runningTimer) {
        await timeEntryService.stop(runningTimer.id);
      }
    } catch {
      throw new Error("Failed to sync session");
    }
  },
  setSelectedTask: async (task) => {
    const state = get();
    const { runningTimer } = state;
    const currentTask = state.selectedTask;
    const now = Date.now();

    if (currentTask?.id === task?.id) return;

    if (!runningTimer) {
      set({ selectedTask: task, selectedGoal: null });
      return;
    }

    if (runningTimer.status === "PAUSED") {
      if (task) {
        await timeEntryService.update(runningTimer.id, {
          goalId: task.goalId || undefined,
          taskId: task.id ?? undefined,
        });
      }
      set({ selectedTask: task, selectedGoal: null });
      return;
    }

    if (runningTimer.status === "RUNNING" && currentTask) {
      const updatedHistory = state.sessionHistory.map((entry) => {
        if (entry.taskId === currentTask.id && entry.endTime === null) {
          return { ...entry, endTime: now };
        }
        return entry;
      });

      await timeEntryService.stop(runningTimer.id);

      const newTimer = await timeEntryService.start({
        entryType: "TIMER",
        taskId: task?.id,
        goalId: task?.goalId || undefined,
        note: task?.title || undefined,
      });

      const finalHistory = task
        ? [
            ...updatedHistory,
            {
              taskId: task.id,
              taskTitle: task.title,
              startTime: now,
              endTime: null,
              color: task.color || "#6366F1",
            },
          ]
        : updatedHistory;

      set({
        selectedTask: task,
        selectedGoal: null,
        runningTimer: newTimer,
        currentTaskStartTime: now,
        sessionHistory: finalHistory,
      });
      const newState = get();
      saveTimerState(buildPersistedState(newState, newTimer.id));
      return;
    }

    set({ selectedTask: task, selectedGoal: null });
  },

  setSelectedGoal: async (goal) => {
    set({ selectedGoal: goal, selectedTask: null });
  },

  clearSelection: () => set({ selectedTask: null, selectedGoal: null }),
  clearLastStopped: () => set({ lastStoppedId: null }),

  start: async (note?: string) => {
    const { timerMode, selectedTask, syncInterval } = get();
    if (!selectedTask) throw new Error("Please select a task first");

    if (timerMode === "POMODORO") {
      await get().startPomodoro();
      return;
    }

    // Clear any existing sync interval
    if (syncInterval) clearInterval(syncInterval);

    set({ isLoading: true });
    try {
      const now = Date.now();
      const timer = await timeEntryService.start({
        entryType: "TIMER",
        taskId: selectedTask.id,
        goalId: selectedTask.goalId || undefined,
        note: note || selectedTask.title || undefined,
      });

      // Start periodic sync every 30 minutes
      const newSyncInterval = setInterval(async () => {
        const state = get();
        if (!state.runningTimer || state.runningTimer.status !== "RUNNING") {
          clearInterval(newSyncInterval);
          return;
        }
        try {
          await timeEntryService.update(state.runningTimer.id, {
            duration: state.elapsed,
          });
        } catch (e) {
          console.log(e);
        }
      }, 30 * 1000);

      set({
        runningTimer: timer,
        isLoading: false,
        elapsed: 0,
        sessionStartTime: now,
        currentTaskStartTime: now,
        accumulatedBeforePause: 0,
        sessionHistory: [
          {
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            startTime: now,
            endTime: null,
            color: selectedTask.color || "#6366F1",
          },
        ],
        pomodoroState: null,
        syncInterval: newSyncInterval,
      });

      const newState = get();
      saveTimerState(buildPersistedState(newState, timer.id));
    } catch (e) {
      console.log(e);
      set({ isLoading: false });
      throw new Error("Failed to start timer");
    }
  },

  stop: async () => {
    const { runningTimer, elapsed, syncInterval } = get();
    if (!runningTimer) return;

    const timerId = runningTimer.id;
    const now = Date.now();

    if (syncInterval) clearInterval(syncInterval);

    const finalHistory = get().sessionHistory.map((entry) => {
      if (entry.endTime === null) return { ...entry, endTime: now };
      return entry;
    });

    // Pause locally (always works)
    set({
      runningTimer: { ...runningTimer, status: "PAUSED" },
      elapsed,
      sessionStartTime: null,
      accumulatedBeforePause: elapsed,
      sessionHistory: finalHistory,
      syncInterval: null,
    });

    // Try to finalize stop
    const token = document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1];
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const url = `${apiUrl}/time-entries/${timerId}/stop?token=${token}`;

    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ duration: elapsed })], {
          type: "application/json",
        });
        navigator.sendBeacon(url, blob);
      } else {
        await timeEntryService.stop(timerId);
      }
      // Success - clear everything
      clearTimerState();
      set({ runningTimer: null, elapsed: 0, lastStoppedId: timerId });
    } catch {
      // Offline - keep paused state, try again on next online reload
      saveTimerState(buildPersistedState(get(), timerId));
    }
  },

  pause: () => {
    const { runningTimer, sessionStartTime, accumulatedBeforePause } = get();
    if (!runningTimer) return;

    const now = Date.now();
    const currentElapsed = sessionStartTime
      ? Math.floor((now - sessionStartTime) / 1000)
      : 0;
    const totalElapsed = accumulatedBeforePause + currentElapsed;

    set({
      accumulatedBeforePause: totalElapsed,
      elapsed: totalElapsed,
      sessionStartTime: null,
      runningTimer: { ...runningTimer, status: "PAUSED" },
    });

    const state = get();
    saveTimerState(buildPersistedState(state, state.runningTimer?.id || null));

    // Fire and forget - update backend
    timeEntryService
      .update(runningTimer.id, { status: "PAUSED", duration: totalElapsed })
      .catch(() => {});
  },

  resume: () => {
    const { runningTimer } = get();
    if (!runningTimer) return;

    set({
      sessionStartTime: Date.now(),
      runningTimer: { ...runningTimer, status: "RUNNING" },
    });

    const state = get();
    saveTimerState(buildPersistedState(state, state.runningTimer?.id || null));

    // Fire and forget - update backend
    timeEntryService
      .update(runningTimer.id, { status: "RUNNING" })
      .catch(() => {});
  },

  startPomodoro: async () => {
    const { selectedTask, pomodoroConfig, runningTimer } = get();

    if (!selectedTask) {
      throw new Error("Please select a task first");
    }

    // If there's already a running timer, stop it first
    if (
      runningTimer &&
      (runningTimer.status === "RUNNING" || runningTimer.status === "PAUSED")
    ) {
      try {
        await timeEntryService.stop(runningTimer.id);
      } catch {
        // Ignore
      }
    }

    set({ isLoading: true });
    try {
      const now = Date.now();
      const timer = await timeEntryService.start({
        entryType: "POMODORO",
        taskId: selectedTask.id,
        goalId: selectedTask.goalId || undefined,
        note: `Pomodoro - ${selectedTask.title}`,
      });

      set({
        runningTimer: timer,
        isLoading: false,
        elapsed: pomodoroConfig.workDuration,
        sessionStartTime: now,
        currentTaskStartTime: now,
        accumulatedBeforePause: 0,
        sessionHistory: [
          {
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            startTime: now,
            endTime: null,
            color: selectedTask.color || "#6366F1",
          },
        ],
        pomodoroState: {
          phase: "WORK",
          sessionsCompleted: 0,
          timeLeftInPhase: pomodoroConfig.workDuration,
        },
      });

      const newState = get();
      saveTimerState(buildPersistedState(newState, timer.id));
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to start pomodoro");
    }
  },

  handlePhaseComplete: () => {
    const { pomodoroState, pomodoroConfig, runningTimer, selectedTask } = get();
    if (!pomodoroState) return;

    const isWorkPhase = pomodoroState.phase === "WORK";
    const newSessionsCompleted = isWorkPhase
      ? pomodoroState.sessionsCompleted + 1
      : pomodoroState.sessionsCompleted;

    // Check if all sessions are complete
    if (
      isWorkPhase &&
      newSessionsCompleted >= pomodoroConfig.sessionsBeforeLongBreak
    ) {
      playAllSessionsCompleteSound();

      if (runningTimer) {
        timeEntryService.stop(runningTimer.id).catch(() => {});
      }

      const now = Date.now();
      const updatedHistory = get().sessionHistory.map((entry) => ({
        ...entry,
        endTime: entry.endTime === null ? now : entry.endTime,
      }));

      // Save final session data
      const workTimeSpent = pomodoroConfig.workDuration;
      const sessionData = {
        taskId: selectedTask?.id,
        goalId: selectedTask?.goalId ?? undefined,
        duration: workTimeSpent * newSessionsCompleted,
        sessionsCompleted: newSessionsCompleted,
        timestamp: now,
      };

      // Queue for sync
      const pending = JSON.parse(
        localStorage.getItem("pomodoro-pending") || "[]",
      );
      pending.push(sessionData);
      localStorage.setItem("pomodoro-pending", JSON.stringify(pending));

      // Reset everything
      set({
        pomodoroState: null,
        elapsed: 0,
        sessionStartTime: null,
        currentTaskStartTime: null,
        accumulatedBeforePause: 0,
        sessionHistory: updatedHistory,
        runningTimer: null,
      });
      return;
    }

    let nextPhase: PomodoroPhase;
    let nextDuration: number;

    if (isWorkPhase) {
      if (newSessionsCompleted % pomodoroConfig.sessionsBeforeLongBreak === 0) {
        nextPhase = "LONG_BREAK";
        nextDuration = pomodoroConfig.longBreakDuration;
        playLongBreakSound();
      } else {
        nextPhase = "SHORT_BREAK";
        nextDuration = pomodoroConfig.shortBreakDuration;
        playBreakStartSound();
      }
    } else {
      nextPhase = "WORK";
      nextDuration = pomodoroConfig.workDuration;
      playWorkStartSound();
    }

    const now = Date.now();

    let updatedHistory = get().sessionHistory;
    if (isWorkPhase) {
      updatedHistory = updatedHistory.map((entry) => {
        if (entry.endTime === null) return { ...entry, endTime: now };
        return entry;
      });
    }

    if (!isWorkPhase && selectedTask) {
      updatedHistory = [
        ...updatedHistory,
        {
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          startTime: now,
          endTime: null,
          color: selectedTask.color || "#6366F1",
        },
      ];
    }

    if (runningTimer) {
      timeEntryService.stop(runningTimer.id).catch(() => {});
    }

    set({
      pomodoroState: {
        phase: nextPhase,
        sessionsCompleted: newSessionsCompleted,
        timeLeftInPhase: nextDuration,
      },
      elapsed: nextDuration,
      sessionStartTime: now,
      currentTaskStartTime: nextPhase === "WORK" ? now : null,
      accumulatedBeforePause: 0,
      sessionHistory: updatedHistory,
      runningTimer: null,
    });

    if (!isWorkPhase && selectedTask) {
      timeEntryService
        .start({
          entryType: "POMODORO",
          taskId: selectedTask.id,
          goalId: selectedTask.goalId || undefined,
          note: `Pomodoro - ${selectedTask.title}`,
        })
        .then((newTimer) => {
          set({ runningTimer: newTimer });
        })
        .catch(() => {});
    }
  },
}));
