"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { todayService, TodayResponse } from "@/lib/services/todayService";
import { TodayOverview } from "./TodayOverview";
import { TodayHabits } from "./TodayHabits";
import { TodayGoals } from "./TodayGoals";
import { TodayTasks } from "./TodayTasks";
import { TodayTimer } from "./TodayTimer";
import { DashboardLayout } from "./DashboardLayout";
import { TodayModals } from "./TodayModals";
import { TimerInitializer } from "./TimerInitializer";
import { TodaySkeleton } from "./TodaySkeleton";

export function TodayClient() {
  const [data, setData] = useState<TodayResponse | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    todayService.getAll().then(setData).catch(console.error);
  }, [isAuthenticated]);

  if (!data) return <TodaySkeleton />;

  return (
    <>
      <TimerInitializer goals={data.goals} />
      <TodayModals allGoals={data.goals} />

      <div className="space-y-6 pb-20 md:pb-6">
        <TodayOverview
          activeGoals={data.stats.activeGoals}
          overdueGoals={data.stats.overdueGoals}
          totalGoals={data.stats.totalGoals}
          habitsDue={data.stats.habitsDue}
          tasksCount={data.stats.activeTasks}
        />

        <TodayTimer runningTimer={data.runningTimer} goals={data.goals} />

        <DashboardLayout
          habitsSection={<TodayHabits habits={data.habits} />}
          tasksSection={
            data.tasks.length > 0 && (
              <TodayTasks tasks={data.tasks} goals={data.goals} />
            )
          }
          goalsSection={
            <TodayGoals
              goals={data.goals}
              totalCount={data.stats.totalGoals}
              allGoals={data.goals}
            />
          }
        />
      </div>
    </>
  );
}
