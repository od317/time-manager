import { api, CancelKeys } from "@/lib/api";
import { Goal, Habit, TimeEntry, Task } from "@/types";

export interface TodayResponse {
  date: string;
  goals: Goal[];
  habits: Habit[];
  runningTimer: TimeEntry | null;
  tasks: Task[];
  stats: {
    activeGoals: number;
    overdueGoals: number;
    totalGoals: number;
    habitsDue: number;
    activeTasks: number;
    completedToday: number;
    habitsCompletedToday: number;
  };
}

// Helper: get user's local date in YYYY-MM-DD format
const getUserLocalDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

export const todayService = {
  getAll: () =>
    api.get<TodayResponse>(
      "/today",
      { date: getUserLocalDate() },
      CancelKeys.TODAY,
    ),
};
