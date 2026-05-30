"use client";

import { useState } from "react";
import Link from "next/link";
import { Goal, Task } from "@/types";
import { useTimerStore } from "@/store/timerStore";
import { useUIStore } from "@/store/uiStore";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Target,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  ArrowRight,
  CheckSquare,
  Circle,
  Play,
  GripVertical,
} from "lucide-react";

interface TodayGoalsProps {
  goals: Goal[];
  totalCount: number;
  allGoals: Goal[];
}

function TaskRow({ task }: { task: Task }) {
  const isSelected = useTimerStore((s) => s.selectedTask?.id === task.id);
  const setSelectedTask = useTimerStore((s) => s.setSelectedTask);

  const handleStartTask = () => {
    setSelectedTask(task);
    document
      .querySelector("#focus-timer")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-all group ${
        isSelected
          ? "text-primary bg-primary-bg/30"
          : "text-text-secondary hover:bg-border-light"
      }`}
    >
      <Circle
        size={12}
        className={`flex-shrink-0 ${isSelected ? "text-primary" : "text-text-muted"}`}
      />
      <span className="truncate flex-1">{task.title}</span>
      {task.estimatedMinutes && (
        <span className="text-xs text-text-muted flex-shrink-0">
          {task.estimatedMinutes}m
        </span>
      )}
      <button
        onClick={handleStartTask}
        className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-all flex-shrink-0 ${
          isSelected
            ? "text-primary bg-primary-bg cursor-default"
            : "text-primary hover:bg-primary-bg opacity-0 group-hover:opacity-100 cursor-pointer"
        }`}
        title={
          isSelected ? "Task selected for timer" : "Start timer for this task"
        }
      >
        {isSelected ? (
          <>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />{" "}
            Selected
          </>
        ) : (
          <>
            <Play size={12} /> Start
          </>
        )}
      </button>
    </div>
  );
}

function SortableGoalItem({
  goal,
  allGoals,
  depth = 0,
}: {
  goal: Goal;
  allGoals: Goal[];
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

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

        {/* Drag handle */}
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
          {subGoals.map((subGoal) => (
            <SortableGoalItem
              key={subGoal.id}
              goal={subGoal}
              allGoals={allGoals}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TodayGoals({ goals, totalCount, allGoals }: TodayGoalsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { goalOrder, setGoalOrder } = useUIStore();

  const topLevelGoals = goals.filter((g) => !g.parentId);

  // Sort by saved order, then by default
  const sortedGoals =
    goalOrder.length > 0
      ? [...topLevelGoals].sort((a, b) => {
          const aIndex = goalOrder.indexOf(a.id);
          const bIndex = goalOrder.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        })
      : topLevelGoals;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIds =
        goalOrder.length > 0 ? goalOrder : sortedGoals.map((g) => g.id);
      const oldIndex = oldIds.indexOf(active.id as string);
      const newIndex = oldIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        setGoalOrder(arrayMove(oldIds, oldIndex, newIndex));
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
        </DndContext>
      )}
    </div>
  );
}
