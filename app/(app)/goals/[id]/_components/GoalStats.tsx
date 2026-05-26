"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

  // Re-fetch when timer stops
  useEffect(() => {
    if (lastStoppedId) {
      fetchGoal();
      clearLastStopped();
      router.refresh();
    }
  }, [lastStoppedId, fetchGoal, clearLastStopped, router]);

  // Re-fetch when page becomes visible
  useEffect(() => {
    const handleFocus = () => {
      fetchGoal();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchGoal]);

  const tasks = goal.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalTimeSpent = (goal.timeEntries || []).reduce(
    (sum, entry) => sum + (entry.duration || 0),
    0,
  );

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
      icon: ListTodo,
      color: "text-primary",
      bg: "bg-primary-bg",
    },
    {
      label: "Time Spent",
      value: formatDuration(totalTimeSpent),
      icon: Timer,
      color: "text-success",
      bg: "bg-success-bg",
    },
    {
      label: "Completion",
      value:
        tasks.length > 0
          ? `${Math.round((completedTasks / tasks.length) * 100)}%`
          : "N/A",
      icon: CheckCircle2,
      color: "text-warning",
      bg: "bg-warning-bg",
    },
    {
      label: "Sub-goals",
      value: `${goal.children?.filter((c) => c.status === "COMPLETED").length || 0}/${goal.children?.length || 0}`,
      icon: Target,
      color: "text-info",
      bg: "bg-info-bg",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-surface rounded-xl border border-border p-4"
          >
            <div
              className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
            >
              <Icon size={20} className={stat.color} />
            </div>
            <p className="text-lg font-bold text-text">{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
