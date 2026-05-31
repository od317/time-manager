"use client";

import { useState } from "react";
import Link from "next/link";
import { Goal } from "@/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  CheckSquare,
  GripVertical,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { TaskRow } from "./TaskRow";

interface SortableGoalItemProps {
  goal: Goal;
  allGoals: Goal[];
  depth?: number;
}

export function SortableGoalItem({
  goal,
  allGoals,
  depth = 0,
}: SortableGoalItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { goalOrder, setGoalOrder } = useUIStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const subGoals = allGoals.filter((g) => g.parentId === goal.id);
  const activeTasks = (goal.tasks || []).filter(
    (t) => t.status === "TODO" || t.status === "IN_PROGRESS",
  );
  const hasChildren = subGoals.length > 0 || activeTasks.length > 0;

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
      const currentIds = subGoals.map((g) => g.id);
      const oldIndex = currentIds.indexOf(active.id as string);
      const newIndex = currentIds.indexOf(over.id as string);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSubOrder = arrayMove(currentIds, oldIndex, newIndex);

        // Update only these sub-goals in the global order
        const existingOrder =
          goalOrder.length > 0 ? [...goalOrder] : allGoals.map((g) => g.id);

        // Find where these sub-goals are in the full order
        const firstSubIndex = existingOrder.findIndex((id) =>
          currentIds.includes(id),
        );
        if (firstSubIndex !== -1) {
          // Replace just this sub-goal section
          existingOrder.splice(
            firstSubIndex,
            currentIds.length,
            ...newSubOrder,
          );
          setGoalOrder(existingOrder);
        }
      }
    }
  };
  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={`flex items-center gap-2 p-2.5 rounded-lg transition-all group ${
          depth > 0 ? "ml-4" : ""
        } ${isDragging ? "bg-primary-bg/20" : ""}`}
      >
        {depth > 0 && (
          <CornerDownRight
            size={14}
            className="text-text-muted flex-shrink-0"
          />
        )}

        <div
          {...attributes}
          {...listeners}
          className="text-text-muted hover:text-text cursor-grab active:cursor-grabbing flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all"
        >
          <GripVertical size={14} />
        </div>

        <button
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
          disabled={!hasChildren}
          className="flex items-center gap-2 flex-1 min-w-0 hover:bg-border-light rounded-lg -m-1 p-1 transition-all"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown
                size={14}
                className="text-text-muted flex-shrink-0"
              />
            ) : (
              <ChevronRight
                size={14}
                className="text-text-muted flex-shrink-0"
              />
            )
          ) : (
            <div className="w-[14px] flex-shrink-0" />
          )}
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: goal.color || "#6366F1" }}
          />
          <Link
            href={`/goals/${goal.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-text hover:text-primary hover:underline transition-all truncate"
          >
            {goal.title}
          </Link>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          {goal.targetValue && goal.targetValue > 0 && (
            <span className="text-xs text-text-muted">
              {Math.round(goal.progress)}%
            </span>
          )}
          {activeTasks.length > 0 && (
            <span className="text-xs text-text-muted flex items-center gap-1">
              <CheckSquare size={12} />
              {activeTasks.length}
            </span>
          )}
          {goal.priority === "URGENT" && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-danger-bg text-danger font-medium">
              Urgent
            </span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4 border-l-2 border-border pl-2 space-y-1">
          {activeTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={subGoals.map((g) => g.id)}
              strategy={verticalListSortingStrategy}
            >
              {subGoals.map((subGoal) => (
                <SortableGoalItem
                  key={subGoal.id}
                  goal={subGoal}
                  allGoals={allGoals}
                  depth={depth + 1}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="opacity-90 scale-105 shadow-lg bg-surface rounded-lg border border-border p-2.5">
                  <span className="text-sm text-text">
                    {subGoals.find((g) => g.id === activeId)?.title || ""}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  );
}
