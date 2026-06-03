"use client";

import { useModalStore } from "@/store/modalStore";
import { QuickTaskModal } from "./QuickTaskModal";
import { TaskEditModal } from "./TaskEditModal";
import { Goal, Task } from "@/types";

interface TodayModalsProps {
  allGoals: Goal[];
}

export function TodayModals({ allGoals }: TodayModalsProps) {
  const { quickTaskGoalId, editingTask, closeQuickTask, closeEditTask } =
    useModalStore();

  const quickTaskGoal = quickTaskGoalId
    ? allGoals.find((g) => g.id === quickTaskGoalId)
    : null;

  return (
    <>
      {quickTaskGoal && (
        <QuickTaskModal goal={quickTaskGoal} onClose={closeQuickTask} />
      )}
      {editingTask && (
        <TaskEditModal task={editingTask} onClose={closeEditTask} />
      )}
    </>
  );
}
