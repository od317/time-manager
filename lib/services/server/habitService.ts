import { serverApi } from "@/lib/server-api";
import {
  Habit,
  HabitStats,
  HabitHeatmapEntry,
  HabitQueryParams,
} from "@/types";

export const serverHabitService = {
  getAll: async (params?: HabitQueryParams, revalidate = 60) => {
    return serverApi.get<Habit[], HabitQueryParams>("/habits", {
      params,
      revalidate,
      tags: ["habits"],
    });
  },

  getById: async (id: string) => {
    return serverApi.get<Habit>(`/habits/${id}`, {
      revalidate: false,
      tags: [`habit-${id}`],
    });
  },

  getHeatmap: async (id: string, year?: number) => {
    return serverApi.get<HabitHeatmapEntry[], { year?: number }>(
      `/habits/${id}/heatmap`,
      {
        params: { year },
        revalidate: 300,
        tags: [`habit-${id}-heatmap`],
      },
    );
  },

  getStats: async (id: string) => {
    return serverApi.get<HabitStats>(`/habits/${id}/stats`, {
      revalidate: 60,
      tags: [`habit-${id}-stats`],
    });
  },
};
