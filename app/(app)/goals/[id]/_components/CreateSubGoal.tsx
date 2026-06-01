"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { GoalForm } from "../../_components/GoalForm";

interface CreateSubGoalProps {
  parentId: string;
}

export function CreateSubGoal({ parentId }: CreateSubGoalProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary-bg hover:bg-primary hover:text-white rounded-xl transition-all"
      >
        <Plus size={16} />
        Add Sub-goal
      </motion.button>

      {showForm && (
        <GoalForm parentId={parentId} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
