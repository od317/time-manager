"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary-bg">
          <BarChart3 size={28} className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text">Analytics</h2>
          <p className="text-text-muted text-sm mt-1">
            Track your progress, habits, and productivity patterns
          </p>
        </div>
      </div>
    </motion.div>
  );
}
