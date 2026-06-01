import { notFound } from "next/navigation";
import { serverHabitService } from "@/lib/services/server/habitService";
import { HabitHeader } from "./_components/HabitHeader";
import { HabitStats } from "./_components/HabitStats";
import { HabitHeatmap } from "./_components/HabitHeatmap";
import { HabitLogHistory } from "./_components/HabitLogHistory";
import { HabitActions } from "./_components/HabitActions";

export const dynamic = "force-dynamic";

interface HabitDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function HabitDetailPage({
  params,
}: HabitDetailPageProps) {
  const { id } = await params;
  const habit = await serverHabitService.getById(id);

  if (!habit) notFound();

  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <HabitHeader habit={habit} todayStr={todayStr} />
      <HabitStats habit={habit} todayStr={todayStr} />
      <HabitHeatmap habitId={habit.id} />
      <HabitLogHistory habit={habit} todayStr={todayStr} />
      <HabitActions habit={habit} />
    </div>
  );
}
