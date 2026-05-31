import { api } from "@/lib/api";
import { Goal, Habit, TimeEntry } from "@/types";

interface AIInsight {
  title: string;
  content: string;
  type: "summary" | "suggestion" | "encouragement" | "pattern";
}

export const aiService = {
  generateInsights: (data: {
    goals: Goal[];
    habits: Habit[];
    timeEntries: TimeEntry[];
    period: string;
  }) => api.post<{ insights: AIInsight[] }>("/ai/insights", data),
};
