import { serverGoalService } from "@/lib/services/server/goalService";
import { serverHabitService } from "@/lib/services/server/habitService";
import { CreateForm } from "./_components/CreateForm";

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
      color: g.color || "#6366F1",
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
      <div>
        <h1 className="text-2xl font-bold text-text">Create New</h1>
        <p className="text-text-muted text-sm mt-1">
          Set up goals, habits, and tasks to track your progress
        </p>
      </div>

      <CreateForm
        existingEvents={calendarEvents}
        goals={goals}
        habits={habits}
      />
    </div>
  );
}
