import { api } from "@/lib/api";
import { Goal, Habit, Task, TimeEntry } from "@/types";

interface AIInsight {
  title: string;
  content: string;
  type: "summary" | "suggestion" | "encouragement" | "pattern";
}

export interface AIFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export const aiService = {
  generateInsights: (data: {
    goals: Goal[];
    habits: Habit[];
    tasks?: Task[];
    timeEntries?: TimeEntry[];
    period: string;
  }) => api.post<AIFeedback>("/api/ai/insights", data, "ai:insights"),
};
