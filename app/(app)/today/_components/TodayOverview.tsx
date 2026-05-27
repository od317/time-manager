import { Goal } from "@/types";
import { Target, CheckCircle2, Clock, Flame, ListTodo } from "lucide-react";

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
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const urgentGoals = goals.filter(
    (g) => g.priority === "URGENT" && g.status === "ACTIVE",
  ).length;

  const stats = [
    {
      label: "Active Goals",
      value: activeGoals,
      icon: Target,
      color: "text-primary",
      bg: "bg-primary-bg",
    },
    {
      label: "Today's Habits",
      value: habitsDue,
      icon: Clock,
      color: "text-success",
      bg: "bg-success-bg",
    },
    {
      label: "Completed",
      value: completedGoals,
      icon: CheckCircle2,
      color: "text-warning",
      bg: "bg-warning-bg",
    },
    {
      label: "Urgent",
      value: urgentGoals,
      icon: Flame,
      color: "text-danger",
      bg: "bg-danger-bg",
    },
    {
      label: "Tasks",
      value: tasksCount,
      icon: ListTodo,
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
            <p className="text-2xl font-bold text-text">{stat.value}</p>
            <p className="text-sm text-text-muted mt-1">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
