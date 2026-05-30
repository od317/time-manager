import { Goal } from "@/types";
import { Target, Repeat, CheckSquare, AlertTriangle } from "lucide-react";

interface TodayOverviewProps {
  goals: Goal[];
  habitsDue: number;
  tasksCount: number;
}

export function TodayOverview({
  goals,
  habitsDue,
  tasksCount,
}: TodayOverviewProps) {
  const activeGoals = goals.filter((g) => g.status === "ACTIVE").length;
  const urgentGoals = goals.filter(
    (g) => g.priority === "URGENT" && g.status === "ACTIVE",
  ).length;

  const stats = [
    { label: "Goals", value: activeGoals, icon: Target, color: "text-primary" },
    {
      label: "Habits",
      value: habitsDue,
      icon: Repeat,
      color: "text-purple-500",
    },
    {
      label: "Tasks",
      value: tasksCount,
      icon: CheckSquare,
      color: "text-success",
    },
    ...(urgentGoals > 0
      ? [
          {
            label: "Urgent",
            value: urgentGoals,
            icon: AlertTriangle,
            color: "text-danger",
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-surface rounded-xl border border-border">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-2">
        Today
      </span>
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-1.5">
            <Icon size={14} className={stat.color} />
            <span className="text-sm font-medium text-text">{stat.value}</span>
            <span className="text-xs text-text-muted hidden sm:inline">
              {stat.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
