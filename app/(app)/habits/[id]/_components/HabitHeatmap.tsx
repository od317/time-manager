"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { habitService } from "@/lib/services";
import { HabitHeatmapEntry } from "@/types";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface HabitHeatmapProps {
  habitId: string;
}

export function HabitHeatmap({ habitId }: HabitHeatmapProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<HabitHeatmapEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const heatmapData = await habitService.getHeatmap(habitId, year);
        setData(Array.isArray(heatmapData) ? heatmapData : []);
      } catch {
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [habitId, year]);

  const getColor = (entry: HabitHeatmapEntry | undefined): string => {
    if (!entry || entry.status !== "COMPLETED") return "bg-border/50";
    if (entry.value && entry.value >= 2) return "bg-success";
    return "bg-success/60";
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  const days: (Date | null)[] = [];

  const firstDay = startDate.getDay();
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const totalCompletions = data.filter((e) => e.status === "COMPLETED").length;
  const daysInYear = 365 + (year % 4 === 0 ? 1 : 0);
  const completionRate = Math.round((totalCompletions / daysInYear) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-info-bg">
            <Calendar size={18} className="text-info" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text">Activity Heatmap</h3>
            <p className="text-xs text-text-muted">
              {totalCompletions} completions · {completionRate}% of year
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setYear(year - 1)}
            className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
          >
            <ChevronLeft size={16} />
          </motion.button>
          <span className="text-sm font-bold text-text min-w-[4rem] text-center">
            {year}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setYear(year + 1)}
            className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
          >
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto"
          >
            <div className="inline-flex gap-3 min-w-fit">
              {/* Grid */}
              <div>
                {/* Month labels - aligned with first day of each month */}
                <div className="flex gap-0.5 mb-1">
                  {weeks.map((week, wi) => {
                    // Find first day of a month in this week
                    const firstDayOfMonth = week.find(
                      (day) => day && day.getDate() === 1,
                    );
                    const monthLabel = firstDayOfMonth
                      ? months[firstDayOfMonth.getMonth()]
                      : "";

                    return (
                      <div
                        key={wi}
                        className="w-3.5 text-[9px] font-semibold text-text-muted"
                      >
                        {monthLabel}
                      </div>
                    );
                  })}
                </div>

                {/* Day labels */}
                <div className="flex gap-0.5 mb-1.5">
                  {["", "M", "", "W", "", "F", ""].map((day, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3 text-[9px] font-semibold text-text-muted text-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Weeks */}
                <div className="flex gap-0.5">
                  {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-0.5">
                      {week.map((day, di) => {
                        if (!day)
                          return <div key={di} className="w-3.5 h-3.5" />;
                        const dateStr = formatDate(day);
                        const entry = data.find((e) => {
                          const entryDate = new Date(e.date).toLocaleDateString(
                            "en-CA",
                          );
                          return entryDate === dateStr;
                        });
                        const isCompleted = entry?.status === "COMPLETED";
                        return (
                          <motion.div
                            key={di}
                            whileHover={{ scale: 1.5 }}
                            className={`w-3.5 h-3.5 rounded-sm cursor-pointer transition-colors ${getColor(
                              entry,
                            )} ${isCompleted ? "ring-1 ring-success/20" : ""}`}
                            title={`${dateStr}${isCompleted ? " ✓" : ""}${entry?.value ? ` (${entry.value})` : ""}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-6 text-xs font-medium text-text-muted">
              <span>Less</span>
              {[
                "bg-border/50",
                "bg-success/40",
                "bg-success/70",
                "bg-success",
              ].map((color, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-sm ${color}`} />
              ))}
              <span>More</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-6 text-xs font-medium text-text-muted">
              <span>Less</span>
              {[
                "bg-border/50",
                "bg-success/40",
                "bg-success/70",
                "bg-success",
              ].map((color, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-sm ${color}`} />
              ))}
              <span>More</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
