import { create } from "zustand";

interface TaskState {
  localCompletedIds: Set<string>;
  markComplete: (taskId: string) => void;
  isCompleted: (taskId: string) => boolean;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  localCompletedIds: new Set<string>(),

  markComplete: (taskId: string) => {
    set((state) => ({
      localCompletedIds: new Set([...state.localCompletedIds, taskId]),
    }));
  },

  isCompleted: (taskId: string) => {
    return get().localCompletedIds.has(taskId);
  },
}));
