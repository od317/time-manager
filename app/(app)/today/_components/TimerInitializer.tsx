"use client";

import { useEffect } from "react";
import { Goal } from "@/types";
import { useTimerStore } from "@/store/timerStore";

interface TimerInitializerProps {
  goals: Goal[];
}

export function TimerInitializer({ goals }: TimerInitializerProps) {
  const initializeFromStorage = useTimerStore((s) => s.initializeFromStorage);

  useEffect(() => {
    initializeFromStorage(goals);
  }, []); // Only run once on mount

  return null;
}
