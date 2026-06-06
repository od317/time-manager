import { serverApi } from "@/lib/server-api";
import { Goal, GoalStats, GoalQueryParams } from "@/types";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}

export const serverGoalService = {
  // Paginated - for future use
  getAll: async (params?: GoalQueryParams, revalidate: number | false = 60) => {
    return serverApi.get<PaginatedResponse<Goal>, GoalQueryParams>("/goals", {
      params,
      revalidate,
      tags: ["goals"],
    });
  },

  // Non-paginated - gets ALL goals
  getAllNoPagination: async (
    params?: GoalQueryParams,
    revalidate: number | false = 60,
  ) => {
    return serverApi.get<Goal[]>("/goals", {
      params: { ...params, paginated: "false" },
      revalidate,
      tags: ["goals"],
    });
  },

  // Active + Overdue - non-paginated
  getActiveAndOverdue: async (revalidate: number | false = 60) => {
    return serverApi.get<Goal[]>("/goals", {
      params: { status: "ACTIVE,OVERDUE", paginated: "false" },
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
