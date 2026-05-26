"use client";

import { useTimerStore } from "@/store/timerStore";
import { TimerMode } from "@/types";
import { Clock, Brain, Pencil } from "lucide-react";

const modes: {
  value: TimerMode;
  label: string;
  icon: typeof Clock;
  description: string;
}[] = [
  {
    value: "SIMPLE",
    label: "Simple",
    icon: Clock,
    description: "Manual start/stop",
  },
  {
    value: "POMODORO",
    label: "Pomodoro",
    icon: Brain,
    description: "Work & break intervals",
  },
  {
    value: "QUICK_LOG",
    label: "Quick Log",
    icon: Pencil,
    description: "Log time after",
  },
];

export function TimerModeTabs() {
  const { timerMode, setTimerMode, runningTimer } = useTimerStore();
  const isActive =
    runningTimer?.status === "RUNNING" || runningTimer?.status === "PAUSED";

  return (
    <div className="flex gap-1 p-1 bg-bg rounded-lg">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isSelected = timerMode === mode.value;

        return (
          <button
            key={mode.value}
            onClick={() => setTimerMode(mode.value)}
            disabled={isActive}
            title={isActive ? "Stop the timer first" : mode.description}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              isSelected
                ? "bg-surface text-primary shadow-sm"
                : "text-text-muted hover:text-text"
            } ${isActive ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
