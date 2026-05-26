"use client";

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

  return (
    <div className="space-y-3">
      {topLevelGoals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          subGoals={getChildGoals(goal.id)}
          allGoals={goals}
        />
      ))}
    </div>
  );
}
