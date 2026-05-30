import { Habit } from "@/types";
import { Flame, Trophy, CheckCircle2, TrendingUp } from "lucide-react";

interface HabitStatsProps {
  habit: Habit;
}

export function HabitStats({ habit }: HabitStatsProps) {
  // Calculate monthly completion rate
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const logsThisMonth = (habit.logs || []).filter((log) => {
    if (log.status !== "COMPLETED") return false;
    const logDate = new Date(log.date);
    return logDate >= thirtyDaysAgo;
  }).length;

  const expectedThisMonth =
    habit.frequencyType === "DAILY"
      ? 30
      : habit.frequencyType === "WEEKLY"
        ? Math.round((30 / 7) * habit.frequencyDays.length)
        : 30;

  const monthlyRate =
    expectedThisMonth > 0
      ? Math.round((logsThisMonth / expectedThisMonth) * 100)
      : 0;

  const stats = [
    {
      label: "Current Streak",
      value: habit.currentStreak,
      unit: "days",
      icon: Flame,
      color: "text-warning",
      bg: "bg-warning-bg",
    },
    {
      label: "Longest Streak",
      value: habit.longestStreak,
      unit: "days",
      icon: Trophy,
      color: "text-primary",
      bg: "bg-primary-bg",
    },
    {
      label: "Total Done",
      value: habit.totalCompletions,
      unit: "times",
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success-bg",
    },
    {
      label: "This Month",
      value: monthlyRate,
      unit: "%",
      icon: TrendingUp,
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
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-text">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.unit}</p>
            </div>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
