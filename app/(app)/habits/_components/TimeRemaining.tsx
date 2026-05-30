"use client";

import { useState, useEffect } from "react";
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
    const interval = setInterval(update, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex items-center gap-1.5 text-xs ${
        isUrgent ? "text-danger" : "text-text-muted"
      }`}
    >
      <Clock size={12} className={isUrgent ? "animate-pulse" : ""} />
      <span>{timeLeft} left today</span>
    </div>
  );
}
