import { create } from "zustand";
import { Task } from "@/types";

interface ModalState {
  quickTaskGoalId: string | null;
  editingTask: Task | null;

  openQuickTask: (goalId: string) => void;
  closeQuickTask: () => void;
  openEditTask: (task: Task) => void;
  closeEditTask: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  quickTaskGoalId: null,
  editingTask: null,

  openQuickTask: (goalId) => set({ quickTaskGoalId: goalId }),
  closeQuickTask: () => set({ quickTaskGoalId: null }),
  openEditTask: (task) => set({ editingTask: task }),
  closeEditTask: () => set({ editingTask: null }),
}));
