import {
  TimeEntryId,
  TimerStatus,
  TimerEntryType,
  GoalId,
  TaskId,
  HabitId,
} from "./common";

export interface TimeEntry {
  id: TimeEntryId;
  userId: string;
  goalId: GoalId | null;
  taskId: TaskId | null;
  habitId: HabitId | null;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  entryType: TimerEntryType;
  status: TimerStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  goal?: { id: string; title: string; color: string | null } | null;
  task?: { id: string; title: string } | null;
  habit?: { id: string; title: string; color: string | null } | null;
}

export interface TimeSummary {
  period: string;
  startDate: string;
  endDate: string;
  totalTime: {
    seconds: number;
    minutes: number;
    hours: number;
    formatted: {
      compact: string;
      short: string;
      human: string;
    };
  };
  unassigned: {
    seconds: number;
    minutes: number;
    hours: number;
    formatted: {
      compact: string;
      short: string;
      human: string;
    };
  };
  byGoal: TimeGroupDetail[];
  byTask: TimeGroupDetail[];
  byHabit: TimeGroupDetail[];
  entryCount: number;
}

export interface TimeGroupDetail {
  id: string;
  title: string;
  color?: string;
  totalDuration: number;
  totalDurationSeconds: number;
  totalDurationMinutes: number;
  totalDurationHours: number;
  durationFormatted: {
    seconds: number;
    minutes: number;
    hours: number;
    formatted: {
      compact: string;
      short: string;
      human: string;
    };
  };
  percentage: number;
  entries: TimeEntry[];
}

export interface TimeGroup {
  title: string;
  color: string | null;
  totalDuration: number;
}

export interface StartTimerPayload {
  goalId?: string;
  taskId?: string;
  habitId?: string;
  note?: string;
  entryType?: TimerEntryType;
}

export interface QuickLogPayload {
  duration: number; // in minutes
  goalId?: string;
  taskId?: string;
  habitId?: string;
  startTime?: string;
  note?: string;
}

export interface StartTimerPayload {
  goalId?: string;
  taskId?: string;
  habitId?: string;
  note?: string;
  entryType?: TimerEntryType;
}
