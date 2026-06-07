"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Goal } from "@/types";
import { goalService } from "@/lib/services";
import { useTimerStore } from "@/store/timerStore";
import { CheckCircle2, Clock, ListTodo, Timer, Target } from "lucide-react";

interface GoalStatsProps {
  goal: Goal;
}

export function GoalStats({ goal: initialGoal }: GoalStatsProps) {
  const [goal, setGoal] = useState(initialGoal);
  const { lastStoppedId, clearLastStopped } = useTimerStore();
  const router = useRouter();

  const fetchGoal = useCallback(async () => {
    try {
      const updated = await goalService.getById(goal.id);
      setGoal(updated);
    } catch {
      // Handle error silently
    }
  }, [goal.id]);

  useEffect(() => {
    if (lastStoppedId) {
      fetchGoal();
      clearLastStopped();
      router.refresh();
    }
  }, [lastStoppedId, fetchGoal, clearLastStopped, router]);

  useEffect(() => {
    const handleFocus = () => {
      fetchGoal();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchGoal]);

  const tasks = goal.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalTimeSpent = goal.totalTimeSpent || 0;

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const stats = [
    {
      label: "Tasks",
      value: `${completedTasks}/${tasks.length}`,
      subtext:
        tasks.length > 0
          ? `${Math.round((completedTasks / tasks.length) * 100)}% done`
          : "No tasks",
      icon: ListTodo,
      color: "text-primary",
      bg: "bg-primary-bg",
      border: "border-primary/20",
    },
    {
      label: "Time Spent",
      value: formatDuration(totalTimeSpent),
      subtext: "Tracked time",
      icon: Timer,
      color: "text-success",
      bg: "bg-success-bg",
      border: "border-success/20",
    },
    {
      label: "Completion",
      value:
        tasks.length > 0
          ? `${Math.round((completedTasks / tasks.length) * 100)}%`
          : "N/A",
      subtext: "Task completion rate",
      icon: CheckCircle2,
      color: "text-warning",
      bg: "bg-warning-bg",
      border: "border-warning/20",
    },
    {
      label: "Sub-goals",
      value: `${goal.children?.filter((c) => c.status === "COMPLETED").length || 0}/${goal.children?.length || 0}`,
      subtext: "Completed sub-goals",
      icon: Target,
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
              className={`w-10 h-10 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              <Icon size={20} className={stat.color} />
            </div>
            <motion.p
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="text-xl font-bold text-text mb-1"
            >
              {stat.value}
            </motion.p>
            <p className="text-xs font-semibold text-text-muted">
              {stat.label}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">{stat.subtext}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
