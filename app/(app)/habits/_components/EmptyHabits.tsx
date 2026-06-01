"use client";

import { motion } from "framer-motion";
import { Repeat, Sparkles } from "lucide-react";
import Link from "next/link";

export function EmptyHabits() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20"
    >
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-20 h-20 bg-gradient-to-br from-secondary-bg to-primary-bg rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
      >
        <Repeat size={36} className="text-secondary" />
      </motion.div>

      <h3 className="text-xl font-bold text-text mb-2">No habits yet</h3>
      <p className="text-text-muted text-sm max-w-md mx-auto mb-8 leading-relaxed">
        Build lasting routines by creating daily or weekly habits. Track your
        streaks and stay consistent!
      </p>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-block"
      >
        <Link
          href="/create?tab=habit"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group"
        >
          <Sparkles size={18} className="group-hover:animate-pulse" />
          Create your first habit
        </Link>
      </motion.div>

      {/* Decorative elements */}
      <div className="mt-12 flex items-center justify-center gap-2 text-text-muted text-xs">
        <span>🏃‍♂️ Exercise</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>📚 Reading</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>🧘 Meditation</span>
      </div>
    </motion.div>
  );
}
