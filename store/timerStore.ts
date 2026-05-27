import { create } from "zustand";
import { TimeEntry, Task, Goal, TimerMode, PomodoroPhase } from "@/types";
import { timeEntryService } from "@/lib/services";

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
    const { timerMode, selectedTask } = get();

    if (!selectedTask) {
      throw new Error("Please select a task first");
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
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to start timer");
    }
  },

  stop: async () => {
    const { runningTimer, selectedTask } = get();
    if (!runningTimer) return;

    const now = Date.now();

    try {
      const updated = await timeEntryService.stop(runningTimer.id);

      const finalHistory = get().sessionHistory.map((entry) => {
        if (entry.taskId === selectedTask?.id && entry.endTime === null) {
          return { ...entry, endTime: now };
        }
        return entry;
      });

      set({
        runningTimer: updated,
        elapsed: 0,
        lastStoppedId: runningTimer.id,
        sessionStartTime: null,
        currentTaskStartTime: null,
        accumulatedBeforePause: 0,
        sessionHistory: finalHistory,
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
    const { runningTimer, selectedTask } = get();
    if (!runningTimer) return;
    try {
      await timeEntryService.update(runningTimer.id, {
        goalId: selectedTask?.goalId ?? undefined,
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

  startPomodoro: async () => {
    const { selectedTask, pomodoroConfig } = get();

    if (!selectedTask) {
      throw new Error("Please select a task first");
    }

    set({ isLoading: true });
    try {
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
        sessionStartTime: Date.now(),
        accumulatedBeforePause: 0,
        sessionHistory: [],
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
      } else {
        nextPhase = "SHORT_BREAK";
        nextDuration = pomodoroConfig.shortBreakDuration;
      }
    } else {
      nextPhase = "WORK";
      nextDuration = pomodoroConfig.workDuration;
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
}));
