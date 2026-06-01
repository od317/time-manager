"use client";

import { motion } from "framer-motion";
import { Habit } from "@/types";
import { Flame, Trophy, CheckCircle2, TrendingUp } from "lucide-react";

interface HabitStatsProps {
  habit: Habit;
  todayStr: string;
}

export function HabitStats({ habit }: HabitStatsProps) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const logsThisMonth = (habit.logs || []).filter((log) => {
    if (log.status !== "COMPLETED") return false;
    const logDate = new Date(log.date);
    return logDate >= thirtyDaysAgo;
  }).length;

  let expectedThisMonth = 0;
  if (habit.frequencyType === "DAILY") {
    expectedThisMonth = 30;
  } else if (habit.frequencyType === "WEEKLY") {
    expectedThisMonth = Math.round((30 / 7) * habit.frequencyDays.length);
  }

  const monthlyRate =
    expectedThisMonth > 0
      ? Math.round((logsThisMonth / expectedThisMonth) * 100)
      : 0;

  const stats = [
    {
      label: "Current Streak",
      value: habit.currentStreak,
      unit: "days",
      icon: Flame,
      color: "text-warning",
      bg: "bg-warning-bg",
      borderColor: "border-warning/20",
    },
    {
      label: "Longest Streak",
      value: habit.longestStreak,
      unit: "days",
      icon: Trophy,
      color: "text-primary",
      bg: "bg-primary-bg",
      borderColor: "border-primary/20",
    },
    {
      label: "Total Done",
      value: habit.totalCompletions,
      unit: "times",
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success-bg",
      borderColor: "border-success/20",
    },
    {
      label: "This Month",
      value: monthlyRate,
      unit: "%",
      icon: TrendingUp,
      color: "text-info",
      bg: "bg-info-bg",
      borderColor: "border-info/20",
    },
  ];

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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            variants={item}
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="bg-surface rounded-2xl border-2 border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all group"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.borderColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <Icon size={20} className={stat.color} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-text"
              >
                {stat.value}
              </motion.p>
              <p className="text-sm font-medium text-text-muted">{stat.unit}</p>
            </div>
            <p className="text-xs font-semibold text-text-muted mt-2">
              {stat.label}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
