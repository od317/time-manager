import { GoalId, Priority, GoalStatus, GoalType } from "./common";
import { Task } from "./task";
import { TimeEntry } from "./timeEntry";

export interface Goal {
  id: GoalId;
  userId: string;
  parentId: GoalId | null;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[];
  priority: Priority;
  targetMetric: string | null;
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
  startDate: string;
  endDate: string | null;
  deadlineType: "HARD" | "SOFT";
  gracePeriodHours: number;
  autoFail: boolean;
  status: GoalStatus;
  completedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  archivedAt: string | null;
  progress: number;
  lastActivityAt: string;
  color: string | null;
  icon: string | null;
  sortOrder: number;
  isRecurring: boolean;
  recurringRule: string | null;
  createdAt: string;
  updatedAt: string;
  goalType: GoalType;
  // Relations (optional, included when requested)
  children?: Goal[];
  tasks?: Task[];
  timeEntries?: TimeEntry[];
  parent?: Goal;
  _count?: {
    children: number;
    tasks: number;
    timeEntries: number;
  };
}

export interface GoalStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalTimeSpent: number;
  progress: number;
  childGoalsCount: number;
  childGoalsCompleted: number;
}

export interface CreateGoalPayload {
  title: string;
  description?: string;
  parentId?: string | null;
  category?: string;
  tags?: string[];
  priority?: Priority;
  targetValue?: number;
  unit?: string;
  startDate?: string;
  endDate?: string;
  deadlineType?: "HARD" | "SOFT";
  color?: string;
  icon?: string;
  isRecurring?: boolean;
  recurringRule?: string;
  goalType: GoalType;
}

export interface UpdateGoalPayload extends Partial<CreateGoalPayload> {
  currentValue?: number;
  progress?: number;
  status?: GoalStatus;
  sortOrder?: number;
  failureReason?: string;
}

export interface ReorderPayload {
  orderedIds: GoalId[];
}
