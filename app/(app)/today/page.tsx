import { serverGoalService } from "@/lib/services/server/goalService";
import { serverHabitService } from "@/lib/services/server/habitService";
import { serverTimeEntryService } from "@/lib/services/server/timeEntryService";
import { TodayOverview } from "./_components/TodayOverview";
import { TodayHabits } from "./_components/TodayHabits";
import { TodayGoals } from "./_components/TodayGoals";
import { TodayTimer } from "./_components/TodayTimer";
import { TimerTitle } from "./_components/TimerTitle";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const [goals, habits, runningTimer] = await Promise.all([
    serverGoalService.getAll({ status: "ACTIVE" }, false),
    serverHabitService.getAll({ status: "ACTIVE" }, false),
    serverTimeEntryService.getRunning(),
  ]);

  const today = new Date().getDay();
  const habitsDueToday = habits.filter((habit) => {
    if (habit.frequencyType === "DAILY") return true;
    if (habit.frequencyType === "WEEKLY") {
      return habit.frequencyDays.includes(today);
    }
    return true;
  });

  return (
    <>
      <TimerTitle />
      <div className="space-y-6 pb-20 md:pb-6">
        <TodayTimer runningTimer={runningTimer} />
        <TodayOverview goals={goals} habitsDue={habitsDueToday.length} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayHabits habits={habitsDueToday} />
          <TodayGoals goals={goals.slice(0, 5)} />
        </div>
      </div>
    </>
  );
}
