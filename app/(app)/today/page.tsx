import { serverGoalService } from "@/lib/services/server/goalService";
import { serverHabitService } from "@/lib/services/server/habitService";
import { serverTimeEntryService } from "@/lib/services/server/timeEntryService";
import { serverApi } from "@/lib/server-api";
import { Task } from "@/types";
import { TodayOverview } from "./_components/TodayOverview";
import { TodayHabits } from "./_components/TodayHabits";
import { TodayGoals } from "./_components/TodayGoals";
import { TodayTasks } from "./_components/TodayTasks";
import { TodayTimer } from "./_components/TodayTimer";
import { TimerTitle } from "./_components/TimerTitle";
import { TimerInitializer } from "./_components/TimerInitializer";
import { getDayOfWeek, isHabitDueToday } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [goals, habits, runningTimer, allTasks] = await Promise.all([
    serverGoalService.getAll({ status: "ACTIVE" }, false),
    serverHabitService.getAll({ status: "ACTIVE" }, false),
    serverTimeEntryService.getRunning(),
    serverApi.get<Task[]>("/tasks", { revalidate: false, tags: ["tasks"] }),
  ]);

  const today = getDayOfWeek();
  const habitsDueToday = habits.filter((h) => (h as any).isDueToday !== false);

  // Get active tasks (TODO or IN_PROGRESS)
  const activeTasks = Array.isArray(allTasks) ? allTasks : [];

  return (
    <>
      <TimerTitle />
      <div className="space-y-6 pb-20 md:pb-6">
        <TimerInitializer goals={goals} />
        <TodayTimer runningTimer={runningTimer} goals={goals} />
        <TodayOverview
          goals={goals}
          habitsDue={habitsDueToday.length}
          tasksCount={activeTasks.length}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayHabits habits={habitsDueToday} />
          <TodayGoals goals={goals.slice(0, 5)} />
        </div>
        {/* Tasks section */}
        {activeTasks.length > 0 && (
          <TodayTasks tasks={activeTasks.slice(0, 5)} goals={goals} />
        )}
      </div>
    </>
  );
}
