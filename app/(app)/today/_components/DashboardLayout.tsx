"use client";

import React, { useState } from "react";
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
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group break-inside-avoid"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-border-light opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing"
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

  // Filter out null sections
  const visibleSections = sectionOrder.filter((id) => sections[id] != null);

  return (
    <div>
      {/* Layout controls */}
      <div className="flex items-center justify-end gap-1 mb-4">
        <button
          onClick={() => setLayoutMode("single")}
          className={`p-2 rounded-lg transition-all ${
            layoutMode === "single"
              ? "bg-primary-bg text-primary"
              : "text-text-muted hover:text-text hover:bg-border-light"
          }`}
          title="Single column"
        >
          <Rows size={16} />
        </button>
        <button
          onClick={() => setLayoutMode("double")}
          className={`p-2 rounded-lg transition-all ${
            layoutMode === "double"
              ? "bg-primary-bg text-primary"
              : "text-text-muted hover:text-text hover:bg-border-light"
          }`}
          title="Two columns"
        >
          <Columns size={16} />
        </button>
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
            {visibleSections.map((sectionId) => (
              <SortableSection key={sectionId} id={sectionId}>
                <React.Fragment key={sectionId}>
                  {sections[sectionId]}
                </React.Fragment>
              </SortableSection>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId && sections[activeId] ? (
            <div className="opacity-90 scale-105 shadow-lg rotate-1">
              {sections[activeId]}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
