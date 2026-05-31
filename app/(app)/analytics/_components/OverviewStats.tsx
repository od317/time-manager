import {
  Target,
  Trophy,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  Repeat,
  Zap,
} from "lucide-react";

interface OverviewStatsProps {
  totalGoals: number;
  completedGoals: number;
  activeGoals: number;
  failedGoals: number;
  totalHabits: number;
  activeHabits: number;
  avgStreak: number;
  bestStreak: number;
  totalHours: number;
}

export function OverviewStats({
  totalGoals,
  completedGoals,
  activeGoals,
  failedGoals,
  totalHabits,
  activeHabits,
  avgStreak,
  bestStreak,
  totalHours,
}: OverviewStatsProps) {
  const stats = [
    {
      label: "Goals Completed",
      value: completedGoals,
      sub: `of ${totalGoals}`,
      icon: Trophy,
      color: "text-warning",
      bg: "bg-warning-bg",
    },
    {
      label: "Active Goals",
      value: activeGoals,
      sub: `${failedGoals} failed`,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary-bg",
    },
    {
      label: "Active Habits",
      value: activeHabits,
      sub: `of ${totalHabits} total`,
      icon: Repeat,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      label: "Avg Streak",
      value: avgStreak,
      sub: `best: ${bestStreak}`,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-100",
    },
    {
      label: "Time Tracked",
      value: totalHours,
      sub: "hours this month",
      icon: Clock,
      color: "text-success",
      bg: "bg-success-bg",
    },
    {
      label: "Success Rate",
      value:
        totalGoals > 0
          ? `${Math.round((completedGoals / totalGoals) * 100)}%`
          : "0%",
      sub: "goal completion",
      icon: CheckCircle2,
      color: "text-info",
      bg: "bg-info-bg",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <p className="text-2xl font-bold text-text">{stat.value}</p>
            <p className="text-xs text-text-muted mt-1">{stat.label}</p>
            <p className="text-xs text-text-muted">{stat.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
