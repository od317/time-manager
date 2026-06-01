import { serverGoalService } from "@/lib/services/server/goalService";
import { serverHabitService } from "@/lib/services/server/habitService";
import { CreateForm } from "./_components/CreateForm";
import { PageHeader } from "./_components/PageHeader";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const [goals, habits] = await Promise.all([
    serverGoalService.getAll({}, false),
    serverHabitService.getAll({}, false),
  ]);

  const calendarEvents = [
    ...goals.map((g) => ({
      id: g.id,
      type: "goal" as const,
      title: g.title,
      color: g.color || "#9FA1FF",
      date: g.endDate || g.startDate,
      status: g.status,
    })),
    ...habits.map((h) => ({
      id: h.id,
      type: "habit" as const,
      title: h.title,
      color: h.color || "#8B5CF6",
      date: new Date().toISOString(),
      status: h.status,
    })),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-6">
      <PageHeader />
      <CreateForm
        existingEvents={calendarEvents}
        goals={goals}
        habits={habits}
      />
    </div>
  );
}
