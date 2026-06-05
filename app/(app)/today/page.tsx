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
import { TodayModals } from "./_components/TodayModals";
import { TimerInitializer } from "./_components/TimerInitializer";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [goals, habits, runningTimer, allTasks] = await Promise.all([
    serverGoalService.getActiveAndOverdue(false),
    serverHabitService.getAll({ status: "ACTIVE" }, false),
    serverTimeEntryService.getRunning(),
    serverApi.get<Task[]>("/tasks", { revalidate: false, tags: ["tasks"] }),
  ]);

  const overdueGoals = goals.filter((g) => g.status === "OVERDUE");
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");

  const today = new Date().getDay();

  const habitsDueToday = habits.filter((habit) => {
    if (habit.frequencyType === "DAILY") return true;
    if (habit.frequencyType === "WEEKLY")
      return habit.frequencyDays.includes(today);
    return false;
  });

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
      if (task.priority === "URGENT" && task.status !== "COMPLETED")
        return true;
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate).toLocaleDateString("en-CA");
        const todayStr = new Date().toLocaleDateString("en-CA");
        if (dueDate === todayStr) return true;
      }
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
      <TimerInitializer goals={goals} />
      <TodayModals allGoals={goals} />

      <div className="space-y-6 pb-20 md:pb-6">
        <TodayOverview
          activeGoals={activeGoals.length}
          overdueGoals={overdueGoals.length}
          goals={goals}
          habitsDue={habitsDueToday.length}
          tasksCount={activeTasks.length}
        />

        <TodayTimer runningTimer={runningTimer} goals={goals} />

        <DashboardLayout
          habitsSection={<TodayHabits key={"habits"} habits={habitsDueToday} />}
          tasksSection={
            focusTasks.length > 0 && (
              <TodayTasks key={"tasks"} tasks={focusTasks} goals={goals} />
            )
          }
          goalsSection={
            <TodayGoals
              key={"goals"}
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
