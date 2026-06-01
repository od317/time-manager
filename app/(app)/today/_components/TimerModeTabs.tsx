"use client";

import { motion } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { TimerMode } from "@/types";
import { Clock, Brain, Pencil } from "lucide-react";

const modes: {
  value: TimerMode;
  label: string;
  icon: typeof Clock;
  description: string;
  color: string;
}[] = [
  {
    value: "SIMPLE",
    label: "Simple",
    icon: Clock,
    description: "Manual start/stop",
    color: "primary",
  },
  {
    value: "POMODORO",
    label: "Pomodoro",
    icon: Brain,
    description: "Work & break intervals",
    color: "secondary",
  },
  {
    value: "QUICK_LOG",
    label: "Quick Log",
    icon: Pencil,
    description: "Log time after",
    color: "accent",
  },
];

export function TimerModeTabs() {
  const { timerMode, setTimerMode, runningTimer } = useTimerStore();
  const isActive =
    runningTimer?.status === "RUNNING" || runningTimer?.status === "PAUSED";

  return (
    <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = timerMode === mode.value;

        return (
          <motion.button
            key={mode.value}
            whileHover={!isActive ? { scale: 1.02 } : {}}
            whileTap={!isActive ? { scale: 0.98 } : {}}
            onClick={() => setTimerMode(mode.value)}
            disabled={isActive}
            title={isActive ? "Stop the timer first" : mode.description}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
              isSelected ? "text-text" : "text-text-muted hover:text-text"
            } ${isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isSelected && (
              <motion.div
                layoutId="activeMode"
                className="absolute inset-0 bg-surface rounded-xl shadow-sm border border-border"
                transition={{ duration: 0.2 }}
              />
            )}
            <Icon
              size={16}
              className={`relative z-10 ${
                isSelected ? `text-${mode.color}` : ""
              }`}
            />
            <span className="relative z-10 hidden sm:inline">{mode.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
