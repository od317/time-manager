import { create } from "zustand";

interface ModalState {
  quickTaskGoalId: string | null;
  openQuickTask: (goalId: string) => void;
  closeQuickTask: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  quickTaskGoalId: null,
  openQuickTask: (goalId) => set({ quickTaskGoalId: goalId }),
  closeQuickTask: () => set({ quickTaskGoalId: null }),
}));
