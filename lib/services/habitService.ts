import { api, createCancelKey, CancelKeys } from "@/lib/api";
import {
  Habit,
  HabitStats,
  HabitLog,
  HabitHeatmapEntry,
  CreateHabitPayload,
  UpdateHabitPayload,
  LogHabitPayload,
  SkipHabitPayload,
  HabitQueryParams,
} from "@/types";

// Helper: get user's local date in YYYY-MM-DD format
const getUserLocalDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

export const habitService = {
  getAll: (params?: HabitQueryParams) =>
    api.get<Habit[], HabitQueryParams>("/habits", params),

  getById: (id: string) => api.get<Habit>(`/habits/${id}`),

  create: (data: CreateHabitPayload) =>
    api.post<Habit, CreateHabitPayload>(
      "/habits",
      data,
      CancelKeys.HABIT_CREATE,
    ),

  update: (id: string, data: UpdateHabitPayload) =>
    api.put<Habit, UpdateHabitPayload>(
      `/habits/${id}`,
      data,
      createCancelKey("habit", "update", id),
    ),

  delete: (id: string) =>
    api.delete<void>(`/habits/${id}`, createCancelKey("habit", "delete", id)),

  log: (id: string, data?: Partial<LogHabitPayload>) =>
    api.post<HabitLog, LogHabitPayload>(
      `/habits/${id}/log`,
      {
        date: getUserLocalDate(), // Always send user's local date
        ...data,
      },
      createCancelKey("habit", "log", id),
    ),

  skip: (id: string, data?: Partial<SkipHabitPayload>) =>
    api.post<HabitLog, SkipHabitPayload>(
      `/habits/${id}/skip`,
      {
        // date: getUserLocalDate(), // Always send user's local date
        ...data,
      },
      createCancelKey("habit", "skip", id),
    ),

  getHeatmap: (id: string, year?: number) =>
    api.get<HabitHeatmapEntry[], { year?: number }>(`/habits/${id}/heatmap`, {
      year,
    }),

  getStats: (id: string) => api.get<HabitStats>(`/habits/${id}/stats`),

  unlog: (id: string) =>
    api.delete<void>(
      `/habits/${id}/log`,
      createCancelKey("habit", "unlog", id),
    ),
};
