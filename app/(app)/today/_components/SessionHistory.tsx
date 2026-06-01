"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { History, Clock, Play } from "lucide-react";

export function SessionHistory() {
  const { sessionHistory, runningTimer } = useTimerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

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
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update position when opening
  const handleToggle = () => {
    if (!hasHistory) return;

    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  const getEntryDuration = (entry: {
    startTime: number;
    endTime: number | null;
  }): number => {
    const end = entry.endTime ?? now;
    return Math.max(0, Math.floor((end - entry.startTime) / 1000));
  };

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
    <>
      <motion.button
        ref={buttonRef}
        whileHover={hasHistory ? { scale: 1.05 } : {}}
        whileTap={hasHistory ? { scale: 0.95 } : {}}
        onClick={handleToggle}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all rounded-xl relative ${
          runningTimer?.status === "RUNNING"
            ? "text-success bg-success-bg ring-1 ring-success/20"
            : hasHistory
              ? "text-primary bg-primary-bg ring-1 ring-primary/20 cursor-pointer"
              : "text-text-muted bg-bg cursor-default"
        }`}
        title={hasHistory ? "Session history" : "Start timer to track history"}
      >
        <History size={12} />
        {runningTimer?.status === "RUNNING" && (
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        )}
        <span>{groupedHistory.length}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown - Fixed positioning to avoid overflow issues */}
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                right: dropdownPosition.right,
                maxHeight: "calc(100vh - 120px)",
              }}
              className="w-80 bg-surface rounded-2xl border border-border shadow-2xl z-50 overflow-hidden"
            >
              <div
                className="p-4 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                <h4 className="text-sm font-bold text-text mb-3 sticky top-0 bg-surface pb-2">
                  Session History
                </h4>

                <div className="space-y-2">
                  {groupedHistory.map((entry) => (
                    <div
                      key={entry.taskId}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 ${
                        entry.isRunning
                          ? "bg-success-bg/30 border-success/20"
                          : "bg-bg border-border"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                          entry.isRunning ? "animate-pulse" : ""
                        }`}
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">
                          {entry.taskTitle}
                        </p>
                        {entry.isRunning && (
                          <p className="text-xs text-success flex items-center gap-1 font-medium">
                            <Play size={10} className="fill-current" />
                            In progress
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold flex-shrink-0 flex items-center gap-1 ${
                          entry.isRunning
                            ? "text-success"
                            : "text-text-secondary"
                        }`}
                      >
                        <Clock size={12} />
                        {formatDuration(entry.totalDuration)}
                      </span>
                    </div>
                  ))}
                </div>

                {groupedHistory.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 pt-3 border-t-2 border-border flex items-center justify-between sticky bottom-0 bg-surface"
                  >
                    <span className="text-xs font-bold text-text">Total</span>
                    <span className="text-sm font-bold text-text">
                      {formatDuration(totalDuration)}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
