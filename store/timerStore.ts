import { create } from "zustand";
import { TimeEntry } from "@/types";
import { timeEntryService } from "@/lib/services";

interface TimerState {
  runningTimer: TimeEntry | null;
  elapsed: number;
  isLoading: boolean;

  setRunningTimer: (timer: TimeEntry | null) => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  runningTimer: null,
  elapsed: 0,
  isLoading: false,

  setRunningTimer: (timer) => set({ runningTimer: timer }),

  start: async () => {
    set({ isLoading: true });
    try {
      const timer = await timeEntryService.start({ entryType: "TIMER" });
      set({ runningTimer: timer, isLoading: false });
    } catch {
      set({ isLoading: false });
      throw new Error("Failed to start timer");
    }
  },

  stop: async () => {
    const { runningTimer } = get();
    if (!runningTimer) return;
    try {
      const updated = await timeEntryService.stop(runningTimer.id);
      set({ runningTimer: updated, elapsed: updated.duration || 0 });
    } catch {
      throw new Error("Failed to stop timer");
    }
  },

  pause: async () => {
    const { runningTimer } = get();
    if (!runningTimer) return;
    try {
      const updated = await timeEntryService.pause(runningTimer.id);
      set({ runningTimer: updated });
    } catch {
      throw new Error("Failed to pause timer");
    }
  },

  resume: async () => {
    const { runningTimer } = get();
    if (!runningTimer) return;
    try {
      const updated = await timeEntryService.resume(runningTimer.id);
      set({ runningTimer: updated });
    } catch {
      throw new Error("Failed to resume timer");
    }
  },
}));
