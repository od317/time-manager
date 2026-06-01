"use client";

import { motion } from "framer-motion";

export function PageHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-2xl font-bold text-text">Create New</h1>
      <p className="text-text-muted text-sm mt-2">
        Set up goals, habits, and tasks to track your progress
      </p>
    </motion.div>
  );
}
