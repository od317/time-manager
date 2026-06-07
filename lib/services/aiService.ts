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

export interface GeneratePlanPayload {
  title: string;
  description?: string;
  category?: string;
  timeframe?: string;
  hoursPerWeek?: string;
  currentLevel?: string;
  additionalNotes?: string;
}

export interface GeneratedPlan {
  goal: {
    title: string;
    description: string;
    goalType: string;
    priority: string;
    tags: string[];
    estimatedTotalHours: number;
    breakdown: string;
  };
  subGoals: GeneratedSubGoal[];
}

export interface GeneratedSubGoal {
  title: string;
  description: string;
  priority: string;
  order: number;
  estimatedHours: number;
  deadlineOffset: string;
  tasks: GeneratedTask[];
}

export interface GeneratedTask {
  title: string;
  description: string;
  priority: string;
  estimatedMinutes: number;
  dueDateOffset: string;
}

export const aiService = {
  generateInsights: (data: {
    goals: Goal[];
    habits: Habit[];
    tasks?: Task[];
    timeEntries?: TimeEntry[];
    period: string;
  }) => api.post<AIFeedback>("/api/ai/insights", data, "ai:insights"),
  generatePlan: (data: GeneratePlanPayload) =>
    api.postLongTimeout<GeneratedPlan>(
      "/ai/generate-plan",
      data,
      "ai:generate",
    ),
  createPlan: (data: GeneratedPlan) =>
    api.postLongTimeout<Goal>("/ai/create-plan", data, "ai:create"),
};
