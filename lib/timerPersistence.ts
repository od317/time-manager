// lib/timerPersistence.ts

const STORAGE_KEY = "timer-session";

const POMODORO_CONFIG_KEY = "pomodoro-config";

interface PomodoroConfigStorage {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  selectedPreset: string;
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
