"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Goal } from "@/types";
import { GoalCard } from "./GoalCard";
import { EmptyGoals } from "./EmptyGoals";

const filters = [
  { label: "Active", value: "ACTIVE" },
  { label: "All", value: "" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Archived", value: "ARCHIVED" },
  { label: "Failed", value: "FAILED" },
];

interface GoalListWithFiltersProps {
  goals: Goal[];
}

export function GoalListWithFilters({ goals }: GoalListWithFiltersProps) {
  const [filterStatus, setFilterStatus] = useState("ACTIVE");

  const visibleGoals = useMemo(() => {
    if (!filterStatus) return goals;

    // Active filter also shows overdue
    const statuses =
      filterStatus === "ACTIVE" ? ["ACTIVE", "OVERDUE"] : [filterStatus];
    const matchingGoals = goals.filter((g) => statuses.includes(g.status));

    const parentIds = new Set<string>();
    matchingGoals.forEach((g) => {
      let current = g;
      while (current.parentId) {
        parentIds.add(current.parentId);
        current = goals.find((p) => p.id === current.parentId) || current;
        if (!current.parentId) break;
      }
    });

    return goals.filter(
      (g) => g.status === filterStatus || parentIds.has(g.id),
    );
  }, [goals, filterStatus]);

  const topLevelGoals = visibleGoals.filter((g) => !g.parentId);

  const getChildGoals = (parentId: string) =>
    visibleGoals.filter((g) => g.parentId === parentId);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl border border-border w-fit flex-wrap">
        {filters.map((filter) => (
          <motion.button
            key={filter.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterStatus(filter.value)}
            className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === filter.value
                ? "text-text"
                : "text-text-muted hover:text-text"
            }`}
          >
            {filterStatus === filter.value && (
              <motion.div
                layoutId="activeGoalFilter"
                className="absolute inset-0 bg-surface rounded-xl shadow-sm border border-border"
                transition={{ duration: 0.15 }}
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-text-muted">
        {visibleGoals.length} goal{visibleGoals.length !== 1 ? "s" : ""}
        {filterStatus ? ` (${filterStatus.toLowerCase()})` : " total"}
      </p>

      {/* List */}
      <AnimatePresence mode="wait">
        {visibleGoals.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.1 }}
          >
            <EmptyGoals />
          </motion.div>
        ) : (
          // REPLACE THIS motion.div WITH THE FAST VERSION:
          <div
            key={filterStatus || "all"}
            className="space-y-3 transition-opacity duration-75"
          >
            {topLevelGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                subGoals={getChildGoals(goal.id)}
                allGoals={goals}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
