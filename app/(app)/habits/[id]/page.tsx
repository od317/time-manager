"use client";

import { useEffect, useState, use } from "react";
import { useDataStore } from "@/store/dataStore";
import { habitService } from "@/lib/services/habitService";
import { HabitHeader } from "./_components/HabitHeader";
import { HabitStats } from "./_components/HabitStats";
import { HabitHeatmap } from "./_components/HabitHeatmap";
import { HabitLogHistory } from "./_components/HabitLogHistory";
import { HabitActions } from "./_components/HabitActions";
import { ErrorState } from "@/components/ErrorState";
import { Habit } from "@/types";
import Link from "next/link";
import { Repeat, Loader2 } from "lucide-react";

export default function HabitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getHabit } = useDataStore();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const cachedHabit = useDataStore((s) => (id ? s.getHabit(id) : undefined));

  useEffect(() => {
    // Check cache first
    const cached = getHabit(id);
    if (cached?.logs) {
      setHabit(cached);
      setLoading(false);
      return;
    }

    // Fetch from API
    habitService
      .getById(id)
      .then((h) => {
        setHabit(h);
        setLoading(false);
      })
      .catch((err: any) => {
        setLoading(false);
        if (err?.code === "NOT_FOUND" || err?.status === 404) {
          setHabit(null);
        } else {
          setError(true);
        }
      });
  }, [id]);

  useEffect(() => {
    if (cachedHabit && habit) {
      setHabit(cachedHabit);
    }
  }, [cachedHabit]);

  if (error)
    return (
      <ErrorState
        description="Failed to load habit details"
        onRetry={() => {
          setError(false);
          setLoading(true);
          habitService
            .getById(id)
            .then((h) => {
              setHabit(h);
              setLoading(false);
            })
            .catch(() => {
              setLoading(false);
              setError(true);
            });
        }}
      />
    );

  if (loading)
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </div>
    );

  if (!habit)
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
        <div className="text-center py-20">
          <Repeat size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Habit not found</p>
          <Link
            href="/habits"
            className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
          >
            Back to Habits
          </Link>
        </div>
      </div>
    );

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
