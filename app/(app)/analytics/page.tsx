import { serverGoalService } from "@/lib/services/server/goalService";
import { serverHabitService } from "@/lib/services/server/habitService";
import { serverTimeEntryService } from "@/lib/services/server/timeEntryService";
import { AnalyticsHeader } from "./_components/AnalyticsHeader";
import { OverviewStats } from "./_components/OverviewStats";
import { GoalProgress } from "./_components/GoalProgress";
import { HabitConsistency } from "./_components/HabitConsistency";
import { TimeDistribution } from "./_components/TimeDistribution";
import { ProductivityPatterns } from "./_components/ProductivityPatterns";
import { DailyBreakdown } from "./_components/DailyBreakdown";
import { Comparisons } from "./_components/Comparisons";
import { RecentActivity } from "./_components/RecentActivity";
import { SummaryFeedback } from "./_components/SummaryFeedback";
import { Task } from "@/types";
import { serverApi } from "@/lib/server-api";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [goals, habits, timeSummary, timeEntriesData, tasksData] =
    await Promise.all([
      serverGoalService.getAllNoPagination({}, false),
      serverHabitService.getAll({}, false),
      serverTimeEntryService.getSummary({ period: "month" }),
      serverTimeEntryService.getAll({ limit: 100 }),
      serverApi.get<Task[]>("/tasks", { revalidate: false }),
    ]);

  const allTasks = Array.isArray(tasksData) ? tasksData : [];
  const timeEntries = Array.isArray(timeEntriesData) ? timeEntriesData : [];

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const activeGoals = goals.filter((g) => g.status === "ACTIVE").length;
  const overdueGoals = goals.filter((g) => g.status === "OVERDUE").length;
  const failedGoals = goals.filter((g) => g.status === "FAILED").length;
  const pausedGoals = goals.filter((g) => g.status === "PAUSED").length;

  const totalHabits = habits.length;
  const activeHabits = habits.filter((h) => h.status === "ACTIVE");
  const activeHabitsCount = activeHabits.length;
  const avgStreak =
    activeHabitsCount > 0
      ? Math.round(
          activeHabits.reduce((sum, h) => sum + h.currentStreak, 0) /
            activeHabitsCount,
        )
      : 0;
  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, h.longestStreak),
    0,
  );

  const totalHours = timeSummary?.totalTime
    ? Math.round((timeSummary.totalTime / 3600) * 10) / 10
    : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <AnalyticsHeader />

      <OverviewStats
        totalGoals={totalGoals}
        completedGoals={completedGoals}
        activeGoals={activeGoals}
        failedGoals={failedGoals}
        overdueGoals={overdueGoals}
        pausedGoals={pausedGoals}
        totalHabits={totalHabits}
        activeHabits={activeHabitsCount}
        avgStreak={avgStreak}
        bestStreak={bestStreak}
        totalHours={totalHours}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalProgress goals={goals} />
        <HabitConsistency habits={habits} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeDistribution timeSummary={timeSummary || null} />
        <ProductivityPatterns goals={goals} habits={habits} />
      </div>

      <DailyBreakdown goals={goals} habits={habits} timeEntries={timeEntries} />

      <Suspense
        fallback={
          <div className="bg-surface rounded-2xl border border-border p-6 animate-pulse">
            <div className="h-4 bg-border rounded w-1/3 mb-4" />
            <div className="h-3 bg-border rounded w-full mb-2" />
            <div className="h-3 bg-border rounded w-3/4" />
          </div>
        }
      >
        <SummaryFeedback goals={goals} habits={habits} tasks={allTasks} />
      </Suspense>

      <Comparisons goals={goals} habits={habits} />
      <RecentActivity timeEntries={timeEntries.slice(0, 10)} goals={goals} />
    </div>
  );
}
