"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { aiService } from "@/lib/services/aiService";
import { Goal, Habit, TimeEntry } from "@/types";
import {
  Sparkles,
  Lightbulb,
  TrendingUp,
  Heart,
  RefreshCw,
  Brain,
  Zap,
  Target,
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
    }, 500);

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
        return Brain;
      default:
        return Sparkles;
    }
  };

  const getConfig = (type: string) => {
    switch (type) {
      case "summary":
        return {
          color: "text-primary",
          bg: "bg-primary-bg",
          border: "border-primary/20",
          iconBg: "bg-primary/10",
        };
      case "suggestion":
        return {
          color: "text-warning",
          bg: "bg-warning-bg",
          border: "border-warning/20",
          iconBg: "bg-warning/10",
        };
      case "encouragement":
        return {
          color: "text-success",
          bg: "bg-success-bg",
          border: "border-success/20",
          iconBg: "bg-success/10",
        };
      case "pattern":
        return {
          color: "text-secondary",
          bg: "bg-secondary-bg",
          border: "border-secondary/20",
          iconBg: "bg-secondary/10",
        };
      default:
        return {
          color: "text-primary",
          bg: "bg-primary-bg",
          border: "border-primary/20",
          iconBg: "bg-primary/10",
        };
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.45 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-bg to-secondary-bg">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">AI Insights</h3>
              <p className="text-xs text-text-muted">Powered by AI analysis</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onClick={fetchInsights}
            className="p-2.5 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-all"
            title="Refresh insights"
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-start gap-4 p-4 rounded-xl bg-bg"
                >
                  <div className="w-10 h-10 rounded-xl bg-border" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-border rounded w-1/3" />
                    <div className="h-3 bg-border rounded w-full" />
                    <div className="h-3 bg-border rounded w-2/3" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : error || insights.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-10"
            >
              <Brain
                size={40}
                className="text-text-muted mx-auto mb-4 opacity-50"
              />
              <p className="text-sm text-text-muted font-medium">
                {error || "Not enough data for insights yet"}
              </p>
              <p className="text-xs text-text-muted mt-2">
                Keep tracking your goals and habits to unlock AI-powered
                insights
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchInsights}
                className="mt-4 px-4 py-2 bg-primary-bg text-primary rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-all"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="insights"
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {insights.map((insight, index) => {
                const Icon = getIcon(insight.type);
                const config = getConfig(insight.type);
                return (
                  <motion.div
                    key={index}
                    variants={item}
                    whileHover={{ x: 4 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 ${config.bg} ${config.border} transition-all hover:shadow-md`}
                  >
                    <div className={`p-2.5 rounded-xl ${config.iconBg}`}>
                      <Icon size={18} className={config.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${config.color} mb-1`}>
                        {insight.title}
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {insight.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
