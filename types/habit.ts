import { HabitId, FrequencyType, HabitStatus, Priority } from "./common";
import { TimeEntry } from "./timeEntry";

export interface Habit {
  id: HabitId;
  userId: string;
  title: string;
  todayLog?: HabitLog | null;
  todayStatus?: "PENDING" | "COMPLETED" | "MISSED" | "SKIPPED";
  completionCount?: number;
  remaining?: number;
  isCompleted?: boolean;
  description: string | null;
  category: string | null;
  tags: string[];
  frequencyType: FrequencyType;
  frequencyDays: number[];
  timesPerDay: number;
  targetTimeWindows: string | null;
  targetValue: number | null;
  unit: string | null;
  trackAmount: boolean;
  status: HabitStatus;
  pausedAt: string | null;
  archivedAt: string | null;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  allowRollover: boolean;
  maxRolloverDays: number;
  currentRollovers: number;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  lastCompletedAt: string | null;
  lastEvaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDueToday?: boolean;
  // Relations
  logs?: HabitLog[];
  timeEntries?: TimeEntry[];
  _count?: {
    logs: number;
  };
}

export interface HabitLog {
  id: string;
  habitId: HabitId;
  date: string;
  completedAt: string;
  value: number | null;
  unit: string | null;
  status: "COMPLETED" | "SKIPPED" | "MISSED" | "ROLLOVER";
  note: string | null;
  rolledOverFrom: string | null;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate30Days: number;
  averageValue: number;
}

export interface HabitHeatmapEntry {
  date: string;
  status: string;
  value: number | null;
}

export interface CreateHabitPayload {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  frequencyType?: FrequencyType;
  frequencyDays?: number[];
  timesPerDay?: number;
  targetTimeWindows?: { start: string; end: string }[];
  targetValue?: number;
  unit?: string;
  trackAmount?: boolean;
  allowRollover?: boolean;
  maxRolloverDays?: number;
  color?: string;
  icon?: string;
}

export interface UpdateHabitPayload extends Partial<CreateHabitPayload> {
  status?: HabitStatus;
  sortOrder?: number;
}

export interface LogHabitPayload {
  date?: string;
  value?: number;
  note?: string;
}

export interface SkipHabitPayload {
  note?: string;
}
