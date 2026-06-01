"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ChevronDown, ChevronRight, Repeat, Sparkles } from "lucide-react";
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

  const isCompleted = (habit: Habit): boolean => {
    if (completedIds.has(habit.id)) return true;
    const todayLog = habit.logs?.find((log) => {
      if (log.status !== "COMPLETED") return false;
      return new Date(log.date).toLocaleDateString("en-CA") === todayStr;
    });
    return !!todayLog;
  };

  const uncompleted = habits.filter((h) => !isCompleted(h));
  const completed = habits.filter((h) => isCompleted(h));

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
  };

  const completionPercentage =
    habits.length > 0
      ? Math.round((completed.length / habits.length) * 100)
      : 0;

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl border border-border shadow-sm p-5"
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary-bg">
              <Repeat size={18} className="text-secondary" />
            </div>
            <h3 className="text-sm font-bold text-text">Today&apos;s Habits</h3>
          </div>
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center py-8"
            >
              <Sparkles
                size={32}
                className="text-text-muted mx-auto mb-3 opacity-50"
              />
              <p className="text-sm text-text-muted font-medium">
                No habits scheduled for today
              </p>
              <p className="text-xs text-text-muted mt-1">
                Create daily habits to build consistency
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-bg/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary-bg">
            <Repeat size={18} className="text-secondary" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-text">Today&apos;s Habits</h3>
            <p className="text-xs text-text-muted">
              {completed.length} of {habits.length} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-border"
              />
              <motion.circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="text-secondary"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: completionPercentage / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeDasharray={`${2 * Math.PI * 16}`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-secondary">
              {completionPercentage}%
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={18} className="text-text-muted" />
          </motion.div>
        </div>
      </button>

      {/* Content */}
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
              <div className="px-5 pb-5 space-y-3">
                {/* Uncompleted habits */}
                <SortableContext
                  items={uncompleted.map((h) => h.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {uncompleted.map((habit) => (
                        <SortableHabitItem
                          key={habit.id}
                          habit={habit}
                          todayStr={todayStr}
                          onComplete={handleComplete}
                          isLoading={loadingId === habit.id}
                          isCompleted={false}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>

                {/* Completed habits */}
                {completed.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <motion.button
                      whileHover={{ x: 4 }}
                      onClick={() => setShowCompleted(!showCompleted)}
                      className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text transition-colors py-1"
                    >
                      <motion.div
                        animate={{ rotate: showCompleted ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight size={14} />
                      </motion.div>
                      <span>Completed</span>
                      <span className="bg-success-bg text-success px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {completed.length}
                      </span>
                    </motion.button>

                    <AnimatePresence>
                      {showCompleted && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <SortableContext
                            items={completed.map((h) => h.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2 mt-3">
                              {completed.map((habit) => (
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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
                      {habits.find((h) => h.id === activeId)?.title || ""}
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
