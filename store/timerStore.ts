import { create } from "zustand";
import { TimeEntry, Task, Goal, TimerMode, PomodoroPhase } from "@/types";
import { timeEntryService } from "@/lib/services";
import {
  playWorkStartSound,
  playBreakStartSound,
  playLongBreakSound,
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
  elapsed: number;
  isLoading: boolean;
  selectedTask: Task | null;
  selectedGoal: Goal | null;
  lastStoppedId: string | null;
  timerMode: TimerMode;
  currentTaskStartTime: number | null;
  initializeFromStorage: (goals: Goal[]) => Promise<void>;
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
  pause: () => Promise<void>;
  resume: () => Promise<void>;

  startPomodoro: () => Promise<void>;
  handlePhaseComplete: () => void;
  getCurrentPhaseLabel: () => string;
}

const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 10,
  shortBreakDuration: 5,
  longBreakDuration: 8,
  sessionsBeforeLongBreak: 2,
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
    if (!persisted) return;

    let backendTimer: TimeEntry | null = null;
    if (persisted.runningTimerId) {
      try {
        backendTimer = await timeEntryService.getById(persisted.runningTimerId);
      } catch {
        // Timer no longer exists
      }
    }

    if (!backendTimer || backendTimer.status === "COMPLETED") {
      clearTimerState();
      return;
    }

    // Restore selected task
    let selectedTask: Task | null = null;
    if (persisted.selectedTaskId && persisted.selectedTaskGoalId) {
      const goal = goals.find((g) => g.id === persisted.selectedTaskGoalId);
      if (goal?.tasks) {
        selectedTask =
          goal.tasks.find((t) => t.id === persisted.selectedTaskId) || null;
      }
    }

    const now = Date.now();
    const backendStartTime = backendTimer.startTime
      ? new Date(backendTimer.startTime).getTime()
      : now;

    let elapsed: number;

    if (backendTimer.status === "RUNNING") {
      elapsed = Math.floor((now - backendStartTime) / 1000);

      try {
        backendTimer = await timeEntryService.pause(backendTimer.id);
      } catch {
        // Continue with calculated elapsed
      }
    } else if (backendTimer.status === "PAUSED") {
      elapsed = backendTimer.duration || persisted.accumulatedBeforePause || 0;
    } else {
      elapsed = 0;
    }

    // Fix history: close any running entry
    const fixedHistory = persisted.sessionHistory.map((entry) => ({
      ...entry,
      endTime: entry.endTime === null ? now : entry.endTime,
    }));

    const newState = {
      runningTimer: backendTimer,
      selectedTask,
      sessionStartTime: null,
      currentTaskStartTime: null,
      accumulatedBeforePause: elapsed,
      sessionHistory: fixedHistory,
      timerMode: (persisted.timerMode as TimerMode) || "SIMPLE",
      elapsed,
    };

    set(newState);
    if (persisted.timerMode === "POMODORO") {
      set({
        pomodoroState: {
          phase: (persisted.pomodoroPhase as PomodoroPhase) || "WORK",
          sessionsCompleted: persisted.pomodoroSessionsCompleted || 0,
          timeLeftInPhase:
            persisted.pomodoroTimeLeft || DEFAULT_POMODORO_CONFIG.workDuration,
        },
        timerMode: "POMODORO",
        elapsed: persisted.pomodoroTimeLeft || elapsed,
      });
    }
    // 👇 SAVE THE FIXED STATE so it survives another reload
    saveTimerState(
      buildPersistedState({ ...get(), ...newState }, backendTimer.id),
    );
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
    const { timerMode, selectedTask, runningTimer } = get();

    if (!selectedTask) {
      throw new Error("Please select a task first");
    }

    // If there's somehow a running timer, stop it first
    if (runningTimer) {
      try {
        await timeEntryService.stop(runningTimer.id);
      } catch {
        // Ignore
      }
    }

    if (timerMode === "POMODORO") {
      await get().startPomodoro();
      return;
    }

    set({ isLoading: true });
    try {
      const now = Date.now();
      const timer = await timeEntryService.start({
        entryType: "TIMER",
        taskId: selectedTask.id,
        goalId: selectedTask.goalId || undefined,
        note: note || selectedTask.title || undefined,
      });
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
      });
      const newState = get();
      saveTimerState(buildPersistedState(newState, timer.id));
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to start timer");
    }
  },

  stop: async () => {
    const { runningTimer } = get();
    const now = Date.now();

    if (runningTimer) {
      try {
        await timeEntryService.stop(runningTimer.id);
      } catch {
        // Ignore
      }
    }

    const finalHistory = get().sessionHistory.map((entry) => {
      if (entry.endTime === null) {
        return { ...entry, endTime: now };
      }
      return entry;
    });

    set({
      runningTimer: null,
      elapsed: 0,
      lastStoppedId: runningTimer?.id || null, // ✅ This must be set
      sessionStartTime: null,
      currentTaskStartTime: null,
      accumulatedBeforePause: 0,
      sessionHistory: finalHistory,
      pomodoroState: null,
      timerMode: get().timerMode,
    });

    clearTimerState();
  },

  pause: async () => {
    const { runningTimer } = get();
    if (!runningTimer) return;

    try {
      const updated = await timeEntryService.pause(runningTimer.id);

      const { sessionStartTime, accumulatedBeforePause, pomodoroState } = get();
      const now = Date.now();
      const currentElapsed = sessionStartTime
        ? Math.floor((now - sessionStartTime) / 1000)
        : 0;

      const totalElapsed = accumulatedBeforePause + currentElapsed;

      // Close the current history entry
      const updatedHistory = get().sessionHistory.map((entry) => {
        if (entry.endTime === null) {
          return { ...entry, endTime: now };
        }
        return entry;
      });

      set({
        runningTimer: updated,
        accumulatedBeforePause: totalElapsed,
        sessionStartTime: null,
        sessionHistory: updatedHistory,
        // For Pomodoro, keep the current elapsed
        elapsed: pomodoroState ? get().elapsed : totalElapsed,
      });

      const newState = get();
      saveTimerState(buildPersistedState(newState, updated.id));
    } catch {
      throw new Error("Failed to pause timer");
    }
  },

  resume: async () => {
    const { runningTimer, selectedTask, timerMode } = get();

    if (!runningTimer) {
      console.warn("No timer to resume");
      return;
    }

    if (runningTimer.status === "COMPLETED") {
      console.warn("Timer already completed, cannot resume");
      return;
    }

    const now = Date.now();

    try {
      await timeEntryService.update(runningTimer.id, {
        goalId: selectedTask?.goalId ?? undefined,
        taskId: selectedTask?.id ?? undefined,
      });
      const updated = await timeEntryService.resume(runningTimer.id);

      const newHistory =
        selectedTask && timerMode !== "POMODORO"
          ? [
              ...get().sessionHistory,
              {
                taskId: selectedTask.id,
                taskTitle: selectedTask.title,
                startTime: now,
                endTime: null,
                color: selectedTask.color || "#6366F1",
              },
            ]
          : get().sessionHistory;

      set({
        runningTimer: updated,
        sessionStartTime: now,
        currentTaskStartTime: timerMode === "POMODORO" ? null : now,
        sessionHistory: newHistory,
      });

      const newState = get();
      saveTimerState(buildPersistedState(newState, updated.id));
    } catch (error) {
      console.error("Resume failed:", error);
      throw new Error("Failed to resume timer");
    }
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

    let nextPhase: PomodoroPhase;
    let nextDuration: number;

    if (isWorkPhase) {
      if (newSessionsCompleted % pomodoroConfig.sessionsBeforeLongBreak === 0) {
        nextPhase = "LONG_BREAK";
        nextDuration = pomodoroConfig.longBreakDuration;
        playLongBreakSound(); // 👈 Add
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
        if (entry.endTime === null) {
          return { ...entry, endTime: now };
        }
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

    // Stop old entry
    if (runningTimer) {
      timeEntryService.stop(runningTimer.id).catch(() => {});
    }

    // Update state immediately (don't wait for new timer)
    set({
      pomodoroState: {
        phase: nextPhase,
        sessionsCompleted: newSessionsCompleted,
        timeLeftInPhase: nextDuration,
      },
      elapsed: nextDuration,
      sessionStartTime: now, // Always set for countdown
      currentTaskStartTime: nextPhase === "WORK" ? now : null,
      accumulatedBeforePause: 0,
      sessionHistory: updatedHistory,
      runningTimer: null,
    });

    // Start new time entry for work phase
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
          const newState = get();
          saveTimerState(buildPersistedState(newState, newTimer.id));
        })
        .catch(() => {});
    }
  },
}));
