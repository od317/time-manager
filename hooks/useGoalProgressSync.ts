"use client";

import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timerStore";
import { goalService } from "@/lib/services";
import { useRouter } from "next/navigation";

export function useGoalProgressSync() {
  const lastStoppedId = useTimerStore((s) => s.lastStoppedId);
  const clearLastStopped = useTimerStore((s) => s.clearLastStopped);
  const router = useRouter();
  const processedIds = useRef<Set<string>>(new Set());
  const isSyncing = useRef(false);

  useEffect(() => {
    if (
      !lastStoppedId ||
      processedIds.current.has(lastStoppedId) ||
      isSyncing.current
    )
      return;

    const syncProgress = async () => {
      isSyncing.current = true;
      processedIds.current.add(lastStoppedId);

      try {
        const { timeEntryService } = await import("@/lib/services");
        const timeEntry = await timeEntryService.getById(lastStoppedId);

        if (timeEntry?.goalId && timeEntry.duration && timeEntry.duration > 0) {
          const goal = await goalService.getById(timeEntry.goalId);

          if (goal && goal.goalType === "time" && goal.targetValue) {
            const trackedInUnit =
              goal.unit?.toLowerCase() === "minutes"
                ? timeEntry.duration / 60
                : timeEntry.duration / 3600;

            const newValue = (goal.currentValue || 0) + trackedInUnit;
            const newProgress = Math.min(
              (newValue / goal.targetValue) * 100,
              100,
            );

            await goalService.update(goal.id, {
              currentValue: Math.round(newValue * 100) / 100,
              progress: Math.round(newProgress * 100) / 100,
              status: newProgress >= 100 ? "COMPLETED" : undefined,
            });

            router.refresh();
          }
        }
      } catch (error) {
        console.error("Failed to sync goal progress:", error);
      } finally {
        isSyncing.current = false;
        clearLastStopped();
      }
    };

    syncProgress();
  }, [lastStoppedId]);
}
