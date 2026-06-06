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

import {
  savePomodoroSession,
  loadPomodoroSession,
  clearPomodoroSession,
  isPomodoroSessionRecoverable,
  addPendingSession,
  loadPendingSessions,
  clearPendingSessions,
  type PomodoroSessionData,
  MAX_RECOVERY_GAP_MS,
} from "@/lib/pomodoroPersistence";

// ============================================================================
// INTERFACES
// ============================================================================

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
  // Core timer state
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
  sessionStartTime: number | null;
  accumulatedBeforePause: number;
  sessionHistory: TimerSessionEntry[];

  // Pomodoro specific
  pomodoroConfig: PomodoroConfig;
  pomodoroState: PomodoroState | null;
  recoveredPomodoro: boolean;
  isPomodoroPaused: boolean;

  // Actions
  initializeFromStorage: (goals: Goal[]) => Promise<void>;
  setRunningTimer: (timer: TimeEntry | null) => void;
  setSelectedTask: (task: Task | null) => void;
  setSelectedGoal: (goal: Goal | null) => void;
  clearSelection: () => void;
  clearLastStopped: () => void;
  setTimerMode: (mode: TimerMode) => void;

  // Simple Timer actions
  start: (note?: string) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => void;
  resume: () => void;

  // Pomodoro actions
  startPomodoro: (totalSessions: number) => Promise<void>;
  resumePomodoro: () => void;
  handlePhaseComplete: () => void;
  endPomodoroSession: () => Promise<void>;
  getCurrentPhaseLabel: () => string;
  syncCompletedPomodoroSessions: () => Promise<void>;

  // Legacy support
  syncPomodoroSession: (sessionData: {
    taskId?: string;
    goalId?: string;
    duration: number;
    sessionsCompleted: number;
    timestamp: number;
  }) => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_POMODORO_CONFIG: PomodoroConfig = {
  workDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  sessionsBeforeLongBreak: 4, // Long break after 4 sessions
};

// ============================================================================
// HELPERS
// ============================================================================

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

function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1] || null;
}

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://time-manager-api-3r7i.onrender.com/api"
  );
}

// ============================================================================
// STORE
// ============================================================================

