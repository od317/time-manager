import { TaskId, GoalId, Priority, TaskStatus } from "./common";
import { TimeEntry } from "./timeEntry";

export interface Task {
  id: TaskId;
  color: string | null;
  userId: string;
  goalId: GoalId | null;
  title: string;
  description: string | null;
  priority: Priority;
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
  dueDate: string | null;
  estimatedMinutes: number | null;
  gracePeriodHours: number;
  autoFail: boolean;
  status: TaskStatus;
  completedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  sortOrder: number;
  isRecurring: boolean;
  recurringRule: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  timeEntries?: TimeEntry[];
  checkIns?: TaskCheckIn[];
  goal?: {
    id: string;
    title: string;
  };
}

export interface TaskCheckIn {
  id: string;
  taskId: TaskId;
  value: number | null;
  duration: number | null;
  note: string | null;
  checkedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  goalId?: string;
  priority?: Priority;
  targetValue?: number;
  unit?: string;
  dueDate?: string;
  estimatedMinutes?: number;
  isRecurring?: boolean;
  recurringRule?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  currentValue?: number;
  status?: TaskStatus;
  sortOrder?: number;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface TaskCheckInPayload {
  value?: number;
  duration?: number;
  note?: string;
}
