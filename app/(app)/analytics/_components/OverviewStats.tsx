"use client";

import { motion } from "framer-motion";
import {
  Target,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  Repeat,
  Timer,
} from "lucide-react";

interface OverviewStatsProps {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  failedGoals: number;
  totalHabits: number;
  activeHabits: number;
  avgStreak: number;
  bestStreak: number;
  totalHours: number;
}

export function OverviewStats({
  totalGoals,
  completedGoals,
  activeGoals,
  failedGoals,
  totalHabits,
  activeHabits,
  avgStreak,
  bestStreak,
  totalHours,
}: OverviewStatsProps) {
  const totalSeconds = Math.round(totalHours * 3600);
  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  const stats = [
    {
      label: "Goals Completed",
      value: completedGoals,
      sub: `of ${totalGoals}`,
      icon: Trophy,
      color: "text-warning",
      bg: "bg-warning-bg",
      border: "border-warning/20",
    },
    {
      label: "Active Goals",
      value: activeGoals,
      sub: `${failedGoals} failed`,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary-bg",
      border: "border-primary/20",
    },
    {
      label: "Active Habits",
      value: activeHabits,
      sub: `of ${totalHabits} total`,
      icon: Repeat,
      color: "text-secondary",
      bg: "bg-secondary-bg",
      border: "border-secondary/20",
    },
    {
      label: "Avg Streak",
      value: avgStreak,
      sub: `best: ${bestStreak}`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      label: "Time Tracked",
      value: formatDuration(totalSeconds),
      sub: "this month",
      icon: Clock,
      color: "text-success",
      bg: "bg-success-bg",
      border: "border-success/20",
    },
    {
      label: "Success Rate",
      value:
        totalGoals > 0
          ? `${Math.round((completedGoals / totalGoals) * 100)}%`
          : "0%",
      sub: "goal completion",
      icon: CheckCircle2,
      color: "text-info",
      bg: "bg-info-bg",
      border: "border-info/20",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
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
              className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <Icon size={20} className={stat.color} />
            </div>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="text-xl font-bold text-text"
            >
              {stat.value}
            </motion.p>
            <p className="text-xs font-semibold text-text-muted mt-1">
              {stat.label}
            </p>
            <p className="text-[10px] text-text-muted">{stat.sub}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
