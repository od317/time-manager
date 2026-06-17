// lib/pomodoroPersistence.ts

const POMODORO_SESSION_KEY = "pomodoro-session";
const POMODORO_PENDING_KEY = "pomodoro-pending";
export const MAX_RECOVERY_GAP_MS = 30 * 60 * 1000; // 30 minutes

export interface PomodoroWorkSession {
  taskId: string;
  taskTitle: string;
  goalId: string | null;
  duration: number; // actual seconds spent
  startTime: number;
  endTime: number;
}

export interface PomodoroSessionData {
  // Config
  totalSessions: number;
  config: {
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
  };

  // Current state
  currentPhase: "WORK" | "SHORT_BREAK" | "LONG_BREAK";
  sessionsCompleted: number;
  sessionStartTime: number; // when current phase started
  timeLeftInPhase: number;
  lastTickTime: number; // last time we saved to localStorage

  // Task info
  taskId: string;
  taskTitle: string;
  taskColor: string;
  goalId: string | null;

  // Completed work sessions (for bulk submission)
  completedWorkSessions: PomodoroWorkSession[];

  // Current work session being tracked
  currentWorkSession: {
    taskId: string;
    taskTitle: string;
    goalId: string | null;
    startTime: number;
  } | null;

  // History of all tasks worked on
  taskHistory: {
    taskId: string;
    taskTitle: string;
    startTime: number;
    endTime: number;
    color: string;
    duration: number;
  }[];

  // Timestamp for expiry
  lastActiveAt: number;
  createdAt: number;
  
}

export function savePomodoroSession(data: PomodoroSessionData) {
  try {
    localStorage.setItem(
      POMODORO_SESSION_KEY,
      JSON.stringify({
        ...data,
        lastActiveAt: Date.now(),
      }),
    );
  } catch {
    // localStorage full
  }
}

export function loadPomodoroSession(): PomodoroSessionData | null {
  try {
    const data = localStorage.getItem(POMODORO_SESSION_KEY);
    if (!data) return null;
    return JSON.parse(data) as PomodoroSessionData;
  } catch {
    return null;
  }
}

export function clearPomodoroSession() {
  localStorage.removeItem(POMODORO_SESSION_KEY);
}

export function isPomodoroSessionRecoverable(): {
  recoverable: boolean;
  data: PomodoroSessionData | null;
  gap: number;
} {
  const data = loadPomodoroSession();
  if (!data) return { recoverable: false, data: null, gap: 0 };

  const gap = Date.now() - data.lastActiveAt;
  const recoverable = gap <= MAX_RECOVERY_GAP_MS;

  return { recoverable, data, gap };
}

// Pending sessions queue (for offline support)
export interface PendingPomodoroSession {
  taskId?: string;
  goalId?: string;
  duration: number;
  sessionsCompleted: number;
  timestamp: number;
}

export function addPendingSession(session: PendingPomodoroSession) {
  const pending = loadPendingSessions();
  pending.push(session);
  localStorage.setItem(POMODORO_PENDING_KEY, JSON.stringify(pending));
}

export function loadPendingSessions(): PendingPomodoroSession[] {
  try {
    return JSON.parse(localStorage.getItem(POMODORO_PENDING_KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearPendingSessions() {
  localStorage.removeItem(POMODORO_PENDING_KEY);
}
