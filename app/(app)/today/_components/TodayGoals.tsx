"use client";

import { useState } from "react";
import Link from "next/link";
import { Goal } from "@/types";
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
import { Target, ChevronDown, ChevronRight, ArrowRight } from "lucide-react";
import { SortableGoalItem } from "./SortableGoalItem";

interface TodayGoalsProps {
  goals: Goal[];
  totalCount: number;
  allGoals: Goal[];
}

export function TodayGoals({ goals, totalCount, allGoals }: TodayGoalsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { goalOrder, setGoalOrder } = useUIStore();

  const topLevelGoals = goals.filter((g) => !g.parentId);

  // Merge saved order with current goals
  const sortedGoals = (() => {
    if (goalOrder.length === 0) return topLevelGoals;

    // Start with saved order, filter out deleted goals
    const savedIds = goalOrder.filter((id) =>
      topLevelGoals.some((g) => g.id === id),
    );

    // Add new goals not in saved order at the end
    topLevelGoals.forEach((g) => {
      if (!savedIds.includes(g.id)) {
        savedIds.push(g.id);
      }
    });

    // Map IDs to actual goals
    return savedIds.map((id) => topLevelGoals.find((g) => g.id === id)!);
  })();

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
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const currentIds = sortedGoals.map((g) => g.id);
      const oldIndex = currentIds.indexOf(active.id as string);
      const newIndex = currentIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(currentIds, oldIndex, newIndex);
        setGoalOrder(newOrder);
      }
    }
  };

  if (goals.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Target size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-text">
            Active Goals ({totalCount})
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <span className="text-xs text-text-muted max-w-[200px] truncate">
              {sortedGoals
                .slice(0, 2)
                .map((g) => g.title)
                .join(", ")}
              {sortedGoals.length > 2 && "..."}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown size={18} className="text-text-muted" />
          ) : (
            <ChevronRight size={18} className="text-text-muted" />
          )}
        </div>
      </button>

      {isExpanded && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedGoals.map((g) => g.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mt-3 space-y-1">
              {sortedGoals.map((goal) => (
                <SortableGoalItem
                  key={goal.id}
                  goal={goal}
                  allGoals={allGoals}
                />
              ))}
              {totalCount > sortedGoals.length && (
                <Link
                  href="/goals"
                  className="flex items-center justify-center gap-1 py-2 text-xs text-primary hover:text-primary-dark font-medium"
                >
                  View all {totalCount} goals
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 scale-105 shadow-lg bg-surface rounded-lg border border-border p-2.5">
                <span className="text-sm text-text">
                  {sortedGoals.find((g) => g.id === activeId)?.title || ""}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
