import { api, CancelKeys } from "@/lib/api";
import {
  TimeEntry,
  TimeSummary,
  StartTimerPayload,
  QuickLogPayload,
  TimeEntryQueryParams,
  TimeSummaryParams,
} from "@/types";

export const timeEntryService = {
  getAll: (params?: TimeEntryQueryParams) =>
    api.get<TimeEntry[], TimeEntryQueryParams>("/time-entries", params),

  getById: (id: string) => api.get<TimeEntry>(`/time-entries/${id}`),

  getRunning: () => api.get<TimeEntry | null>("/time-entries/running"),

  start: (data: StartTimerPayload) =>
    api.post<TimeEntry, StartTimerPayload>(
      "/time-entries/start",
      data,
      CancelKeys.TIMER_START,
    ),

  stop: (id: string) =>
    api.put<TimeEntry>(
      `/time-entries/${id}/stop`,
      undefined,
      CancelKeys.TIMER_STOP,
    ),

  pause: (id: string) =>
    api.put<TimeEntry>(`/time-entries/${id}/pause`, undefined, "timer:pause"),

  resume: (id: string) =>
    api.put<TimeEntry>(`/time-entries/${id}/resume`, undefined, "timer:resume"),

  quickLog: (data: QuickLogPayload) =>
    api.post<TimeEntry, QuickLogPayload>(
      "/time-entries/quick-log",
      data,
      "timer:quick-log",
    ),

  delete: (id: string) => api.delete<void>(`/time-entries/${id}`),

  getSummary: (params: TimeSummaryParams) =>
    api.get<TimeSummary, TimeSummaryParams>("/time-entries/summary", params),
};
