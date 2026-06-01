"use client";

import { motion } from "framer-motion";
import {
  Target,
  Repeat,
  Calendar,
  TrendingUp,
  Lightbulb,
  Sparkles,
} from "lucide-react";

interface ContextPanelProps {
  activeGoals: number;
  activeHabits: number;
  upcomingDeadlines: number;
  activeTab: string;
}

export function ContextPanel({
  activeGoals,
  activeHabits,
  upcomingDeadlines,
  activeTab,
}: ContextPanelProps) {
  const tips: Record<string, string> = {
    goal: "Break big goals into smaller sub-goals. Each sub-goal should have a clear deadline and measurable outcome.",
    habit:
      'Start small! A habit of "read 1 page" is easier to maintain than "read 1 hour". Consistency beats intensity.',
    task: "Tasks work best when they have an estimated time. This helps with planning your day and tracking progress.",
  };

  const stats = [
    {
      label: "Active Goals",
      value: activeGoals,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary-bg",
      border: "border-primary/20",
    },
    {
      label: "Active Habits",
      value: activeHabits,
      icon: Repeat,
      color: "text-secondary",
      bg: "bg-secondary-bg",
      border: "border-secondary/20",
    },
    {
      label: "Deadlines",
      value: upcomingDeadlines,
      icon: Calendar,
      color: "text-warning",
      bg: "bg-warning-bg",
      border: "border-warning/20",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="p-6 space-y-6">
        <h3 className="text-lg font-bold text-text flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Overview
        </h3>

        {/* Stats */}
        <div className="space-y-2">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${stat.bg} border ${stat.border}`}
                >
                  <stat.icon size={16} className={stat.color} />
                </div>
                <span className="text-sm font-semibold text-text-secondary">
                  {stat.label}
                </span>
              </div>
              <span className="text-lg font-bold text-text">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t-2 border-border" />

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-warning-bg">
              <Lightbulb size={16} className="text-warning" />
            </div>
            <span className="text-sm font-bold text-text">Pro Tip</span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed pl-2 border-l-2 border-warning/30">
            {tips[activeTab] || tips.goal}
          </p>
        </motion.div>

        {/* Consistency card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-primary-bg to-secondary-bg rounded-xl p-5 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-primary" />
            <span className="text-sm font-bold text-primary">
              Consistency is key
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Users who track daily are 3x more likely to achieve their goals.
            Start small and build momentum!
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
