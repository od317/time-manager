"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) return;
    fetchedRef.current = true;

    setLoading(true);
    todayService
      .getAll()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) return <TodaySkeleton />;
  if (!data) return null;
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

        <TodayTimer goals={data.goals} />

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