export const useTimerStore = create<TimerState>((set, get) => ({
  // Initial state
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
  recoveredPomodoro: false,
  isPomodoroPaused: false,

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  initializeFromStorage: async (goals: Goal[]) => {
    // 1. Check for Pomodoro session first
    const { recoverable, data: pomodoroData } = isPomodoroSessionRecoverable();

    if (recoverable && pomodoroData) {
      const selectedTask =
        goals
          .flatMap((g) => g.tasks || [])
          .find((t) => t.id === pomodoroData.taskId) || null;

      set({
        timerMode: "POMODORO",
        pomodoroConfig: pomodoroData.config,
        selectedTask,
        selectedGoal: selectedTask
          ? goals.find((g) => g.tasks?.some((t) => t.id === selectedTask.id)) ||
            null
          : null,
        pomodoroState: {
          phase: pomodoroData.currentPhase as PomodoroPhase,
          sessionsCompleted: pomodoroData.sessionsCompleted,
          timeLeftInPhase: pomodoroData.timeLeftInPhase,
        },
        sessionStartTime: null, // Frozen
        elapsed: pomodoroData.timeLeftInPhase,
        recoveredPomodoro: true,
        isPomodoroPaused: true,
        sessionHistory: pomodoroData.taskHistory.map((entry) => ({
          ...entry,
          endTime: entry.endTime,
        })),
      });

      const attemptSync = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            await get().syncCompletedPomodoroSessions();
            break;
          } catch {
            if (i < retries - 1) {
              await new Promise((r) => setTimeout(r, 2000 * (i + 1))); // Exponential backoff
            }
          }
        }
      };

      // Sync any pending sessions in background
      attemptSync();
      return;
    }

    // Clear if too old
    if (pomodoroData && !recoverable) {
      clearPomodoroSession();
    }

    // 2. Handle Simple Timer recovery
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

    // Clean up completed or abandoned timers
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

    // Check if abandoned
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

    // Recover selected task
    let selectedTask: Task | null = null;
    if (persisted?.selectedTaskId && persisted?.selectedTaskGoalId) {
      const goal = goals.find((g) => g.id === persisted.selectedTaskGoalId);
      if (goal?.tasks) {
        selectedTask =
          goal.tasks.find((t) => t.id === persisted.selectedTaskId) || null;
      }
    }

    // Calculate elapsed
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

    // Fire-and-forget backend update
    timeEntryService
      .update(backendTimer.id, {
        status: "PAUSED",
        duration: elapsed,
      })
      .catch(() => {});
  },

  // ============================================================================
  // BASIC SETTERS
  // ============================================================================

  setRunningTimer: (timer) => set({ runningTimer: timer }),

  setTimerMode: (mode) => {
    const { runningTimer } = get();
    if (
      runningTimer &&
      (runningTimer.status === "RUNNING" || runningTimer.status === "PAUSED")
    ) {
      return; // Can't switch mode while timer is active
    }
    set({
      timerMode: mode,
      elapsed: 0,
      pomodoroState: null,
      sessionStartTime: null,
      accumulatedBeforePause: 0,
      recoveredPomodoro: false,
      isPomodoroPaused: false,
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

  // ============================================================================
  // POMODORO SESSION SYNC
  // ============================================================================

  syncCompletedPomodoroSessions: async () => {
    const pending = loadPendingSessions();
    if (pending.length === 0) return; // Just return, no value

    const sessionLog = pending.map((session) => ({
      taskId: session.taskId,
      goalId: session.goalId,
      duration: session.duration,
      note: `Pomodoro session - ${session.sessionsCompleted} work periods`,
    }));

    try {
      await timeEntryService.completePomodoroSession(sessionLog);
      clearPendingSessions();
      // Remove "return true"
    } catch {
      throw new Error("Sync failed");
    }
  },

  // Legacy sync for backward compatibility
  syncPomodoroSession: async (sessionData) => {
    try {
      const timer = await timeEntryService.start({
        entryType: "POMODORO",
        taskId: sessionData.taskId,
        goalId: sessionData.goalId,
      });
      if (timer) {
        await timeEntryService.update(timer.id, {
          duration: sessionData.duration,
        });
        await timeEntryService.stop(timer.id);
      }
    } catch {
      throw new Error("Failed to sync session");
    }
  },

  // ============================================================================
  // POMODORO ACTIONS
  // ============================================================================

  startPomodoro: async (totalSessions: number) => {
    const { selectedTask, pomodoroConfig } = get();

    if (!selectedTask) {
      throw new Error("Please select a task first");
    }

    set({ isLoading: true });

    const now = Date.now();

    // Build the full session data for localStorage
    const sessionData: PomodoroSessionData = {
      totalSessions,
      config: {
        ...pomodoroConfig,
        sessionsBeforeLongBreak: totalSessions,
      },
      currentPhase: "WORK",
      sessionsCompleted: 0,
      sessionStartTime: now,
      timeLeftInPhase: pomodoroConfig.workDuration,
      lastTickTime: now,
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      taskColor: selectedTask.color || "#6366F1",
      goalId: selectedTask.goalId || null,
      completedWorkSessions: [],
      currentWorkSession: {
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        goalId: selectedTask.goalId || null,
        startTime: now,
      },
      taskHistory: [
        {
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          startTime: now,
          endTime: now, // Will update when phase completes
          color: selectedTask.color || "#6366F1",
        },
      ],
      lastActiveAt: now,
      createdAt: now,
    };

    savePomodoroSession(sessionData);

    set({
      isLoading: false,
      elapsed: pomodoroConfig.workDuration,
      sessionStartTime: now,
      currentTaskStartTime: now,
      accumulatedBeforePause: 0,
      pomodoroState: {
        phase: "WORK",
        sessionsCompleted: 0,
        timeLeftInPhase: pomodoroConfig.workDuration,
      },
      sessionHistory: [
        {
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          startTime: now,
          endTime: null,
          color: selectedTask.color || "#6366F1",
        },
      ],
      recoveredPomodoro: false,
      isPomodoroPaused: false,
      runningTimer: null, // No backend entry during Pomodoro
    });
  },

  resumePomodoro: () => {
    const data = loadPomodoroSession();
    if (!data) return;

    const now = Date.now();

    data.sessionStartTime = now;
    data.lastActiveAt = now;

    savePomodoroSession(data);

    set({
      sessionStartTime: now,
      recoveredPomodoro: false,
      isPomodoroPaused: false,
    });
  },

  handlePhaseComplete: () => {
    const { pomodoroState, pomodoroConfig, selectedTask, sessionStartTime } =
      get();
    if (!pomodoroState) return;

    const isWorkPhase = pomodoroState.phase === "WORK";
    const newSessionsCompleted = isWorkPhase
      ? pomodoroState.sessionsCompleted + 1
      : pomodoroState.sessionsCompleted;

    const data = loadPomodoroSession();
    if (!data) return;

    const now = Date.now();

    // If work phase just completed, save it
    if (isWorkPhase && data.currentWorkSession) {
      const phaseDuration = sessionStartTime
        ? Math.floor((now - sessionStartTime) / 1000)
        : pomodoroConfig.workDuration;

      data.completedWorkSessions.push({
        taskId: data.currentWorkSession.taskId,
        taskTitle: data.currentWorkSession.taskTitle,
        goalId: data.currentWorkSession.goalId,
        duration: Math.min(phaseDuration, pomodoroConfig.workDuration),
        startTime: data.currentWorkSession.startTime,
        endTime: now,
      });

      // Close the task in history
      const historyEntry = data.taskHistory.find(
        (h) =>
          h.taskId === data.currentWorkSession?.taskId &&
          h.endTime === h.startTime,
      );
      if (historyEntry) {
        historyEntry.endTime = now;
      }
    }

    // Check if all sessions are complete
    if (isWorkPhase && newSessionsCompleted >= data.totalSessions) {
      playAllSessionsCompleteSound();
      get().endPomodoroSession();
      return;
    }

    // Determine next phase
    let nextPhase: PomodoroPhase;
    let nextDuration: number;

    if (isWorkPhase) {
      // Work just ended -> Break time
      if (newSessionsCompleted % pomodoroConfig.sessionsBeforeLongBreak === 0) {
        nextPhase = "LONG_BREAK";
        nextDuration = pomodoroConfig.longBreakDuration;
        playLongBreakSound();
      } else {
        nextPhase = "SHORT_BREAK";
        nextDuration = pomodoroConfig.shortBreakDuration;
        playBreakStartSound();
      }
      data.currentWorkSession = null;
    } else {
      // Break just ended -> Work time
      nextPhase = "WORK";
      nextDuration = pomodoroConfig.workDuration;
      playWorkStartSound();

      // Start new work session for current task
      const currentTask = selectedTask;
      if (currentTask) {
        data.currentWorkSession = {
          taskId: currentTask.id,
          taskTitle: currentTask.title,
          goalId: currentTask.goalId || null,
          startTime: now,
        };

        data.taskHistory.push({
          taskId: currentTask.id,
          taskTitle: currentTask.title,
          startTime: now,
          endTime: now,
          color: currentTask.color || "#6366F1",
        });
      }
    }

    // Update session data
    data.currentPhase = nextPhase;
    data.sessionsCompleted = newSessionsCompleted;
    data.sessionStartTime = now;
    data.timeLeftInPhase = nextDuration;
    data.lastActiveAt = now;

    savePomodoroSession(data);

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
      sessionHistory: data.taskHistory.map((entry) => ({
        ...entry,
        endTime: entry.startTime === entry.endTime ? null : entry.endTime,
      })),
    });
  },

  endPomodoroSession: async () => {
    const data = loadPomodoroSession();
    if (!data) return;

    const state = get();

    // If there's a current work session in progress, capture it
    if (
      data.currentWorkSession &&
      state.sessionStartTime &&
      state.pomodoroState?.phase === "WORK"
    ) {
      const phaseDuration = Math.floor(
        (Date.now() - state.sessionStartTime) / 1000,
      );

      if (phaseDuration > 0) {
        data.completedWorkSessions.push({
          taskId: data.currentWorkSession.taskId,
          taskTitle: data.currentWorkSession.taskTitle,
          goalId: data.currentWorkSession.goalId,
          duration: Math.min(phaseDuration, data.config.workDuration),
          startTime: data.currentWorkSession.startTime,
          endTime: Date.now(),
        });
      }
    }

    // Format for bulk submission
    const sessionLog = data.completedWorkSessions.map((session) => ({
      taskId: session.taskId,
      goalId: session.goalId || undefined,
      duration: session.duration,
      note: `Pomodoro work session - ${session.taskTitle}`,
    }));

    if (sessionLog.length > 0) {
      try {
        // Use the service method instead of raw fetch
        await timeEntryService.completePomodoroSession(sessionLog);
      } catch {
        // Queue for later sync
        for (const session of data.completedWorkSessions) {
          addPendingSession({
            taskId: session.taskId,
            goalId: session.goalId || undefined,
            duration: session.duration,
            sessionsCompleted: data.sessionsCompleted,
            timestamp: Date.now(),
          });
        }
      }
    }

    // Finalize task history
    const finalHistory = data.taskHistory.map((entry) => ({
      ...entry,
      endTime: entry.endTime === entry.startTime ? Date.now() : entry.endTime,
    }));

    // Clear everything
    clearPomodoroSession();

    set({
      pomodoroState: null,
      elapsed: 0,
      sessionStartTime: null,
      currentTaskStartTime: null,
      accumulatedBeforePause: 0,
      sessionHistory: finalHistory.map((entry) => ({
        ...entry,
        endTime: entry.endTime === null ? Date.now() : entry.endTime,
      })),
      runningTimer: null,
      recoveredPomodoro: false,
      isPomodoroPaused: false,
    });
  },

  // ============================================================================
  // TASK SELECTION (handles task switching for all modes)
  // ============================================================================

  setSelectedTask: async (task) => {
    const state = get();
    const {
      runningTimer,
      timerMode,
      pomodoroState,
      sessionStartTime,
      pomodoroConfig,
    } = state;
    const currentTask = state.selectedTask;
    const now = Date.now();

    // No change
    if (currentTask?.id === task?.id) return;

    // No timer running - simple selection
    if (!runningTimer && !pomodoroState) {
      set({ selectedTask: task, selectedGoal: null });
      return;
    }

    // ========================================================================
    // POMODORO MODE - Task switching
    // ========================================================================
    if (timerMode === "POMODORO" && pomodoroState && currentTask && task) {
      const data = loadPomodoroSession();
      if (!data) return;

      // Save current phase progress to the old task
      if (data.currentWorkSession && pomodoroState.phase === "WORK") {
        const phaseElapsed = sessionStartTime
          ? Math.floor((now - sessionStartTime) / 1000)
          : 0;

        if (phaseElapsed > 0) {
          data.completedWorkSessions.push({
            taskId: data.currentWorkSession.taskId,
            taskTitle: data.currentWorkSession.taskTitle,
            goalId: data.currentWorkSession.goalId,
            duration: Math.min(phaseElapsed, data.config.workDuration),
            startTime: data.currentWorkSession.startTime,
            endTime: now,
          });

          // Update history for old task
          const oldHistoryEntry = data.taskHistory.find(
            (h) =>
              h.taskId === currentTask.id &&
              h.endTime === data.currentWorkSession?.startTime,
          );
          if (oldHistoryEntry) {
            oldHistoryEntry.endTime = now;
          }
        }
      } else if (pomodoroState.phase !== "WORK") {
        // During break, just update the last task's history
        const lastTaskEntry = [...data.taskHistory]
          .reverse()
          .find((h) => h.taskId === currentTask.id);
        if (
          lastTaskEntry &&
          lastTaskEntry.endTime === lastTaskEntry.startTime
        ) {
          lastTaskEntry.endTime = now;
        }
      }

      // Set up for new task
      data.taskId = task.id;
      data.taskTitle = task.title;
      data.taskColor = task.color || "#6366F1";
      data.goalId = task.goalId || null;
      data.sessionStartTime = now;
      data.lastActiveAt = now;

      // Reset phase time for new task
      if (pomodoroState.phase === "WORK") {
        data.timeLeftInPhase = data.config.workDuration;
        data.currentWorkSession = {
          taskId: task.id,
          taskTitle: task.title,
          goalId: task.goalId || null,
          startTime: now,
        };
      } else {
        // Keep remaining break time
        data.timeLeftInPhase = pomodoroState.timeLeftInPhase;
        data.currentWorkSession = null;
      }

      // Add new task to history
      data.taskHistory.push({
        taskId: task.id,
        taskTitle: task.title,
        startTime: now,
        endTime: now,
        color: task.color || "#6366F1",
      });

      savePomodoroSession(data);

      set({
        selectedTask: task,
        selectedGoal: null,
        sessionStartTime: now,
        currentTaskStartTime: pomodoroState.phase === "WORK" ? now : null,
        elapsed: data.timeLeftInPhase,
        sessionHistory: data.taskHistory.map((entry) => ({
          ...entry,
          endTime: entry.startTime === entry.endTime ? null : entry.endTime,
        })),
      });
      return;
    }

    // ========================================================================
    // SIMPLE MODE - Task switching (PAUSED)
    // ========================================================================
    if (runningTimer?.status === "PAUSED" && currentTask) {
      const { accumulatedBeforePause } = get();

      // Close current entry
      const updatedHistory = state.sessionHistory.map((entry) => {
        if (entry.taskId === currentTask.id && entry.endTime === null) {
          return { ...entry, endTime: now };
        }
        return entry;
      });

      // Stop current entry
      timeEntryService
        .update(runningTimer.id, { duration: accumulatedBeforePause })
        .catch(() => {});
      timeEntryService.stop(runningTimer.id).catch(() => {});

      // Start new entry for new task
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
        accumulatedBeforePause,
        sessionHistory: finalHistory,
      });

      const newState = get();
      saveTimerState(buildPersistedState(newState, newTimer.id));
      return;
    }

    // ========================================================================
    // SIMPLE MODE - Task switching (RUNNING)
    // ========================================================================
    if (runningTimer?.status === "RUNNING" && currentTask) {
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

    // Fallback
    set({ selectedTask: task, selectedGoal: null });
  },

  setSelectedGoal: async (goal) => {
    set({ selectedGoal: goal, selectedTask: null });
  },

  clearSelection: () => set({ selectedTask: null, selectedGoal: null }),
  clearLastStopped: () => set({ lastStoppedId: null }),

  // ============================================================================
  // SIMPLE TIMER ACTIONS
  // ============================================================================

  start: async (note?: string) => {
    const { timerMode, selectedTask, syncInterval } = get();

    if (!selectedTask) throw new Error("Please select a task first");

    if (timerMode === "POMODORO") {
      await get().startPomodoro(4); // Default 4 sessions if called directly
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

      // Start periodic sync every 30 seconds (was 30 minutes, but 30s is safer)
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
          console.error("Periodic sync failed:", e);
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
      console.error("Failed to start timer:", e);
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

    // Pause locally first (always works)
    set({
      runningTimer: { ...runningTimer, status: "PAUSED" },
      elapsed,
      sessionStartTime: null,
      accumulatedBeforePause: elapsed,
      sessionHistory: finalHistory,
      syncInterval: null,
    });

    // Try to finalize stop via backend
    const token = getTokenFromCookie();
    const apiUrl = getApiUrl();
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
      // Offline - keep paused state, retry on next load
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

    // Fire-and-forget backend update
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

    // Fire-and-forget backend update
    timeEntryService
      .update(runningTimer.id, { status: "RUNNING" })
      .catch(() => {});
  },
}));
