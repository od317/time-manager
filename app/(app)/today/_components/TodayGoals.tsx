// TodayGoals.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import { Target, ChevronDown, ArrowRight } from "lucide-react";
import { SortableGoalItem } from "./SortableGoalItem";

interface TodayGoalsProps {
  goals: Goal[];
  totalCount: number;
  allGoals: Goal[];
}

export function TodayGoals({ goals, totalCount, allGoals }: TodayGoalsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const { goalOrder, setGoalOrder } = useUIStore();
  const topLevelGoals = allGoals.filter((g) => !g.parentId);
  const overdueCount = allGoals.filter((g) => g.status === "OVERDUE").length;

  const sortedGoals = (() => {
    if (goalOrder.length === 0) return topLevelGoals;
    const savedIds = goalOrder.filter((id) =>
      topLevelGoals.some((g) => g.id === id),
    );
    topLevelGoals.forEach((g) => {
      if (!savedIds.includes(g.id)) {
        savedIds.push(g.id);
      }
    });
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-bg">
            <Target size={18} className="text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-text">
              Active Goals
              {overdueCount > 0 && (
                <span className="ml-2 text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full">
                  {overdueCount} overdue
                </span>
              )}
            </h3>
            <p className="text-xs text-text-muted">{totalCount} total</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isExpanded && (
            <div className="hidden sm:flex items-center gap-1 text-xs text-text-muted">
              {sortedGoals.slice(0, 2).map((g) => (
                <span
                  key={g.id}
                  className="bg-bg px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]"
                >
                  {g.title}
                </span>
              ))}
              {sortedGoals.length > 2 && (
                <span className="text-text-muted">
                  +{sortedGoals.length - 2}
                </span>
              )}
            </div>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} className="text-text-muted" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="px-5 pb-5">
                <SortableContext
                  items={sortedGoals.map((g) => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {sortedGoals.map((goal) => (
                      <SortableGoalItem
                        key={goal.id}
                        goal={goal}
                        allGoals={allGoals}
                      />
                    ))}
                  </div>
                </SortableContext>

                {totalCount > sortedGoals.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/goals"
                      className="flex items-center justify-center gap-2 mt-4 py-2.5 text-sm font-semibold text-primary hover:text-primary-dark bg-primary-bg hover:bg-primary-bg/80 rounded-xl transition-all group"
                    >
                      View all {totalCount} goals
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight size={14} />
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              </div>

              <DragOverlay>
                {activeId ? (
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1.05 }}
                    className="shadow-xl bg-surface rounded-xl border-2 border-primary/30 p-3"
                  >
                    <span className="text-sm font-medium text-text">
                      {sortedGoals.find((g) => g.id === activeId)?.title || ""}
                    </span>
                  </motion.div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
