import { serverApi } from "@/lib/server-api";
import {
  TimeEntry,
  TimeSummary,
  TimeEntryQueryParams,
  TimeSummaryParams,
} from "@/types";

export const serverTimeEntryService = {
  getAll: async (params?: TimeEntryQueryParams) => {
    return serverApi.get<TimeEntry[], TimeEntryQueryParams>("/time-entries", {
      params,
      revalidate: false,
      tags: ["time-entries"],
    });
  },

  getRunning: async () => {
    return serverApi.get<TimeEntry | null>("/time-entries/running", {
      revalidate: false,
      tags: ["running-timer"],
    });
  },

  getSummary: async (params: TimeSummaryParams) => {
    return serverApi.get<TimeSummary, TimeSummaryParams>(
      "/time-entries/summary",
      {
        params,
        revalidate: 300,
        tags: ["time-summary"],
      },
    );
  },
};
