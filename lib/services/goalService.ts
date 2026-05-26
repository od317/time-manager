import { api, createCancelKey, CancelKeys } from "@/lib/api";
import {
  Goal,
  GoalStats,
  CreateGoalPayload,
  UpdateGoalPayload,
  ReorderPayload,
  GoalQueryParams,
} from "@/types";

export const goalService = {
  getAll: (params?: GoalQueryParams) =>
    api.get<Goal[], GoalQueryParams>("/goals", params),

  getById: (id: string) => api.get<Goal>(`/goals/${id}`),

  create: (data: CreateGoalPayload) =>
    api.post<Goal, CreateGoalPayload>("/goals", data, CancelKeys.GOAL_CREATE),

  update: (id: string, data: UpdateGoalPayload) =>
    api.put<Goal, UpdateGoalPayload>(
      `/goals/${id}`,
      data,
      createCancelKey("goal", "update", id),
    ),

  delete: (id: string) =>
    api.delete<void>(`/goals/${id}`, createCancelKey("goal", "delete", id)),

  reorder: (data: ReorderPayload) =>
    api.put<void, ReorderPayload>("/goals/reorder", data, "goal:reorder"),

  getStats: (id: string) => api.get<GoalStats>(`/goals/${id}/stats`),
};
