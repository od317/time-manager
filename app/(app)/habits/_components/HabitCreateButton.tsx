"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";

export function HabitCreateButton() {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Link
        href="/create?tab=habit"
        className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group"
      >
        <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
          <Plus size={18} />
        </motion.div>
        <span className="hidden sm:inline">New Habit</span>
        <Sparkles
          size={14}
          className="hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </Link>
    </motion.div>
  );
}
