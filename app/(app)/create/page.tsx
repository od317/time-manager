import { serverApi } from "@/lib/server-api";
import { CreateForm } from "./_components/CreateForm";
import { PageHeader } from "./_components/PageHeader";
import { CalendarDataResponse, CalendarEvent } from "@/types/calendar";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const data = await serverApi.get<CalendarDataResponse>(
    "/create/calendar-data",
    { revalidate: false },
  );

  const calendarEvents: CalendarEvent[] = [
    ...(data?.goals || []).map((g) => ({
      id: g.id,
      type: "goal" as const,
      title: g.title,
      color: g.color || "#9FA1FF",
      date: g.endDate || g.startDate,
      status: g.status,
    })),
    ...(data?.habits || []).map((h) => ({
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
        goals={(data?.goals || []) as any}
        habits={(data?.habits || []) as any}
        activeGoals={data?.activeGoals || 0}
        activeHabits={data?.activeHabits || 0}
        upcomingDeadlines={data?.upcomingDeadlines || 0}
      />
    </div>
  );
}
