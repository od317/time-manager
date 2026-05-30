"use client";

import { useState, useEffect } from "react";
import { habitService } from "@/lib/services";
import { HabitHeatmapEntry } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
        console.log(heatmapData);
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
    if (!entry || entry.status !== "COMPLETED") return "bg-border";
    if (entry.value && entry.value >= 2) return "bg-success";
    return "bg-success/60";
  };

  // Build calendar grid
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

  // Fill in days from start of week of Jan 1
  const firstDay = startDate.getDay();
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  // Group by weeks
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

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text">Activity</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setYear(year - 1)}
            className="p-1 text-text-muted hover:text-text transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-text">{year}</span>
          <button
            onClick={() => setYear(year + 1)}
            className="p-1 text-text-muted hover:text-text transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-flex gap-3">
            {/* Month labels */}
            <div className="flex flex-col gap-1">
              <div className="h-3" /> {/* spacer for day labels */}
              {months.map((month) => (
                <div key={month} className="h-3 text-[10px] text-text-muted">
                  {month}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div>
              {/* Day labels */}
              <div className="flex gap-0.5 mb-1">
                {["", "M", "", "W", "", "F", ""].map((day, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 text-[8px] text-text-muted text-center"
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
                      if (!day) return <div key={di} className="w-3 h-3" />;
                      const dateStr = formatDate(day);
                      const entry = data.find((e) => {
                        const entryDate = new Date(e.date)
                          .toISOString()
                          .split("T")[0];
                        return entryDate === dateStr;
                      });
                      const isCompleted = entry?.status === "COMPLETED";
                      return (
                        <div
                          key={di}
                          className={`w-3 h-3 rounded-sm ${getColor(entry)}`}
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
          <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
            <span>Less</span>
            <div className="w-3 h-3 rounded-sm bg-border" />
            <div className="w-3 h-3 rounded-sm bg-success/60" />
            <div className="w-3 h-3 rounded-sm bg-success" />
            <span>More</span>
          </div>
        </div>
      )}
    </div>
  );
}
