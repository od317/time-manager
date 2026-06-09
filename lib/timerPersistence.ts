// lib/timerPersistence.ts

const STORAGE_KEY = "timer-session";

const POMODORO_CONFIG_KEY = "pomodoro-config";

const SIMPLE_PENDING_KEY = "simple-timer-pending";

interface PomodoroConfigStorage {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  selectedPreset: string;
}

export interface PendingSimpleEntry {
  taskId?: string;
  goalId?: string;
  duration: number;
  startTime: string;
  note?: string;
  timestamp: number;
}

export interface PersistedTimerState {
  runningTimerId: string | null;
  sessionStartTime: number | null;
  currentTaskStartTime: number | null;
  accumulatedBeforePause: number;
  selectedTaskId: string | null;
  selectedTaskTitle: string | null;
  selectedTaskColor: string | null;
  selectedTaskGoalId: string | null;
  sessionHistory: {
    taskId: string;
    taskTitle: string;
    startTime: number;
    endTime: number | null;
    color: string;
  }[];
  timerMode: string;
  pomodoroPhase: string | null;
  pomodoroSessionsCompleted: number;
  pomodoroTimeLeft: number | null;
  savedAt: number;
}

export function buildPersistedState(state: any, runningTimerId: string | null) {
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

export function saveTimerState(state: PersistedTimerState) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        savedAt: Date.now(),
      }),
    );
  } catch {
    // localStorage full or unavailable
  }
}

export function loadPomodoroConfig(): PomodoroConfigStorage | null {
  try {
    const data = localStorage.getItem(POMODORO_CONFIG_KEY);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function loadTimerState(): PersistedTimerState | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data) as PersistedTimerState;

    // Expire after 24 hours
    if (Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearTimerState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function addPendingSimpleEntries(entries: PendingSimpleEntry[]) {
  try {
    const existing = loadPendingSimpleEntries();
    localStorage.setItem(
      SIMPLE_PENDING_KEY,
      JSON.stringify([...existing, ...entries]),
    );
  } catch {}
}

export function loadPendingSimpleEntries(): PendingSimpleEntry[] {
  try {
    return JSON.parse(localStorage.getItem(SIMPLE_PENDING_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearPendingSimpleEntries() {
  localStorage.removeItem(SIMPLE_PENDING_KEY);
}
