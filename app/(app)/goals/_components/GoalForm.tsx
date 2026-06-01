"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Save, Target } from "lucide-react";
import { goalService } from "@/lib/services";
import { CreateGoalPayload, Priority, GoalType } from "@/types";
import { DEFAULT_GOAL_COLOR } from "@/lib/constants";
import { ColorPicker } from "./ColorPicker";

interface GoalFormProps {
  onClose: () => void;
  parentId?: string | null;
  parentColor?: string | null;
}

const priorities: {
  value: Priority;
  label: string;
  color: string;
  bg: string;
}[] = [
  { value: "LOW", label: "Low", color: "bg-priority-low", bg: "bg-blue-50" },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "bg-priority-medium",
    bg: "bg-indigo-50",
  },
  {
    value: "HIGH",
    label: "High",
    color: "bg-priority-high",
    bg: "bg-amber-50",
  },
  {
    value: "URGENT",
    label: "Urgent",
    color: "bg-priority-urgent",
    bg: "bg-red-50",
  },
];

export function GoalForm({ onClose, parentId, parentColor }: GoalFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [goalType, setGoalType] = useState<GoalType>("quantity");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [color, setColor] = useState(parentColor || DEFAULT_GOAL_COLOR);
  const [endDate, setEndDate] = useState("");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSubGoal = !!parentId;
  const isColorLocked = isSubGoal;

  useEffect(() => {
    if (parentColor) {
      setColor(parentColor);
    }
  }, [parentColor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateGoalPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        goalType,
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        unit: goalType === "time" ? "hours" : unit.trim() || undefined,
        color: isSubGoal ? undefined : color,
        endDate:
          hasEndDate && endDate ? new Date(endDate).toISOString() : undefined,
        parentId,
      };

      await goalService.create(payload);
      router.refresh();
      onClose();
    } catch {
      setError("Failed to create goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-surface rounded-2xl shadow-2xl border border-border w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-bg/50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-bg">
                <Target size={18} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text">
                {isSubGoal ? "Create Sub-Goal" : "Create Goal"}
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Form Body */}
          <div className="overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-3 text-sm font-medium flex items-center gap-2"
                  >
                    <AlertTriangle size={16} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="e.g., Learn 100 Spanish words"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                  placeholder="What do you want to achieve?"
                />
              </div>

              {/* Color Picker */}
              <ColorPicker
                value={color}
                onChange={setColor}
                disabled={isColorLocked}
              />

              {/* Goal Type */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Goal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      type: "quantity" as GoalType,
                      label: "Quantity",
                      icon: "📏",
                    },
                    {
                      type: "time" as GoalType,
                      label: "Time-based",
                      icon: "⏱️",
                    },
                  ].map(({ type, label, icon }) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setGoalType(type);
                        setUnit(type === "time" ? "hours" : "");
                      }}
                      className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all border-2 ${
                        goalType === type
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-bg text-text-secondary border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="mr-1.5">{icon}</span>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {priorities.map((p) => (
                    <motion.button
                      key={p.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPriority(p.value)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        priority === p.value
                          ? `${p.color} text-white shadow-sm`
                          : "bg-bg text-text-secondary border-2 border-border hover:border-primary/30"
                      }`}
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Target Value & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                    placeholder={goalType === "time" ? "e.g., 10" : "e.g., 100"}
                    min="0"
                    step={goalType === "time" ? "0.5" : "1"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text mb-2">
                    Unit
                  </label>
                  {goalType === "time" ? (
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    >
                      <option value="hours">Hours</option>
                      <option value="minutes">Minutes</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      placeholder="e.g., words, km"
                    />
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                      hasEndDate
                        ? "bg-primary border-primary"
                        : "border-border group-hover:border-primary/50"
                    }`}
                  >
                    {hasEndDate && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2.5 h-2.5 rounded-sm bg-white"
                      />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-text-secondary group-hover:text-text transition-colors">
                    Set deadline
                  </span>
                </label>
                <input
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={(e) => setHasEndDate(e.target.checked)}
                  className="hidden"
                />
                <AnimatePresence>
                  {hasEndDate && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-3 w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-border bg-bg/50 flex-shrink-0">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-border text-text-secondary rounded-xl font-semibold hover:bg-border-light transition-all"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Goal
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
