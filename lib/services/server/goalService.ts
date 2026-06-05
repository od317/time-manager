import { serverApi } from "@/lib/server-api";
import { Goal, GoalStats, GoalQueryParams } from "@/types";

export const serverGoalService = {
  getAll: async (params?: GoalQueryParams, revalidate: number | false = 60) => {
    return serverApi.get<Goal[], GoalQueryParams>("/goals", {
      params,
      revalidate,
      tags: ["goals"],
    });
  },
  getActiveAndOverdue: async (revalidate: number | false = 60) => {
    return serverApi.get<Goal[]>("/goals", {
      params: { status: "ACTIVE,OVERDUE" },
      revalidate,
      tags: ["goals"],
    });
  },

  getById: async (id: string) => {
    return serverApi.get<Goal>(`/goals/${id}`, {
      revalidate: false,
      tags: [`goal-${id}`],
    });
  },

  getStats: async (id: string) => {
    return serverApi.get<GoalStats>(`/goals/${id}/stats`, {
      revalidate: 300,
      tags: [`goal-${id}-stats`],
    });
  },
};
