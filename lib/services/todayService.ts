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

export const todayService = {
  getAll: () => api.get<TodayResponse>("/today", undefined, CancelKeys.TODAY),
};
