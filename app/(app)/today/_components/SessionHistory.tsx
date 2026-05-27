"use client";

import { useState, useRef, useEffect } from "react";
import { useTimerStore } from "@/store/timerStore";
import { History, Clock, Play } from "lucide-react";

export function SessionHistory() {
  const { sessionHistory, runningTimer } = useTimerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (runningTimer?.status === "RUNNING") {
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [runningTimer?.status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getEntryDuration = (entry: {
    startTime: number;
    endTime: number | null;
  }): number => {
    const end = entry.endTime ?? now;
    return Math.max(0, Math.floor((end - entry.startTime) / 1000));
  };

  // Group entries by taskId and sum durations
  // Replace the useMemo block (lines 42-73) with a regular function:

  const groupHistory = () => {
    const grouped = new Map<
      string,
      {
        taskId: string;
        taskTitle: string;
        color: string;
        totalDuration: number;
        isRunning: boolean;
      }
    >();

    sessionHistory.forEach((entry) => {
      const existing = grouped.get(entry.taskId);
      const duration = getEntryDuration(entry);

      if (existing) {
        existing.totalDuration += duration;
        existing.isRunning = existing.isRunning || entry.endTime === null;
      } else {
        grouped.set(entry.taskId, {
          taskId: entry.taskId,
          taskTitle: entry.taskTitle,
          color: entry.color,
          totalDuration: duration,
          isRunning: entry.endTime === null,
        });
      }
    });

    return Array.from(grouped.values());
  };

  const groupedHistory = groupHistory();

  const totalDuration = groupedHistory.reduce(
    (sum, entry) => sum + entry.totalDuration,
    0,
  );
  const hasHistory = groupedHistory.length > 0;

  const formatDuration = (seconds: number): string => {
    if (seconds <= 0) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => hasHistory && setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 text-xs transition-all rounded-md ${
          runningTimer?.status === "RUNNING"
            ? "text-success bg-success-bg hover:bg-success-bg/80"
            : hasHistory
              ? "text-primary bg-primary-bg hover:bg-primary-bg/80 cursor-pointer"
              : "text-text-muted bg-bg cursor-default"
        }`}
        title={hasHistory ? "Session history" : "Start timer to track history"}
      >
        <History size={12} />
        {runningTimer?.status === "RUNNING" && (
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        )}
        <span>{groupedHistory.length}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-surface rounded-xl border border-border shadow-lg z-50 animate-slide-down p-3">
          <h4 className="text-sm font-semibold text-text mb-3">
            Session History
          </h4>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {groupedHistory.map((entry) => (
              <div
                key={entry.taskId}
                className={`flex items-start gap-3 p-2 rounded-lg border ${
                  entry.isRunning
                    ? "bg-success-bg/20 border-success/20"
                    : "bg-bg border-border"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                    entry.isRunning ? "animate-pulse" : ""
                  }`}
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {entry.taskTitle}
                  </p>
                  {entry.isRunning && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <Play size={10} />
                      In progress
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs font-medium flex-shrink-0 flex items-center gap-1 ${
                    entry.isRunning ? "text-success" : "text-text-secondary"
                  }`}
                >
                  <Clock size={10} />
                  {formatDuration(entry.totalDuration)}
                </span>
              </div>
            ))}
          </div>

          {groupedHistory.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium text-text">Total</span>
              <span className="text-xs font-medium text-text">
                {formatDuration(totalDuration)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
