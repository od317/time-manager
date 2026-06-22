// components/goals/TimeSpent.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { goalService } from "@/lib/services";
import { useTimerStore } from "@/store/timerStore";

interface TimeSpentProps {
  goalId: string;
  initialTotalTimeSpent?: number;
}

export function TimeSpent({ goalId, initialTotalTimeSpent }: TimeSpentProps) {
  const [totalTimeSpent, setTotalTimeSpent] = useState<number | null>(
    initialTotalTimeSpent ?? null,
  );
  const [loading, setLoading] = useState(!initialTotalTimeSpent);
  const { lastStoppedId } = useTimerStore();

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  const fetchTimeSpent = async () => {
    try {
      setLoading(true);
      const data = await goalService.getTimeSpent(goalId);
      setTotalTimeSpent(data.totalTimeSpent);
    } catch (error) {
      console.error("Failed to fetch time spent:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialTotalTimeSpent) {
      fetchTimeSpent();
    }
  }, [goalId, initialTotalTimeSpent]);

  useEffect(() => {
    if (lastStoppedId) {
      fetchTimeSpent();
    }
  }, [lastStoppedId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchTimeSpent();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <motion.div
        variants={item}
        className="bg-surface rounded-2xl border-2 border-border p-5 animate-pulse"
      >
        <div className="w-10 h-10 rounded-xl bg-border mb-4" />
        <div className="h-7 w-20 bg-border rounded mb-2" />
        <div className="h-3 w-16 bg-border rounded" />
        <div className="h-2 w-12 bg-border rounded mt-1" />
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-surface rounded-2xl border-2 border-border p-5 hover:shadow-lg hover:border-success/20 transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-success-bg border border-success/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Timer size={20} className="text-success" />
      </div>
      <motion.p
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="text-xl font-bold text-text mb-1"
      >
        {totalTimeSpent !== null ? formatDuration(totalTimeSpent) : "0s"}
      </motion.p>
      <p className="text-xs font-semibold text-text-muted">Time Spent</p>
      <p className="text-[10px] text-text-muted mt-0.5">Tracked time</p>
    </motion.div>
  );
}
