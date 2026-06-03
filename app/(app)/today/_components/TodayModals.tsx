"use client";

import { useModalStore } from "@/store/modalStore";
import { QuickTaskModal } from "./QuickTaskModal";
import { Goal } from "@/types";

interface TodayModalsProps {
  allGoals: Goal[];
}

export function TodayModals({ allGoals }: TodayModalsProps) {
  const { quickTaskGoalId, closeQuickTask } = useModalStore();
  const quickTaskGoal = quickTaskGoalId
    ? allGoals.find((g) => g.id === quickTaskGoalId)
    : null;

  if (!quickTaskGoal) return null;

  return <QuickTaskModal goal={quickTaskGoal} onClose={closeQuickTask} />;
}
