"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getTimeUntilMidnight } from "@/lib/dateUtils";
import { Clock } from "lucide-react";

export function TimeRemaining() {
  const [timeLeft, setTimeLeft] = useState(
    () => getTimeUntilMidnight().formatted,
  );
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const remaining = getTimeUntilMidnight();
      setTimeLeft(remaining.formatted);
      setIsUrgent(remaining.hours === 0 && remaining.minutes < 60);
    };

    update();
    const interval = setInterval(update, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
      className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
        isUrgent ? "bg-danger-bg text-danger" : "bg-bg text-text-muted"
      }`}
    >
      <Clock size={12} className={isUrgent ? "animate-pulse" : ""} />
      <span>{timeLeft} left today</span>
    </motion.div>
  );
}
