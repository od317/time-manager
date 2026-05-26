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

  log: (id: string, data: LogHabitPayload) =>
    api.post<HabitLog, LogHabitPayload>(
      `/habits/${id}/log`,
      data,
      createCancelKey("habit", "log", id),
    ),

  skip: (id: string, data: SkipHabitPayload) =>
    api.post<HabitLog, SkipHabitPayload>(
      `/habits/${id}/skip`,
      data,
      createCancelKey("habit", "skip", id),
    ),

  getHeatmap: (id: string, year?: number) =>
    api.get<HabitHeatmapEntry[], { year?: number }>(`/habits/${id}/heatmap`, {
      year,
    }),

  getStats: (id: string) => api.get<HabitStats>(`/habits/${id}/stats`),
};
