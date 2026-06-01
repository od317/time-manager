"use client";

import { Goal } from "@/types";
import { motion } from "framer-motion";
import {
  Target,
  Repeat,
  CheckSquare,
  AlertTriangle,
  Calendar,
} from "lucide-react";

interface TodayOverviewProps {
  goals: Goal[];
  habitsDue: number;
  tasksCount: number;
}

export function TodayOverview({
  goals,
  habitsDue,
  tasksCount,
}: TodayOverviewProps) {
  const activeGoals = goals.filter((g) => g.status === "ACTIVE").length;
  const urgentGoals = goals.filter(
    (g) => g.priority === "URGENT" && g.status === "ACTIVE",
  ).length;

  const stats = [
    {
      label: "Goals",
      value: activeGoals,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary-bg",
    },
    {
      label: "Habits",
      value: habitsDue,
      icon: Repeat,
      color: "text-secondary",
      bg: "bg-secondary-bg",
    },
    {
      label: "Tasks",
      value: tasksCount,
      icon: CheckSquare,
      color: "text-success",
      bg: "bg-success-bg",
    },
    ...(urgentGoals > 0
      ? [
          {
            label: "Urgent",
            value: urgentGoals,
            icon: AlertTriangle,
            color: "text-danger",
            bg: "bg-danger-bg",
          },
        ]
      : []),
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
      className="flex items-center gap-2 px-5 py-3 bg-surface rounded-2xl border border-border shadow-sm flex-wrap"
    >
      <div className="flex items-center gap-2 mr-3">
        <div className="p-1.5 rounded-lg bg-primary-bg">
          <Calendar size={14} className="text-primary" />
        </div>
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Today
        </span>
      </div>

      <div className="h-6 w-px bg-border hidden sm:block" />

      <div className="flex items-center gap-1 sm:gap-4 flex-wrap">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={item}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-bg transition-colors"
            >
              <div className={`p-1 rounded-md ${stat.bg}`}>
                <Icon size={14} className={stat.color} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-text">
                  {stat.value}
                </span>
                <span className="text-[10px] text-text-muted hidden sm:inline font-medium">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
