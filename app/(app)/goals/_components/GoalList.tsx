"use client";

import { motion } from "framer-motion";
import { Goal } from "@/types";
import { GoalCard } from "./GoalCard";
import { EmptyGoals } from "./EmptyGoals";

interface GoalListProps {
  goals: Goal[];
}

export function GoalList({ goals }: GoalListProps) {
  if (goals.length === 0) {
    return <EmptyGoals />;
  }

  const topLevelGoals = goals.filter((g) => !g.parentId);
  const getChildGoals = (parentId: string) =>
    goals.filter((g) => g.parentId === parentId);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {topLevelGoals.map((goal) => (
        <motion.div key={goal.id} variants={item} layout>
          <GoalCard
            goal={goal}
            subGoals={getChildGoals(goal.id)}
            allGoals={goals}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
