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

  bulkCreate: (data: { tasks: CreateTaskPayload[]; date?: string }) =>
    api.post<Task[], { tasks: CreateTaskPayload[]; date?: string }>(
      "/tasks/bulk",
      {
        ...data,
        date: data.date || getUserLocalDate(),
      },
      "task:bulk-create",
    ),

  // Bulk update task status
  bulkUpdate: (data: { taskIds: string[]; status: string; date?: string }) =>
    api.put<void, { taskIds: string[]; status: string; date?: string }>(
      "/tasks/bulk",
      {
        ...data,
        date: data.date || getUserLocalDate(),
      },
      "task:bulk-update",
    ),

  // Bulk delete tasks
  bulkDelete: (taskIds: string[]) =>
    api.delete<void, { taskIds: string[] }>(
      "/tasks/bulk",
      { taskIds },
      "task:bulk-delete",
    ),
};
