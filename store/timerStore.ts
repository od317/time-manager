import { create } from "zustand";
import { TimeEntry, Task, Goal, TimerMode, PomodoroPhase } from "@/types";
import { timeEntryService } from "@/lib/services";
import {
  playWorkStartSound,
  playBreakStartSound,
  playLongBreakSound,
  playTimerCompleteSound,
} from "@/lib/sounds";

interface PomodoroConfig {
  workDuration: number; // seconds (default 25 * 60)
  shortBreakDuration: number; // seconds (default 5 * 60)
  longBreakDuration: number; // seconds (default 15 * 60)
  sessionsBeforeLongBreak: number; // default 4
}

interface PomodoroState {
  phase: PomodoroPhase;
  sessionsCompleted: number;
  timeLeftInPhase: number; // seconds remaining in current phase
}

interface TimerState {
  runningTimer: TimeEntry | null;
  elapsed: number;
  isLoading: boolean;
  selectedTask: Task | null;
  selectedGoal: Goal | null;
  lastStoppedId: string | null;
  timerMode: TimerMode;

  // Pomodoro
  pomodoroConfig: PomodoroConfig;
  pomodoroState: PomodoroState | null;

  // Session tracking
  sessionStartTime: number | null;
  accumulatedBeforePause: number;

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

  // Pomodoro helpers
  startPomodoro: () => Promise<void>;
  handlePhaseComplete: () => void;
  getCurrentPhaseLabel: () => string;
}

const isDev =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_DEV_MODE === "true";

const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: isDev ? 10 : 25 * 60, // 10 seconds in dev
  shortBreakDuration: isDev ? 5 : 5 * 60, // 5 seconds in dev
  longBreakDuration: isDev ? 8 : 15 * 60, // 8 seconds in dev
  sessionsBeforeLongBreak: isDev ? 2 : 4, // 2 sessions in dev
};

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTimer: null,
  elapsed: 0,
  isLoading: false,
  selectedTask: null,
  selectedGoal: null,
  lastStoppedId: null,
  timerMode: "SIMPLE",
  pomodoroConfig: { ...DEFAULT_POMODORO_CONFIG },
  pomodoroState: null,
  sessionStartTime: null,
  accumulatedBeforePause: 0,

  setRunningTimer: (timer) => set({ runningTimer: timer }),

  setTimerMode: (mode) => {
    const { runningTimer } = get();
    if (
      runningTimer?.status === "RUNNING" ||
      runningTimer?.status === "PAUSED"
    ) {
      return;
    }
    set({ timerMode: mode, elapsed: 0 });
  },

  setSelectedTask: async (task) => {
    const { runningTimer } = get();
    set({ selectedTask: task, selectedGoal: null });

    if (runningTimer) {
      if (runningTimer.status === "RUNNING") {
        await timeEntryService.stop(runningTimer.id);

        const newTimer = await timeEntryService.start({
          entryType: "TIMER",
          taskId: task?.id,
          note: runningTimer.note || undefined,
        });

        set({ runningTimer: newTimer });
      } else if (runningTimer.status === "PAUSED") {
        await timeEntryService.update(runningTimer.id, {
          goalId: undefined,
          taskId: task?.id ?? undefined,
        });
      }
    }
  },

  setSelectedGoal: async (goal) => {
    const { runningTimer } = get();
    set({ selectedGoal: goal, selectedTask: null });

    if (runningTimer) {
      if (runningTimer.status === "RUNNING") {
        await timeEntryService.stop(runningTimer.id);

        const newTimer = await timeEntryService.start({
          entryType: "TIMER",
          goalId: goal?.id,
          note: runningTimer.note || undefined,
        });

        set({ runningTimer: newTimer });
      } else if (runningTimer.status === "PAUSED") {
        await timeEntryService.update(runningTimer.id, {
          goalId: goal?.id ?? undefined,
          taskId: undefined,
        });
      }
    }
  },

  clearSelection: () => set({ selectedTask: null, selectedGoal: null }),
  clearLastStopped: () => set({ lastStoppedId: null }),

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

  startPomodoro: async () => {
    const { selectedTask, selectedGoal, pomodoroConfig } = get();
    set({ isLoading: true });

    try {
      const timer = await timeEntryService.start({
        entryType: "POMODORO",
        taskId: selectedTask?.id,
        goalId: selectedGoal?.id,
        note: "Pomodoro - Focus",
      });

      set({
        runningTimer: timer,
        isLoading: false,
        elapsed: pomodoroConfig.workDuration,
        sessionStartTime: Date.now(),
        accumulatedBeforePause: 0,
        pomodoroState: {
          phase: "WORK",
          sessionsCompleted: 0,
          timeLeftInPhase: pomodoroConfig.workDuration,
        },
      });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to start pomodoro");
    }
  },

  handlePhaseComplete: () => {
    const { pomodoroState, pomodoroConfig } = get();
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

    set({
      pomodoroState: {
        phase: nextPhase,
        sessionsCompleted: newSessionsCompleted,
        timeLeftInPhase: nextDuration,
      },
      elapsed: nextDuration,
      sessionStartTime: Date.now(),
      accumulatedBeforePause: 0,
    });
  },

  // Modified start to handle both simple and pomodoro
  start: async (note?: string) => {
    const { timerMode, selectedTask, selectedGoal } = get();

    if (timerMode === "POMODORO") {
      await get().startPomodoro();
      return;
    }

    set({ isLoading: true });
    try {
      const timer = await timeEntryService.start({
        entryType: "TIMER",
        taskId: selectedTask?.id,
        goalId: selectedGoal?.id,
        note: note || selectedTask?.title || selectedGoal?.title || undefined,
      });
      set({
        runningTimer: timer,
        isLoading: false,
        elapsed: 0,
        sessionStartTime: Date.now(),
        accumulatedBeforePause: 0,
        pomodoroState: null,
      });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to start timer");
    }
  },

  stop: async () => {
    const { runningTimer } = get();
    if (!runningTimer) return;
    try {
      const updated = await timeEntryService.stop(runningTimer.id);
      set({
        runningTimer: updated,
        elapsed: 0,
        lastStoppedId: runningTimer.id,
        sessionStartTime: null,
        accumulatedBeforePause: 0,
        pomodoroState: null,
      });
    } catch {
      throw new Error("Failed to stop timer");
    }
  },

  pause: async () => {
    const { runningTimer } = get();
    if (!runningTimer) return;
    try {
      const updated = await timeEntryService.pause(runningTimer.id);
      const { sessionStartTime, accumulatedBeforePause } = get();
      const currentElapsed = sessionStartTime
        ? Math.floor((Date.now() - sessionStartTime) / 1000)
        : 0;

      set({
        runningTimer: updated,
        accumulatedBeforePause: accumulatedBeforePause + currentElapsed,
        elapsed: accumulatedBeforePause + currentElapsed,
        sessionStartTime: null,
      });
    } catch {
      throw new Error("Failed to pause timer");
    }
  },

  resume: async () => {
    const { runningTimer, selectedTask, selectedGoal } = get();
    if (!runningTimer) return;
    try {
      await timeEntryService.update(runningTimer.id, {
        goalId: selectedGoal?.id ?? undefined,
        taskId: selectedTask?.id ?? undefined,
      });
      const updated = await timeEntryService.resume(runningTimer.id);
      set({
        runningTimer: updated,
        sessionStartTime: Date.now(),
      });
    } catch {
      throw new Error("Failed to resume timer");
    }
  },
}));
