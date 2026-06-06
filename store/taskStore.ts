import { create } from "zustand";
import { Task } from "@/types";

interface TaskState {
  // Completion tracking
  localCompletedIds: Set<string>;
  markComplete: (taskId: string) => void;
  isCompleted: (taskId: string) => boolean;

  // Local tasks (optimistic updates for NEW tasks)
  localTasks: Map<string, Task[]>; // goalId → tasks
  addTask: (goalId: string, task: Task) => void;

  // Task mutations (affects both local + tracked for UI updates)
  updatedTasks: Map<string, Partial<Task>>; // taskId → updates
  deletedTaskIds: Set<string>;

  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string, goalId: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  // Completion
  localCompletedIds: new Set<string>(),

  markComplete: (taskId: string) => {
    set((state) => ({
      localCompletedIds: new Set([...state.localCompletedIds, taskId]),
    }));
  },

  isCompleted: (taskId: string) => {
    return get().localCompletedIds.has(taskId);
  },

  // Tasks CRUD
  localTasks: new Map(),
  updatedTasks: new Map(),
  deletedTaskIds: new Set(),

  addTask: (goalId, task) =>
    set((state) => {
      const next = new Map(state.localTasks);
      const existing = next.get(goalId) || [];
      next.set(goalId, [task, ...existing]);
      return { localTasks: next };
    }),

  updateTask: (taskId, updates) =>
    set((state) => {
      const next = new Map(state.updatedTasks);
      next.set(taskId, { ...(next.get(taskId) || {}), ...updates });

      // Also update in localTasks if present
      const localNext = new Map(state.localTasks);
      localNext.forEach((tasks, goalId) => {
        localNext.set(
          goalId,
          tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
        );
      });

      return { updatedTasks: next, localTasks: localNext };
    }),

  removeTask: (taskId, goalId) =>
    set((state) => {
      // Mark as deleted
      const deletedNext = new Set(state.deletedTaskIds);
      deletedNext.add(taskId);

      // Remove from localTasks
      const localNext = new Map(state.localTasks);
      const existing = localNext.get(goalId) || [];
      localNext.set(
        goalId,
        existing.filter((t) => t.id !== taskId),
      );

      return { deletedTaskIds: deletedNext, localTasks: localNext };
    }),
}));
