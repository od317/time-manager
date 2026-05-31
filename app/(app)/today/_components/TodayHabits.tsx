"use client";

import { useState } from "react";
import { Habit } from "@/types";
import { habitService } from "@/lib/services";
import { useUIStore } from "@/store/uiStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight, Repeat } from "lucide-react";
import { SortableHabitItem } from "./SortableHabitItem";

interface TodayHabitsProps {
  habits: Habit[];
}

export function TodayHabits({ habits }: TodayHabitsProps) {
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const { goalOrder, setGoalOrder } = useUIStore();

  // Check if habit is completed today
  const isCompleted = (habit: Habit): boolean => {
    if (completedIds.has(habit.id)) return true;
    const todayLog = habit.logs?.find((log) => {
      if (log.status !== "COMPLETED") return false;
      return new Date(log.date).toLocaleDateString("en-CA") === todayStr;
    });
    return !!todayLog;
  };

  // Split habits
  const uncompleted = habits.filter((h) => !isCompleted(h));
  const completed = habits.filter((h) => isCompleted(h));

  // Sort by saved habit order (reuse goalOrder key or create separate)
  const habitOrderKey = "habit-order";

  const sortByIds = (items: Habit[], ids: string[]): Habit[] => {
    if (ids.length === 0) return items;
    const ordered = ids
      .map((id) => items.find((h) => h.id === id))
      .filter((h): h is Habit => !!h);
    items.forEach((h) => {
      if (!ids.includes(h.id)) ordered.push(h);
    });
    return ordered;
  };

  const sortedUncompleted = sortByIds(uncompleted, []);
  const sortedCompleted = sortByIds(completed, []);

  const handleComplete = async (habit: Habit) => {
    if (isCompleted(habit) || loadingId) return;

    setLoadingId(habit.id);
    try {
      await habitService.log(habit.id, {
        value: habit.trackAmount ? (habit.targetValue ?? undefined) : undefined,
      });
      setCompletedIds((prev) => new Set([...prev, habit.id]));
    } catch {
      // Handle silently
    } finally {
      setLoadingId(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    // Reordering disabled for habits (can add later if needed)
  };

  if (habits.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Repeat size={18} className="text-purple-500" />
            <h3 className="text-sm font-semibold text-text">
              Today&apos;s Habits
            </h3>
          </div>
        </button>
        {isExpanded && (
          <p className="text-text-muted text-sm text-center py-6">
            No habits scheduled for today.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Repeat size={18} className="text-purple-500" />
          <h3 className="text-sm font-semibold text-text">
            Today&apos;s Habits
          </h3>
          <span className="text-xs text-text-muted">
            {completed.length}/{habits.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown size={18} className="text-text-muted" />
        ) : (
          <ChevronRight size={18} className="text-text-muted" />
        )}
      </button>

      {isExpanded && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="mt-3 space-y-3">
            {/* Uncompleted habits */}
            <SortableContext
              items={sortedUncompleted.map((h) => h.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sortedUncompleted.map((habit) => (
                  <SortableHabitItem
                    key={habit.id}
                    habit={habit}
                    todayStr={todayStr}
                    onComplete={handleComplete}
                    isLoading={loadingId === habit.id}
                    isCompleted={false}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Completed habits */}
            {completed.length > 0 && (
              <div>
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-all py-1"
                >
                  {showCompleted ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                  Completed ({completed.length})
                </button>
                {showCompleted && (
                  <SortableContext
                    items={sortedCompleted.map((h) => h.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2 mt-2">
                      {sortedCompleted.map((habit) => (
                        <SortableHabitItem
                          key={habit.id}
                          habit={habit}
                          todayStr={todayStr}
                          onComplete={handleComplete}
                          isLoading={false}
                          isCompleted={true}
                        />
                      ))}
                    </div>
                  </SortableContext>
                )}
              </div>
            )}
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 scale-105 shadow-lg bg-surface rounded-lg border border-border p-3">
                <span className="text-sm text-text">
                  {habits.find((h) => h.id === activeId)?.title || ""}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
