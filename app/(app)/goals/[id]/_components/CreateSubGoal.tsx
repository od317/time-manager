"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GoalForm } from "../../_components/GoalForm";

interface CreateSubGoalProps {
  parentId: string;
}

export function CreateSubGoal({ parentId }: CreateSubGoalProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark font-medium transition-all"
      >
        <Plus size={16} />
        Add Sub-goal
      </button>

      {showForm && (
        <GoalForm parentId={parentId} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
