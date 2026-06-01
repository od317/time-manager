"use client";

import { motion } from "framer-motion";
import { TimeEntry, Goal } from "@/types";
import { Clock, Target, History } from "lucide-react";
import { format } from "date-fns";

interface RecentActivityProps {
  timeEntries: TimeEntry[];
  goals: Goal[];
}

export function RecentActivity({ timeEntries, goals }: RecentActivityProps) {
  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  if (timeEntries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-bg">
            <History size={20} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text">Recent Activity</h3>
        </div>
        <div className="text-center py-8">
          <Clock
            size={32}
            className="text-text-muted mx-auto mb-3 opacity-50"
          />
          <p className="text-sm text-text-muted font-medium">
            No recent time entries
          </p>
          <p className="text-xs text-text-muted mt-1">
            Start tracking time to see your activity
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-info-bg">
          <History size={20} className="text-info" />
        </div>
        <h3 className="text-lg font-bold text-text">Recent Activity</h3>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {timeEntries.slice(0, 10).map((entry) => {
          const goal = entry.goalId
            ? goals.find((g) => g.id === entry.goalId)
            : null;
          return (
            <motion.div
              key={entry.id}
              variants={item}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-3.5 rounded-xl bg-bg border border-border hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <div className="p-1.5 rounded-lg bg-surface">
                <Clock size={16} className="text-text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">
                  {entry.note || "Time entry"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {goal && (
                    <span className="text-xs text-text-muted flex items-center gap-1.5 bg-surface px-2 py-0.5 rounded-full">
                      <Target size={10} />
                      {goal.title}
                    </span>
                  )}
                  <span className="text-xs text-text-muted">
                    {format(new Date(entry.startTime), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
              {entry.duration && (
                <span className="text-sm font-bold text-text flex-shrink-0 bg-surface px-3 py-1 rounded-lg">
                  {formatDuration(entry.duration)}
                </span>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
