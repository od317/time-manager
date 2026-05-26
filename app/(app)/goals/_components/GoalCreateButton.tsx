"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GoalForm } from "./GoalForm";

export function GoalCreateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">New Goal</span>
      </button>

      {isOpen && <GoalForm onClose={() => setIsOpen(false)} />}
    </>
  );
}
