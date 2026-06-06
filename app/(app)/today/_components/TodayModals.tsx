"use client";

import { useModalStore } from "@/store/modalStore";
import { QuickTaskModal } from "./QuickTaskModal";
import { TaskEditModal } from "./TaskEditModal";
import { Goal, Task } from "@/types";

interface TodayModalsProps {
  allGoals: Goal[];
}

// Recursively find a goal by ID (including nested children)
function findGoalById(goals: Goal[], id: string): Goal | undefined {
  for (const goal of goals) {
    if (goal.id === id) return goal;
    if (goal.children?.length) {
      const found = findGoalById(goal.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function TodayModals({ allGoals }: TodayModalsProps) {
  const { quickTaskGoalId, editingTask, closeQuickTask, closeEditTask } =
    useModalStore();

  const quickTaskGoal = quickTaskGoalId
    ? findGoalById(allGoals, quickTaskGoalId)
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
