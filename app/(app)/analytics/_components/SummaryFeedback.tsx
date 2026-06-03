"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Goal, Habit, Task } from "@/types";
import { aiService } from "@/lib/services/aiService";
import {
  Sparkles,
  Target,
  CheckSquare,
  Repeat,
  AlertCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface SummaryFeedbackProps {
  goals: Goal[];
  habits: Habit[];
  tasks: Task[];
}

interface AIFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export function SummaryFeedback({
  goals,
  habits,
  tasks,
}: SummaryFeedbackProps) {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate summary stats
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");
  const failedGoals = goals.filter((g) => g.status === "FAILED");
  const overdueGoals = activeGoals.filter(
    (g) => g.endDate && new Date(g.endDate) < new Date(),
  );

  const activeTasks = tasks.filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
  );
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
  const overdueTasks = activeTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date(),
  );

  const activeHabits = habits.filter((h) => h.status === "ACTIVE");
  const pausedHabits = habits.filter((h) => h.status === "PAUSED");
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, h.currentStreak),
    0,
  );
  const avgStreak =
    activeHabits.length > 0
      ? Math.round(
          activeHabits.reduce((sum, h) => sum + h.currentStreak, 0) /
            activeHabits.length,
        )
      : 0;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await aiService.generateInsights({
          goals,
          habits,
          tasks,
          period: "overall",
        });

        // Response is now the object directly
        if (response) {
          setFeedback({
            overall: response.overall || "Keep pushing forward!",
            strengths: response.strengths || [],
            improvements: response.improvements || [],
            recommendation: response.recommendation || "Focus on consistency.",
          });
        }
      } catch {
        setFeedback({
          overall: "You're making progress!",
          strengths: ["Consistent habit tracking", "Regular time logging"],
          improvements: [
            "Focus on completing overdue tasks",
            "Consider pausing goals instead of abandoning them",
          ],
          recommendation: "Try completing 2 overdue tasks this week.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Target}
          title="Active Goals"
          value={activeGoals.length}
          sub={`${completedGoals.length} completed, ${failedGoals.length} failed`}
          color="text-primary"
          bg="bg-primary-bg"
          alert={
            overdueGoals.length > 0
              ? `${overdueGoals.length} overdue`
              : undefined
          }
        />
        <SummaryCard
          icon={CheckSquare}
          title="Active Tasks"
          value={activeTasks.length}
          sub={`${completedTasks.length} completed`}
          color="text-success"
          bg="bg-success-bg"
          alert={
            overdueTasks.length > 0
              ? `${overdueTasks.length} overdue`
              : undefined
          }
        />
        <SummaryCard
          icon={Repeat}
          title="Active Habits"
          value={activeHabits.length}
          sub={`${pausedHabits.length} paused, best streak: ${bestStreak}`}
          color="text-purple-500"
          bg="bg-purple-100"
        />
        <SummaryCard
          icon={Clock}
          title="Avg Streak"
          value={avgStreak}
          sub="days across all habits"
          color="text-warning"
          bg="bg-warning-bg"
        />
      </div>

      {/* AI Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary-bg">
            <Sparkles size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">AI Feedback</h3>
            <p className="text-xs text-text-muted">
              Personalized analysis of your progress
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-border mt-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border rounded w-3/4" />
                  <div className="h-3 bg-border rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : feedback ? (
          <div className="space-y-6">
            {/* Overall */}
            <div className="p-4 bg-bg rounded-xl border border-border">
              <p className="text-sm font-medium text-text">
                {feedback.overall}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-success flex items-center gap-2 mb-3">
                  <TrendingUp size={16} /> Strengths
                </h4>
                <div className="space-y-2">
                  {feedback.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-warning flex items-center gap-2 mb-3">
                  <TrendingDown size={16} /> Areas to Improve
                </h4>
                <div className="space-y-2">
                  {feedback.improvements.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 bg-primary-bg/30 rounded-xl border border-primary/20">
              <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                <Sparkles size={16} /> Recommendation
              </h4>
              <p className="text-sm text-text-secondary">
                {feedback.recommendation}
              </p>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  sub,
  color,
  bg,
  alert,
}: {
  icon: typeof Target;
  title: string;
  value: number;
  sub: string;
  color: string;
  bg: string;
  alert?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bg}`}>
          <Icon size={18} className={color} />
        </div>
        {alert && (
          <span className="flex items-center gap-1 text-xs font-medium text-danger bg-danger-bg px-2 py-0.5 rounded-full">
            <AlertCircle size={12} />
            {alert}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-text">{value}</p>
      <p className="text-sm font-medium text-text mt-1">{title}</p>
      <p className="text-xs text-text-muted mt-1">{sub}</p>
    </motion.div>
  );
}
