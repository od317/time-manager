import { api, createCancelKey } from "@/lib/api";
import { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types";

// Helper: get user's local date in YYYY-MM-DD format
const getUserLocalDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

export const taskService = {
  // GET all tasks (optionally with date)
  getAll: (params?: { status?: string; goalId?: string; date?: string }) =>
    api.get<Task[]>("/tasks", {
      ...params,
      date: params?.date || getUserLocalDate(),
    }),

  // GET single task is handled by getById if you have it, otherwise skip

  create: (data: CreateTaskPayload) =>
    api.post<Task, CreateTaskPayload>(
      "/tasks",
      {
        ...data,
        date: getUserLocalDate(), // Send user's local date
      },
      "task:create",
    ),

  update: (id: string, data: UpdateTaskPayload) =>
    api.put<Task, UpdateTaskPayload>(
      `/tasks/${id}`,
      {
        ...data,
        date: getUserLocalDate(), // Send user's local date
      },
      createCancelKey("task", "update", id),
    ),

  delete: (id: string) =>
    api.delete<void>(`/tasks/${id}`, createCancelKey("task", "delete", id)),
};
