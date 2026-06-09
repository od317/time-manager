import { api, CancelKeys } from "@/lib/api";
import {
  TimeEntry,
  TimeSummary,
  QuickLogPayload,
  TimeEntryQueryParams,
  TimeSummaryParams,
} from "@/types";

export const timeEntryService = {
  getAll: (params?: TimeEntryQueryParams) =>
    api.get<TimeEntry[], TimeEntryQueryParams>("/time-entries", params),

  getById: (id: string) => api.get<TimeEntry>(`/time-entries/${id}`),

  quickLog: (data: QuickLogPayload) =>
    api.post<TimeEntry, QuickLogPayload>(
      "/time-entries/quick-log",
      data,
      "timer:quick-log",
    ),
  bulkLog: (data: {
    entries: {
      taskId?: string;
      goalId?: string;
      duration: number;
      startTime: string;
      note?: string;
    }[];
  }) => api.post("/time-entries/bulk-log", data, "timer:bulk-log"),

  delete: (id: string) => api.delete<void>(`/time-entries/${id}`),

  getSummary: (params: TimeSummaryParams) =>
    api.get<TimeSummary, TimeSummaryParams>("/time-entries/summary", params),

  completePomodoroSession: (
    sessionLog: {
      taskId?: string;
      goalId?: string;
      duration: number;
      note?: string;
    }[],
  ) => api.post("/pomodoro/complete", { sessionLog }),
};
