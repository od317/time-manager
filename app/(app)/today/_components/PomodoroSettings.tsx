"use client";

import { useState } from "react";
import { useTimerStore } from "@/store/timerStore";
import { POMODORO_PRESETS } from "@/lib/constants";
import { X, Settings, Clock, Zap, Coffee } from "lucide-react";

export function PomodoroSettings() {
  const { pomodoroConfig, runningTimer } = useTimerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("classic");
  const [workDuration, setWorkDuration] = useState(pomodoroConfig.workDuration);
  const [shortBreakDuration, setShortBreakDuration] = useState(
    pomodoroConfig.shortBreakDuration,
  );
  const [longBreakDuration, setLongBreakDuration] = useState(
    pomodoroConfig.longBreakDuration,
  );
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    pomodoroConfig.sessionsBeforeLongBreak,
  );
  const [saved, setSaved] = useState(false);

  const isActive =
    runningTimer?.status === "RUNNING" || runningTimer?.status === "PAUSED";

  const handlePresetSelect = (preset: (typeof POMODORO_PRESETS)[number]) => {
    setSelectedPreset(preset.id);
    setWorkDuration(preset.workDuration);
    setShortBreakDuration(preset.shortBreakDuration);
    setLongBreakDuration(preset.longBreakDuration);
    setSessionsBeforeLongBreak(preset.sessionsBeforeLongBreak);
  };

  const handleSave = () => {
    useTimerStore.setState({
      pomodoroConfig: {
        workDuration: workDuration * 60,
        shortBreakDuration: shortBreakDuration * 60,
        longBreakDuration: longBreakDuration * 60,
        sessionsBeforeLongBreak,
      },
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isActive}
        className={`p-2 rounded-lg transition-all ${
          isActive
            ? "text-text-muted cursor-not-allowed"
            : "text-text-muted hover:text-text hover:bg-border-light"
        }`}
        title={isActive ? "Stop timer to change settings" : "Pomodoro settings"}
      >
        <Settings size={18} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-surface rounded-xl border border-border shadow-lg z-50 animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-text">
              Pomodoro Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Presets */}
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">
                Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {POMODORO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedPreset === preset.id
                        ? "border-primary bg-primary-bg/30"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <p className="text-sm font-medium text-text">
                      {preset.name}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-text-muted">
                      <span>{preset.workDuration}m</span>
                      <span>·</span>
                      <span>{preset.shortBreakDuration}m</span>
                      <span>·</span>
                      <span>{preset.longBreakDuration}m</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom settings */}
            {selectedPreset === "custom" && (
              <div className="space-y-3 pt-2 border-t border-border">
                {/* Work Duration */}
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                    <Clock size={14} className="text-danger" />
                    Work Duration (minutes)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setWorkDuration(Math.max(1, workDuration - 5))
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={workDuration}
                      onChange={(e) =>
                        setWorkDuration(
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      min="1"
                      max="120"
                    />
                    <button
                      onClick={() =>
                        setWorkDuration(Math.min(120, workDuration + 5))
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Short Break */}
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                    <Coffee size={14} className="text-success" />
                    Short Break (minutes)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setShortBreakDuration(
                          Math.max(1, shortBreakDuration - 1),
                        )
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={shortBreakDuration}
                      onChange={(e) =>
                        setShortBreakDuration(
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      min="1"
                      max="30"
                    />
                    <button
                      onClick={() =>
                        setShortBreakDuration(
                          Math.min(30, shortBreakDuration + 1),
                        )
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Long Break */}
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 flex items-center gap-2">
                    <Zap size={14} className="text-warning" />
                    Long Break (minutes)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setLongBreakDuration(Math.max(1, longBreakDuration - 5))
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={longBreakDuration}
                      onChange={(e) =>
                        setLongBreakDuration(
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg text-text text-center focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      min="1"
                      max="60"
                    />
                    <button
                      onClick={() =>
                        setLongBreakDuration(
                          Math.min(60, longBreakDuration + 5),
                        )
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Sessions before long break */}
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5">
                    Sessions before long break
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSessionsBeforeLongBreak(
                          Math.max(1, sessionsBeforeLongBreak - 1),
                        )
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-lg font-semibold text-text">
                      {sessionsBeforeLongBreak}
                    </span>
                    <button
                      onClick={() =>
                        setSessionsBeforeLongBreak(
                          Math.min(10, sessionsBeforeLongBreak + 1),
                        )
                      }
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text hover:border-primary/30"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-bg rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium text-text-muted">
                Session Summary
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Total cycle</span>
                <span className="text-text font-medium">
                  {workDuration * sessionsBeforeLongBreak +
                    shortBreakDuration * (sessionsBeforeLongBreak - 1) +
                    longBreakDuration}
                  m
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Work time</span>
                <span className="text-text font-medium">
                  {workDuration * sessionsBeforeLongBreak}m
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">Break time</span>
                <span className="text-text font-medium">
                  {shortBreakDuration * (sessionsBeforeLongBreak - 1) +
                    longBreakDuration}
                  m
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleSave}
              className={`w-full py-2.5 rounded-lg font-medium transition-all ${
                saved
                  ? "bg-success text-white"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              {saved ? "✓ Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
