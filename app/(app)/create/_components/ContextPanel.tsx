import { Target, Repeat, Calendar, TrendingUp, Lightbulb } from "lucide-react";

interface ContextPanelProps {
  activeGoals: number;
  activeHabits: number;
  upcomingDeadlines: number;
  activeTab: string;
}

export function ContextPanel({
  activeGoals,
  activeHabits,
  upcomingDeadlines,
  activeTab,
}: ContextPanelProps) {
  const tips: Record<string, string> = {
    goal: "Break big goals into smaller sub-goals. Each sub-goal should have a clear deadline.",
    habit:
      'Start small! A habit of "read 1 page" is easier to maintain than "read 1 hour".',
    task: "Tasks work best when they have an estimated time. This helps with planning your day.",
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 space-y-6">
      <h3 className="text-lg font-semibold text-text">Overview</h3>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Target size={16} className="text-primary" />
            Active Goals
          </div>
          <span className="text-sm font-semibold text-text">{activeGoals}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Repeat size={16} className="text-purple-500" />
            Active Habits
          </div>
          <span className="text-sm font-semibold text-text">
            {activeHabits}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Calendar size={16} className="text-warning" />
            Upcoming Deadlines
          </div>
          <span className="text-sm font-semibold text-text">
            {upcomingDeadlines}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Tip */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-warning" />
          <span className="text-sm font-medium text-text">Tip</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          {tips[activeTab] || tips.goal}
        </p>
      </div>

      {/* Streak info */}
      <div className="bg-primary-bg/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-primary" />
          <span className="text-sm font-medium text-primary">
            Consistency is key
          </span>
        </div>
        <p className="text-xs text-text-secondary">
          Users who track daily are 3x more likely to achieve their goals.
        </p>
      </div>
    </div>
  );
}
