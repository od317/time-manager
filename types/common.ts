// ============================================================================
// COMMON TYPES
// ============================================================================

export type GoalType = "quantity" | "time" | "project";

export type TimerMode = "SIMPLE" | "POMODORO" | "QUICK_LOG";
export type PomodoroPhase = "WORK" | "SHORT_BREAK" | "LONG_BREAK";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type GoalStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "FAILED"
  | "ARCHIVED"
  | "OVERDUE"
  | "PAUSED";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "OVERDUE"
  | "ARCHIVED";

export type HabitStatus = "ACTIVE" | "PAUSED" | "ARCHIVED";

export type FrequencyType = "DAILY" | "WEEKLY" | "CUSTOM";

export type TimerStatus = "RUNNING" | "PAUSED" | "COMPLETED";

export type TimerEntryType = "TIMER" | "MANUAL" | "POMODORO";

export type HabitLogStatus = "COMPLETED" | "SKIPPED" | "MISSED" | "ROLLOVER";

export type InsightType =
  | "WEEKLY_REVIEW"
  | "SUGGESTION"
  | "PATTERN"
  | "ENCOURAGEMENT"
  | "GOAL_BREAKDOWN"
  | "HABIT_RECOMMENDATION";

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// QUERY PARAMS
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface GoalQueryParams extends PaginationParams {
  status?: GoalStatus;
  parentId?: string | null;
}

export interface HabitQueryParams extends PaginationParams {
  status?: HabitStatus;
  frequencyType?: FrequencyType;
}

export interface TimeEntryQueryParams
  extends PaginationParams, DateRangeParams {
  goalId?: string;
  taskId?: string;
  habitId?: string;
}

export interface TimeSummaryParams {
  period: "today" | "week" | "month";
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ============================================================================
// UI TYPES
// ============================================================================

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterOption<T = string> {
  label: string;
  value: T;
  color?: string;
  icon?: string;
}

// ============================================================================
// THEME TYPES
// ============================================================================

export type CategoryColor =
  | "health"
  | "learning"
  | "career"
  | "personal"
  | "finance"
  | "other";

export type PriorityColor = "urgent" | "high" | "medium" | "low";

// ============================================================================
// ID TYPES (for type safety)
// ============================================================================

export type GoalId = string;
export type TaskId = string;
export type HabitId = string;
export type TimeEntryId = string;
export type UserId = string;
