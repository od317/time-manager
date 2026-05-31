"use client";

import { useState, useEffect } from "react";
import { aiService } from "@/lib/services/aiService";
import { Goal, Habit, TimeEntry } from "@/types";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Heart,
  RefreshCw,
} from "lucide-react";

interface AIInsightsProps {
  goals: Goal[];
  habits: Habit[];
  timeEntries: TimeEntry[];
}

interface Insight {
  title: string;
  content: string;
  type: "summary" | "suggestion" | "encouragement" | "pattern";
}

export function AIInsights({ goals, habits, timeEntries }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInsights = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await aiService.generateInsights({
        goals,
        habits,
        timeEntries,
        period: "month",
      });
      if (response.insights?.length > 0) {
        setInsights(response.insights);
      }
    } catch (err) {
      console.error("AI Insights error:", err);
      setError("Could not generate insights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsights();
    }, 500); // Small delay to avoid strict mode double-mount

    return () => clearTimeout(timer);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "summary":
        return TrendingUp;
      case "suggestion":
        return Lightbulb;
      case "encouragement":
        return Heart;
      case "pattern":
        return TrendingUp;
      default:
        return Sparkles;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "summary":
        return "text-primary bg-primary-bg";
      case "suggestion":
        return "text-warning bg-warning-bg";
      case "encouragement":
        return "text-success bg-success-bg";
      case "pattern":
        return "text-purple-500 bg-purple-100";
      default:
        return "text-primary bg-primary-bg";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text">AI Insights</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse flex items-start gap-3 p-3 rounded-lg bg-bg"
            >
              <div className="w-8 h-8 rounded-lg bg-border" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-border rounded w-1/3" />
                <div className="h-3 bg-border rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || insights.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-text">AI Insights</h3>
          </div>
          <button
            onClick={fetchInsights}
            className="p-2 text-text-muted hover:text-text transition-all rounded-lg hover:bg-border-light"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <p className="text-sm text-text-muted text-center py-4">
          {error || "Not enough data for insights yet. Keep tracking!"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text">AI Insights</h3>
        </div>
        <button
          onClick={fetchInsights}
          className="p-2 text-text-muted hover:text-text transition-all rounded-lg hover:bg-border-light"
          title="Refresh insights"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.type);
          const colorClass = getColor(insight.type);
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-bg"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
              >
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-text">{insight.title}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {insight.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
