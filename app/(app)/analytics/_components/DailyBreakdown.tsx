"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Goal, Habit, TimeEntry } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  Repeat,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  startOfYear,
} from "date-fns";

interface DailyBreakdownProps {
  goals: Goal[];
  habits: Habit[];
  timeEntries: TimeEntry[];
}

type DateRange = "week" | "month" | "year";
type ComparisonMode = "none" | "previous";

export function DailyBreakdown({
  goals,
  habits,
  timeEntries,
}: DailyBreakdownProps) {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("none");

  const { start, end, previousStart, previousEnd } = useMemo(() => {
    let start: Date, end: Date, previousStart: Date, previousEnd: Date;

    switch (dateRange) {
      case "week":
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        previousStart = subWeeks(start, 1);
        previousEnd = subWeeks(end, 1);
        break;
      case "month":
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        previousStart = subMonths(start, 1);
        previousEnd = subMonths(end, 1);
        break;
      case "year":
        start = startOfYear(currentDate);
        end = new Date(currentDate.getFullYear(), 11, 31);
        previousStart = new Date(currentDate.getFullYear() - 1, 0, 1);
        previousEnd = new Date(currentDate.getFullYear() - 1, 11, 31);
        break;
    }

    return { start, end, previousStart, previousEnd };
  }, [dateRange, currentDate]);

  const days = eachDayOfInterval({ start, end });

  const previousPeriod = () => {
    switch (dateRange) {
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
        break;
    }
  };

  const nextPeriod = () => {
    const now = new Date();
    let canAdvance = false;
    switch (dateRange) {
      case "week":
        canAdvance = end < now;
        break;
      case "month":
        canAdvance = end < now;
        break;
      case "year":
        canAdvance = currentDate.getFullYear() < now.getFullYear();
        break;
    }
    if (!canAdvance) return;
    switch (dateRange) {
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "year":
        setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
        break;
    }
  };

  const getDataForDays = (dayInterval: Date[]) => {
    return dayInterval.map((day) => {
      const dayStr = day.toLocaleDateString("en-CA");

      const dayEntries = timeEntries.filter((entry) => {
        return (
          new Date(entry.startTime).toLocaleDateString("en-CA") === dayStr &&
          entry.status === "COMPLETED"
        );
      });
      const totalHours =
        Math.round(
          (dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0) / 3600) *
            10,
        ) / 10;

      const habitsCompleted = habits.filter((h) => {
        return h.logs?.some((log) => {
          if (log.status !== "COMPLETED") return false;
          return new Date(log.date).toLocaleDateString("en-CA") === dayStr;
        });
      }).length;

      // Find this line:
      const tasksCompleted = goals.reduce((sum, g) => {
        return (
          sum +
          (g.tasks || []).filter((t) => {
            if (t.status !== "COMPLETED" || !t.completedAt) return false;
            return (
              new Date(t.completedAt).toLocaleDateString("en-CA") === dayStr
            );
          }).length
        );
      }, 0);

      // Keep as-is (this filters by task status, not goal status - it's fine)

      return {
        day: format(day, dateRange === "year" ? "MMM" : "EEE d"),
        date: day,
        fullDate: format(day, "MMM d"),
        hours: totalHours,
        habits: habitsCompleted,
        tasks: tasksCompleted,
        isToday: isSameDay(day, new Date()),
      };
    });
  };

  const chartData = getDataForDays(days);
  const previousData =
    comparisonMode === "previous"
      ? getDataForDays(
          eachDayOfInterval({ start: previousStart, end: previousEnd }),
        )
      : [];

  const mergedData =
    comparisonMode === "previous"
      ? chartData.map((current, i) => ({
          ...current,
          prevHours: previousData[i]?.hours || 0,
          prevHabits: previousData[i]?.habits || 0,
          prevTasks: previousData[i]?.tasks || 0,
        }))
      : chartData;

  const getTitle = () => {
    switch (dateRange) {
      case "week":
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
      case "month":
        return format(start, "MMMM yyyy");
      case "year":
        return format(start, "yyyy");
    }
  };

  const isCurrent = end >= new Date();

  const stats = [
    {
      label: "Total Hours",
      value: `${Math.round(chartData.reduce((s, d) => s + d.hours, 0) * 10) / 10}h`,
      icon: Clock,
      color: "text-primary",
      bg: "bg-primary-bg",
    },
    {
      label: "Tasks Done",
      value: chartData.reduce((s, d) => s + d.tasks, 0),
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success-bg",
    },
    {
      label: "Habits Done",
      value: chartData.reduce((s, d) => s + d.habits, 0),
      icon: Repeat,
      color: "text-secondary",
      bg: "bg-secondary-bg",
    },
    {
      label: "Active Days",
      value: chartData.filter((d) => d.hours > 0 || d.tasks > 0 || d.habits > 0)
        .length,
      icon: Target,
      color: "text-warning",
      bg: "bg-warning-bg",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-6"
    >
      {/* Controls & Chart */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <Calendar size={20} className="text-primary" />
            </div>
            <h3 className="text-lg font-bold text-text">Daily Breakdown</h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Range selector */}
            <div className="flex gap-1 p-1 bg-bg rounded-xl border border-border">
              {(["week", "month", "year"] as DateRange[]).map((range) => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDateRange(range)}
                  className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                    dateRange === range
                      ? "text-text"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {dateRange === range && (
                    <motion.div
                      layoutId="activeRange"
                      className="absolute inset-0 bg-surface rounded-lg shadow-sm border border-border"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <span className="relative z-10">{range}</span>
                </motion.button>
              ))}
            </div>

            {/* Comparison toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                setComparisonMode(
                  comparisonMode === "none" ? "previous" : "none",
                )
              }
              className={`p-2.5 rounded-xl transition-all ${
                comparisonMode === "previous"
                  ? "bg-primary-bg text-primary border border-primary/20"
                  : "text-text-muted hover:text-text hover:bg-border-light border border-transparent"
              }`}
              title="Compare with previous period"
            >
              <ArrowLeftRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={previousPeriod}
            className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-all"
          >
            <ChevronLeft size={18} />
          </motion.button>

          <span className="text-sm font-bold text-text min-w-[200px] text-center">
            {getTitle()}
          </span>

          <motion.button
            whileHover={
              !isCurrent || dateRange === "year" ? { scale: 1.1 } : {}
            }
            whileTap={!isCurrent || dateRange === "year" ? { scale: 0.9 } : {}}
            onClick={nextPeriod}
            disabled={isCurrent && dateRange !== "year"}
            className={`p-2 rounded-xl transition-all ${
              isCurrent && dateRange !== "year"
                ? "text-text-muted cursor-not-allowed opacity-40"
                : "text-text-muted hover:text-text hover:bg-border-light"
            }`}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              interval={
                dateRange === "year" ? 30 : dateRange === "month" ? 6 : 0
              }
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                boxShadow: "var(--shadow-lg)",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="hours"
              name="Hours"
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={
                dateRange === "year"
                  ? false
                  : { r: 4, fill: "var(--color-surface)", strokeWidth: 2 }
              }
              activeDot={{ r: 6, fill: "var(--color-primary)" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="habits"
              name="Habits"
              stroke="var(--color-secondary)"
              strokeWidth={3}
              dot={
                dateRange === "year"
                  ? false
                  : { r: 4, fill: "var(--color-surface)", strokeWidth: 2 }
              }
              activeDot={{ r: 6, fill: "var(--color-secondary)" }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="tasks"
              name="Tasks"
              stroke="var(--color-success)"
              strokeWidth={3}
              dot={
                dateRange === "year"
                  ? false
                  : { r: 4, fill: "var(--color-surface)", strokeWidth: 2 }
              }
              activeDot={{ r: 6, fill: "var(--color-success)" }}
            />
            {comparisonMode === "previous" && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="prevHours"
                  name="Prev Hours"
                  stroke="var(--color-primary)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  opacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="prevHabits"
                  name="Prev Habits"
                  stroke="var(--color-secondary)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  opacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="prevTasks"
                  name="Prev Tasks"
                  stroke="var(--color-success)"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  opacity={0.3}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-surface rounded-2xl border-2 border-border p-5 hover:shadow-lg hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}
                >
                  <Icon size={16} className={stat.color} />
                </div>
                <span className="text-xs font-semibold text-text-muted">
                  {stat.label}
                </span>
              </div>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-2xl font-bold text-text"
              >
                {stat.value}
              </motion.p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
