"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Columns, Rows } from "lucide-react";

interface DashboardLayoutProps {
  habitsSection: React.ReactNode;
  tasksSection: React.ReactNode;
  goalsSection: React.ReactNode;
}

function SortableSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group break-inside-avoid transition-all duration-200 ${
        isDragging ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 z-10 p-2 rounded-xl text-text-muted hover:text-text hover:bg-border-light opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing bg-surface/80 backdrop-blur-sm"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
}

export function DashboardLayout({
  habitsSection,
  tasksSection,
  goalsSection,
}: DashboardLayoutProps) {
  const { layoutMode, sectionOrder, setLayoutMode, setSectionOrder } =
    useUIStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);
      setSectionOrder(arrayMove(sectionOrder, oldIndex, newIndex));
    }
  };

  const sections: Record<string, React.ReactNode> = {
    habits: habitsSection,
    tasks: tasksSection,
    goals: goalsSection,
  };

  const visibleSections = sectionOrder.filter((id) => sections[id] != null);

  const layoutOptions = [
    { mode: "single" as const, icon: Rows, label: "Single column" },
    { mode: "double" as const, icon: Columns, label: "Two columns" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Layout controls */}
      <div className="flex items-center justify-end gap-1.5 mb-4">
        <div className="flex gap-1 p-1 bg-bg rounded-xl border border-border">
          {layoutOptions.map((option) => (
            <motion.button
              key={option.mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLayoutMode(option.mode)}
              className={`p-2 rounded-lg transition-all relative ${
                layoutMode === option.mode
                  ? "text-primary"
                  : "text-text-muted hover:text-text"
              }`}
              title={option.label}
            >
              {layoutMode === option.mode && (
                <motion.div
                  layoutId="layoutActive"
                  className="absolute inset-0 bg-surface rounded-lg shadow-sm border border-border"
                  transition={{ duration: 0.2 }}
                />
              )}
              <option.icon size={16} className="relative z-10" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Draggable sections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleSections}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={
              layoutMode === "double"
                ? "columns-1 lg:columns-2 gap-4 space-y-4"
                : "space-y-4"
            }
          >
            <AnimatePresence mode="popLayout">
              {visibleSections.map((sectionId) => (
                <SortableSection key={sectionId} id={sectionId}>
                  {sections[sectionId]}
                </SortableSection>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && sections[activeId] ? (
            <div className="opacity-95 scale-[1.02] shadow-2xl rounded-2xl">
              {sections[activeId]}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </motion.div>
  );
}
