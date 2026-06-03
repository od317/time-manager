"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTimerStore } from "@/store/timerStore";
import { POMODORO_PRESETS } from "@/lib/constants";
import { X, Settings, Clock, Zap, Coffee, Check } from "lucide-react";

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

    if (preset.id !== "custom") {
      const config = {
        workDuration: preset.workDuration * 60,
        shortBreakDuration: preset.shortBreakDuration * 60,
        longBreakDuration: preset.longBreakDuration * 60,
        sessionsBeforeLongBreak: preset.sessionsBeforeLongBreak,
      };
      useTimerStore.setState({
        pomodoroConfig: config,
        selectedPreset: preset.id,
      });
    }
  };

  const handleSave = () => {
    useTimerStore.setState({
      pomodoroConfig: {
        workDuration: workDuration * 60,
        shortBreakDuration: shortBreakDuration * 60,
        longBreakDuration: longBreakDuration * 60,
        sessionsBeforeLongBreak,
      },
      selectedPreset: selectedPreset, // 👈 Add this
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1000);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={!isActive ? { scale: 1.1, rotate: 90 } : {}}
        whileTap={!isActive ? { scale: 0.9 } : {}}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isActive}
        className={`p-2 rounded-xl transition-all ${
          isActive
            ? "text-text-muted cursor-not-allowed"
            : "text-text-muted hover:text-text hover:bg-border-light"
        }`}
        title={isActive ? "Stop timer to change settings" : "Pomodoro settings"}
      >
        <Settings size={18} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 bg-surface rounded-2xl border border-border shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-bold text-text">Pomodoro Settings</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
              >
                <X size={18} />
              </motion.button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Presets */}
              <div>
                <label className="text-sm font-semibold text-text mb-3 block">
                  Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {POMODORO_PRESETS.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedPreset === preset.id
                          ? "border-primary bg-primary-bg/50"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-text">
                          {preset.name}
                        </p>
                        {selectedPreset === preset.id && (
                          <Check size={14} className="text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-text-muted mb-2">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium">
                        <span className="bg-bg px-2 py-0.5 rounded-full">
                          {preset.workDuration}m
                        </span>
                        <span className="bg-bg px-2 py-0.5 rounded-full">
                          {preset.shortBreakDuration}m
                        </span>
                        <span className="bg-bg px-2 py-0.5 rounded-full">
                          {preset.longBreakDuration}m
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Custom settings */}
              {selectedPreset === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  {/* Work Duration */}
                  <div>
                    <label className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
                      <Clock size={16} className="text-danger" />
                      Work Duration (minutes)
                    </label>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setWorkDuration(Math.max(1, workDuration - 5))
                        }
                        className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                      >
                        -
                      </motion.button>
                      <input
                        type="number"
                        value={workDuration}
                        onChange={(e) =>
                          setWorkDuration(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border bg-bg text-text text-center font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        min="1"
                        max="120"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setWorkDuration(Math.min(120, workDuration + 5))
                        }
                        className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Short Break */}
                  <div>
                    <label className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
                      <Coffee size={16} className="text-success" />
                      Short Break (minutes)
                    </label>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setShortBreakDuration(
                            Math.max(1, shortBreakDuration - 1),
                          )
                        }
                        className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                      >
                        -
                      </motion.button>
                      <input
                        type="number"
                        value={shortBreakDuration}
                        onChange={(e) =>
                          setShortBreakDuration(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border bg-bg text-text text-center font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        min="1"
                        max="30"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setShortBreakDuration(
                            Math.min(30, shortBreakDuration + 1),
                          )
                        }
                        className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Long Break & Sessions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
                        <Zap size={16} className="text-warning" />
                        Long Break
                      </label>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setLongBreakDuration(
                              Math.max(1, longBreakDuration - 5),
                            )
                          }
                          className="w-8 h-8 rounded-lg border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                        >
                          -
                        </motion.button>
                        <input
                          type="number"
                          value={longBreakDuration}
                          onChange={(e) =>
                            setLongBreakDuration(
                              Math.max(1, parseInt(e.target.value) || 1),
                            )
                          }
                          className="flex-1 px-2 py-2 rounded-lg border-2 border-border bg-bg text-text text-center font-bold text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                          min="1"
                          max="60"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setLongBreakDuration(
                              Math.min(60, longBreakDuration + 5),
                            )
                          }
                          className="w-8 h-8 rounded-lg border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                        >
                          +
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-text mb-2 block">
                        Sessions
                      </label>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setSessionsBeforeLongBreak(
                              Math.max(1, sessionsBeforeLongBreak - 1),
                            )
                          }
                          className="w-8 h-8 rounded-lg border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                        >
                          -
                        </motion.button>
                        <span className="flex-1 text-center text-lg font-bold text-text">
                          {sessionsBeforeLongBreak}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            setSessionsBeforeLongBreak(
                              Math.min(10, sessionsBeforeLongBreak + 1),
                            )
                          }
                          className="w-8 h-8 rounded-lg border-2 border-border flex items-center justify-center text-text font-bold hover:border-primary/30"
                        >
                          +
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Summary */}
              <div className="bg-bg rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Session Summary
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-surface rounded-xl">
                    <p className="text-lg font-bold text-text">
                      {workDuration * sessionsBeforeLongBreak +
                        shortBreakDuration * (sessionsBeforeLongBreak - 1) +
                        longBreakDuration}
                    </p>
                    <p className="text-[10px] text-text-muted">Total min</p>
                  </div>
                  <div className="text-center p-2 bg-surface rounded-xl">
                    <p className="text-lg font-bold text-danger">
                      {workDuration * sessionsBeforeLongBreak}
                    </p>
                    <p className="text-[10px] text-text-muted">Work min</p>
                  </div>
                  <div className="text-center p-2 bg-surface rounded-xl">
                    <p className="text-lg font-bold text-success">
                      {shortBreakDuration * (sessionsBeforeLongBreak - 1) +
                        longBreakDuration}
                    </p>
                    <p className="text-[10px] text-text-muted">Break min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-border bg-bg">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className={`w-full py-3 rounded-2xl font-semibold transition-all ${
                  saved
                    ? "bg-success text-white"
                    : "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                }`}
              >
                {saved ? "✓ Saved!" : "Save Settings"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
