// lib/services/timerStateService.ts
import { api } from "@/lib/api";

export const timerStateService = {
  save: (data: { timerMode: string; state: any }) =>
    api.put("/timer-state", data),

  get: () =>
    api.get<{ timerMode: string; state: any; savedAt: string } | null>(
      "/timer-state",
    ),

  clear: () => api.delete("/timer-state"),
};
