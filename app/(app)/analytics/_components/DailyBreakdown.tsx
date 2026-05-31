"use client";

import { useState, useMemo } from "react";
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

const COLORS = [
  "#6366F1",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
];

export function DailyBreakdown({
  goals,
  habits,
  timeEntries,
}: DailyBreakdownProps) {
  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>("none");

  // Calculate date range
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

  // Merge comparison data
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

  return (
    <div className="space-y-6">
      {/* Controls & Chart */}
      <div className="bg-surface rounded-xl border border-border p-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="text-lg font-semibold text-text flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            Daily Breakdown
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Range selector */}
            <div className="flex bg-bg rounded-lg p-1">
              {(["week", "month", "year"] as DateRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                    dateRange === range
                      ? "bg-surface text-text shadow-sm"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Comparison toggle */}
            <button
              onClick={() =>
                setComparisonMode(
                  comparisonMode === "none" ? "previous" : "none",
                )
              }
              className={`p-2 rounded-lg transition-all ${
                comparisonMode === "previous"
                  ? "bg-primary-bg text-primary"
                  : "text-text-muted hover:text-text hover:bg-border-light"
              }`}
              title="Compare with previous period"
            >
              <ArrowLeftRight size={16} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={previousPeriod}
            className="p-1 text-text-muted hover:text-text transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-text">{getTitle()}</span>
          <button
            onClick={nextPeriod}
            disabled={isCurrent && dateRange !== "year"}
            className={`p-1 transition-all ${isCurrent && dateRange !== "year" ? "text-text-muted cursor-not-allowed" : "text-text-muted hover:text-text"}`}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              interval={
                dateRange === "year" ? 30 : dateRange === "month" ? 6 : 0
              }
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#94A3B8" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: "#94A3B8" }}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="hours"
              name="Hours"
              stroke="#6366F1"
              strokeWidth={2}
              dot={dateRange === "year" ? false : { r: 3 }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="habits"
              name="Habits"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={dateRange === "year" ? false : { r: 3 }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="tasks"
              name="Tasks"
              stroke="#10B981"
              strokeWidth={2}
              dot={dateRange === "year" ? false : { r: 3 }}
              isAnimationActive={false}
            />
            {comparisonMode === "previous" && (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="prevHours"
                  name="Prev Hours"
                  stroke="#6366F1"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  opacity={0.4}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="prevHabits"
                  name="Prev Habits"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  opacity={0.4}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="prevTasks"
                  name="Prev Tasks"
                  stroke="#10B981"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  dot={false}
                  opacity={0.4}
                  isAnimationActive={false}
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats for Period */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Hours",
            value: `${Math.round(chartData.reduce((s, d) => s + d.hours, 0) * 10) / 10}h`,
            icon: Clock,
            color: "text-primary",
          },
          {
            label: "Tasks Done",
            value: chartData.reduce((s, d) => s + d.tasks, 0),
            icon: CheckCircle2,
            color: "text-success",
          },
          {
            label: "Habits Done",
            value: chartData.reduce((s, d) => s + d.habits, 0),
            icon: Repeat,
            color: "text-purple-500",
          },
          {
            label: "Active Days",
            value: chartData.filter(
              (d) => d.hours > 0 || d.tasks > 0 || d.habits > 0,
            ).length,
            icon: Target,
            color: "text-warning",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={stat.color} />
                <span className="text-xs text-text-muted">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-text">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
