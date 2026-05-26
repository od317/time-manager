import { api, createCancelKey } from "@/lib/api";
import { Task, CreateTaskPayload, UpdateTaskPayload } from "@/types";

export const taskService = {
  create: (data: CreateTaskPayload) =>
    api.post<Task, CreateTaskPayload>("/tasks", data, "task:create"),

  update: (id: string, data: UpdateTaskPayload) =>
    api.put<Task, UpdateTaskPayload>(
      `/tasks/${id}`,
      data,
      createCancelKey("task", "update", id),
    ),

  delete: (id: string) =>
    api.delete<void>(`/tasks/${id}`, createCancelKey("task", "delete", id)),
};
