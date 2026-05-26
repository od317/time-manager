"use client";

import { useEffect } from "react";
import { useTimerStore } from "@/store/timerStore";

export function TimerTitle() {
  const runningTimer = useTimerStore((state) => state.runningTimer);

  useEffect(() => {
    if (runningTimer?.status !== "RUNNING" || !runningTimer.startTime) {
      document.title = "TimeFlow";
      return;
    }

    const startTime = new Date(runningTimer.startTime).getTime();

    const formatTime = (seconds: number): string => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) {
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      }
      return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const updateTitle = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      document.title = `⏱ ${formatTime(elapsed)} - TimeFlow`;
    };

    updateTitle();
    const interval = setInterval(updateTitle, 1000);

    return () => {
      clearInterval(interval);
      document.title = "TimeFlow";
    };
  }, [runningTimer]);

  return null;
}
