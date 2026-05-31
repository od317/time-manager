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
import { DashboardLayout } from "./_components/DashboardLayout";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [goals, habits, runningTimer, allTasks] = await Promise.all([
    serverGoalService.getAll({ status: "ACTIVE" }, false),
    serverHabitService.getAll({ status: "ACTIVE" }, false),
    serverTimeEntryService.getRunning(),
    serverApi.get<Task[]>("/tasks", { revalidate: false, tags: ["tasks"] }),
  ]);

  const today = new Date().getDay();

  // Filter habits due today
  const habitsDueToday = habits.filter((habit) => {
    if (habit.frequencyType === "DAILY") return true;
    if (habit.frequencyType === "WEEKLY")
      return habit.frequencyDays.includes(today);
    return false;
  });

  // Filter tasks - only show due today or urgent
  const activeTasks = (Array.isArray(allTasks) ? allTasks : []).filter(
    (task) => {
      if (task.priority === "URGENT") return true;
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toLocaleDateString("en-CA");
        const todayStr = new Date().toLocaleDateString("en-CA");
        return dueDate === todayStr;
      }
      return false;
    },
  );

  const focusTasks = (Array.isArray(allTasks) ? allTasks : []).filter(
    (task) => {
      // Include if urgent (any status)
      if (task.priority === "URGENT" && task.status !== "COMPLETED")
        return true;

      // Include if due today (any status)
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toLocaleDateString("en-CA");
        const todayStr = new Date().toLocaleDateString("en-CA");
        if (dueDate === todayStr) return true;
      }

      // Include if completed today
      if (task.status === "COMPLETED" && task.completedAt) {
        const completedDate = new Date(task.completedAt).toLocaleDateString(
          "en-CA",
        );
        const todayStr = new Date().toLocaleDateString("en-CA");
        return completedDate === todayStr;
      }

      return false;
    },
  );

  return (
    <>
      <TimerTitle />
      <div className="space-y-4 pb-20 md:pb-6">
        {/* Overview - compact strip above timer */}
        <TodayOverview
          goals={goals}
          habitsDue={habitsDueToday.length}
          tasksCount={activeTasks.length}
        />

        {/* Timer */}
        <TodayTimer runningTimer={runningTimer} goals={goals} />

        <DashboardLayout
          habitsSection={<TodayHabits habits={habitsDueToday} />}
          tasksSection={
            focusTasks.length > 0 && (
              <TodayTasks tasks={focusTasks} goals={goals} />
            )
          }
          goalsSection={
            <TodayGoals
              goals={goals}
              totalCount={goals.length}
              allGoals={goals}
            />
          }
        />
      </div>
    </>
  );
}
