"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { TodayOverview } from "./TodayOverview";
import { TodayHabits } from "./TodayHabits";
import { TodayGoals } from "./TodayGoals";
import { TodayTasks } from "./TodayTasks";
import { TodayTimer } from "./TodayTimer";
import { DashboardLayout } from "./DashboardLayout";
import { TodayModals } from "./TodayModals";
import { TimerInitializer } from "./TimerInitializer";
import { TodaySkeleton } from "./TodaySkeleton";
import { useDataStore } from "@/store/dataStore";
import { ErrorState } from "@/components/ErrorState";

export function TodayClient() {
  const { goals, habits, todayTasks, todayStats, todayLoaded, fetchTodayData } =
    useDataStore();

  const [error, setError] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) return;
    fetchedRef.current = true;

    if (!todayLoaded) {
      fetchTodayData().catch(() => setError(true));
    }
  }, [isAuthenticated, todayLoaded, fetchTodayData]);

  if (!todayLoaded) return <TodaySkeleton />;
 
  if (error)
    return (
      <ErrorState
        description="Failed to load today's data"
        onRetry={() => {
          setError(false);
          fetchTodayData().catch(() => setError(true));
        }}
      />
    );
  return (
    <>
      <TimerInitializer goals={goals} />
      <TodayModals allGoals={goals} />

      <div className="space-y-6 pb-20 md:pb-6">
        <TodayOverview
          activeGoals={todayStats!.activeGoals}
          overdueGoals={todayStats!.overdueGoals}
          totalGoals={todayStats!.totalGoals}
          habitsDue={todayStats!.habitsDue}
          tasksCount={todayStats!.activeTasks}
        />

        <TodayTimer goals={goals} />

        <DashboardLayout
          habitsSection={<TodayHabits habits={habits} />}
          tasksSection={
            todayTasks.length > 0 && (
              <TodayTasks tasks={todayTasks} goals={goals} />
            )
          }
          goalsSection={
            <TodayGoals
              goals={goals}
              totalCount={todayStats!.totalGoals}
              allGoals={goals}
            />
          }
        />
      </div>
    </>
  );
}
