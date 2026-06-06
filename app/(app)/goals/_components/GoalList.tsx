"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Goal } from "@/types";
import { GoalCard } from "./GoalCard";
import { EmptyGoals } from "./EmptyGoals";
import { useSearchParams } from "next/navigation";

interface GoalListProps {
  goals: Goal[];
}

export function GoalList({ goals }: GoalListProps) {
  const searchParams = useSearchParams();
  const filterStatus = searchParams.get("status") || "";

  const getVisibleGoals = (): Goal[] => {
    if (!filterStatus) return goals;

    const matchingGoals = goals.filter((g) => g.status === filterStatus);

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
  };

  const visibleGoals = getVisibleGoals();

  const topLevelGoals = visibleGoals.filter((g) => !g.parentId);

  const getChildGoals = (parentId: string) =>
    visibleGoals.filter((g) => g.parentId === parentId);

  return (
    <AnimatePresence mode="wait">
      {visibleGoals.length === 0 ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <EmptyGoals />
        </motion.div>
      ) : (
        <motion.div
          key={filterStatus || "all"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-3"
        >
          {topLevelGoals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
            >
              <GoalCard
                goal={goal}
                subGoals={getChildGoals(goal.id)}
                allGoals={goals}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
