"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Habit } from "@/types";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
} from "lucide-react";

interface HabitLogHistoryProps {
  habit: Habit;
  todayStr: string;
}

function getYesterdayStr(): string {
  const now = Date.now();
  return new Date(now - 86400000).toLocaleDateString("en-CA");
}

export function HabitLogHistory({ habit, todayStr }: HabitLogHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [yesterdayStr] = useState(() => getYesterdayStr());

  const logs = habit.logs || [];
  const recentLogs = isExpanded ? logs : logs.slice(0, 5);
  const hasMore = logs.length > 5;

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

  if (logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-bg">
            <History size={18} className="text-text-muted" />
          </div>
          <h3 className="text-lg font-bold text-text">Recent Activity</h3>
        </div>
        <div className="text-center py-10">
          <Clock
            size={32}
            className="text-text-muted mx-auto mb-3 opacity-50"
          />
          <p className="text-sm text-text-muted font-medium">No activity yet</p>
          <p className="text-xs text-text-muted mt-1">
            Start completing this habit to see your history
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-info-bg">
            <History size={18} className="text-info" />
          </div>
          <h3 className="text-lg font-bold text-text">Recent Activity</h3>
          <span className="text-xs font-bold text-text-muted bg-bg px-2.5 py-1 rounded-full">
            {logs.length}
          </span>
        </div>
      </div>

      <div className="px-6 pb-2">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {recentLogs.map((log, index) => {
              const logDateStr = new Date(log.date).toLocaleDateString("en-CA");

              let dateLabel: string;
              if (logDateStr === todayStr) dateLabel = "Today";
              else if (logDateStr === yesterdayStr) dateLabel = "Yesterday";
              else
                dateLabel = new Date(log.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

              const getStatusConfig = () => {
                switch (log.status) {
                  case "COMPLETED":
                    return {
                      icon: CheckCircle2,
                      color: "text-success",
                      bg: "bg-success-bg/30",
                      border: "border-success/20",
                      label: "Completed",
                    };
                  case "SKIPPED":
                    return {
                      icon: Clock,
                      color: "text-warning",
                      bg: "bg-warning-bg/30",
                      border: "border-warning/20",
                      label: "Skipped",
                    };
                  default:
                    return {
                      icon: XCircle,
                      color: "text-danger",
                      bg: "bg-danger-bg/30",
                      border: "border-danger/20",
                      label: "Missed",
                    };
                }
              };

              const config = getStatusConfig();
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={log.id || index}
                  variants={item}
                  layout
                  className={`flex items-center gap-4 p-3.5 rounded-xl border-2 ${config.bg} ${config.border} transition-all hover:shadow-sm`}
                >
                  <div className={`p-1.5 rounded-lg ${config.bg}`}>
                    <StatusIcon size={16} className={config.color} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${config.color}`}>
                        {config.label}
                      </span>
                      {log.value && (
                        <span className="text-xs font-medium text-text-muted bg-bg px-2 py-0.5 rounded-full">
                          {log.value} {log.unit || ""}
                        </span>
                      )}
                    </div>
                    {log.note && (
                      <p className="text-xs text-text-secondary mt-1 truncate">
                        {log.note}
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-text-muted flex-shrink-0 bg-bg px-2 py-1 rounded-full">
                    {dateLabel}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {hasMore && (
        <motion.button
          whileHover={{ backgroundColor: "var(--color-bg)" }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 mt-2 p-4 text-sm font-semibold text-text-muted hover:text-text transition-all border-t border-border"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} />
          </motion.div>
          {isExpanded ? "Show less" : `Show all (${logs.length})`}
        </motion.button>
      )}
    </motion.div>
  );
}
