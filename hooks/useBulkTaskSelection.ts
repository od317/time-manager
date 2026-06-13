"use client";

import { taskService } from "@/lib/services/taskService";
import { useDataStore } from "@/store/dataStore";
import { useTaskStore } from "@/store/taskStore";
import { useState, useCallback } from "react";

export function useBulkTaskSelection(goalId: string) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived from selectedTasks
  const selectMode = selectedTasks.size > 0;

  const toggleTask = useCallback((taskId: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  }, []);

  const isSelected = useCallback(
    (taskId: string) => selectedTasks.has(taskId),
    [selectedTasks],
  );

  const clearError = useCallback(() => setError(null), []);

  const bulkComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await taskService.bulkUpdate({
        taskIds: [...selectedTasks],
        status: "COMPLETED",
      });

      selectedTasks.forEach((taskId) => {
        useTaskStore.getState().markComplete(taskId);
      });
      useDataStore
        .getState()
        .bulkUpdateTasksInCache([...selectedTasks], { status: "COMPLETED" });

      setSelectedTasks(new Set());
    } catch {
      setError("Failed to complete tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTasks]);

  const bulkDelete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await taskService.bulkDelete([...selectedTasks]);

      useDataStore.getState().bulkRemoveTasksFromCache([...selectedTasks]);
      selectedTasks.forEach((taskId) => {
        useTaskStore.getState().removeTask(taskId, goalId);
      });

      setSelectedTasks(new Set());
    } catch {
      setError("Failed to delete tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTasks, goalId]);

  return {
    selectMode,
    selectedTasks,
    isLoading,
    toggleTask,
    isSelected,
    bulkComplete,
    bulkDelete,
    error,
    clearError,
  };
}
