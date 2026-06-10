"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Goal, Habit, Task } from "@/types";
import { aiService } from "@/lib/services/aiService";
import {
  Sparkles,
  Target,
  CheckSquare,
  Repeat,
  AlertTriangle,
  Clock,
  RefreshCw,
  Lightbulb,
  Zap,
  WifiOff,
} from "lucide-react";

interface SummaryFeedbackProps {
  goals: Goal[];
  habits: Habit[];
  tasks: Task[];
}

interface AIFeedback {
  overall?: string;
  suggestions?: string[];
  warnings?: string[];
  focusArea?: string;
  motivation?: string;
  aiGenerated?: boolean;
}

export function SummaryFeedback({
  goals,
  habits,
  tasks,
}: SummaryFeedbackProps) {
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAiFallback, setIsAiFallback] = useState(false);

  // Calculate summary stats
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");
  const overdueGoals = goals.filter((g) => g.status === "OVERDUE");
  const pausedGoals = goals.filter((g) => g.status === "PAUSED");
  const completedGoals = goals.filter((g) => g.status === "COMPLETED");

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

  const fetchFeedback = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsAiFallback(false);
    setFeedback(null);

    try {
      const response = await aiService.generateInsights();
      if (response) {
        setFeedback(response);
        if (response.aiGenerated === false) {
          setIsAiFallback(true);
        }
      }
    } catch (err: any) {
      setError(
        err?.code === "NETWORK_ERROR"
          ? "Unable to connect. Check your internet connection."
          : "Failed to generate insights. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeedback();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchFeedback]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Target}
          title="Active Goals"
          value={activeGoals.length}
          sub={`${completedGoals.length} completed, ${overdueGoals.length} overdue, ${pausedGoals.length} paused`}
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
          color="text-secondary"
          bg="bg-secondary-bg"
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
        className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-bg to-secondary-bg">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">AI Insights</h3>
              <p className="text-xs text-text-muted">
                {isLoading
                  ? "Analyzing your progress..."
                  : isAiFallback
                    ? "Generated locally (AI unavailable)"
                    : error
                      ? "Failed to load insights"
                      : "Personalized analysis of your progress"}
              </p>
            </div>
          </div>

          {/* Retry button - only on error */}
          {error && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchFeedback}
              disabled={isLoading}
              className="p-2.5 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-all disabled:opacity-50"
              title="Retry"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
            </motion.button>
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="p-4 bg-bg rounded-xl border border-border space-y-2.5">
                <div className="h-4 bg-border rounded-md w-full" />
                <div className="h-4 bg-border rounded-md w-5/6" />
                <div className="h-4 bg-border rounded-md w-2/3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-border rounded-md" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-border rounded-md w-full" />
                        <div className="h-4 bg-border rounded-md w-4/5" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-border rounded-md" />
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 bg-border rounded-md w-full" />
                        <div className="h-4 bg-border rounded-md w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-bg rounded-xl border border-border space-y-2.5">
                  <div className="h-4 w-24 bg-border rounded-md" />
                  <div className="h-4 bg-border rounded-md w-full" />
                  <div className="h-4 bg-border rounded-md w-3/4" />
                </div>
                <div className="p-4 bg-bg rounded-xl border border-border space-y-2.5">
                  <div className="h-4 w-20 bg-border rounded-md" />
                  <div className="h-4 bg-border rounded-md w-full" />
                  <div className="h-4 bg-border rounded-md w-2/3" />
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-10"
            >
              <div className="w-14 h-14 rounded-2xl bg-danger-bg border-2 border-danger/20 flex items-center justify-center mx-auto mb-4">
                <WifiOff size={28} className="text-danger" />
              </div>
              <p className="text-sm font-medium text-text mb-3">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchFeedback}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <RefreshCw size={16} />
                Retry
              </motion.button>
            </motion.div>
          )}

          {/* Feedback Content */}
          {!isLoading && !error && feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* AI Fallback Banner */}
              {isAiFallback && (
                <div className="flex items-center gap-3 p-3 bg-warning-bg/30 border border-warning/20 rounded-xl">
                  <AlertTriangle
                    size={14}
                    className="text-warning flex-shrink-0"
                  />
                  <p className="text-xs text-warning font-medium flex-1">
                    AI service unavailable. Showing local insights.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchFeedback}
                    className="text-xs font-bold text-warning hover:underline flex-shrink-0"
                  >
                    Retry AI
                  </motion.button>
                </div>
              )}

              {/* Overall */}
              {feedback.overall && (
                <div className="p-4 bg-bg rounded-xl border border-border">
                  <p className="text-sm font-medium text-text leading-relaxed">
                    {feedback.overall}
                  </p>
                </div>
              )}

              {/* Suggestions & Warnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedback.suggestions && feedback.suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-success flex items-center gap-2 mb-3">
                      <div className="p-1 rounded-md bg-success-bg">
                        <Lightbulb size={14} className="text-success" />
                      </div>
                      Suggestions
                    </h4>
                    <div className="space-y-2">
                      {feedback.suggestions.map((s, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {feedback.warnings && feedback.warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-warning flex items-center gap-2 mb-3">
                      <div className="p-1 rounded-md bg-warning-bg">
                        <AlertTriangle size={14} className="text-warning" />
                      </div>
                      Warnings
                    </h4>
                    <div className="space-y-2">
                      {feedback.warnings.map((w, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 text-sm text-text-secondary leading-relaxed"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Focus & Motivation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedback.focusArea && (
                  <div className="p-4 bg-primary-bg/30 rounded-xl border border-primary/20">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-2 mb-2">
                      <div className="p-1 rounded-md bg-primary/10">
                        <Zap size={14} className="text-primary" />
                      </div>
                      Today&apos;s Focus
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feedback.focusArea}
                    </p>
                  </div>
                )}

                {feedback.motivation && (
                  <div className="p-4 bg-success-bg/20 rounded-xl border border-success/20">
                    <h4 className="text-sm font-bold text-success flex items-center gap-2 mb-2">
                      <div className="p-1 rounded-md bg-success/10">
                        <Sparkles size={14} className="text-success" />
                      </div>
                      Motivation
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feedback.motivation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
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
      whileHover={{ y: -2, scale: 1.02 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-5 hover:shadow-lg hover:border-primary/20 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl ${bg}`}>
          <Icon size={18} className={color} />
        </div>
        {alert && (
          <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning-bg px-2 py-0.5 rounded-full border border-warning/20">
            <AlertTriangle size={12} />
            {alert}
          </span>
        )}
      </div>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="text-3xl font-bold text-text"
      >
        {value}
      </motion.p>
      <p className="text-sm font-medium text-text mt-1">{title}</p>
      <p className="text-xs text-text-muted mt-1">{sub}</p>
    </motion.div>
  );
}
