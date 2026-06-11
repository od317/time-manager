"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Save,
  Target,
  CalendarIcon,
} from "lucide-react";
import { goalService } from "@/lib/services";
import { CreateGoalPayload, Priority, GoalType } from "@/types";
import { DEFAULT_GOAL_COLOR } from "@/lib/constants";
import { ColorPicker } from "./ColorPicker";
import { Calendar } from "@/components/calendar/Calendar";
import { format } from "date-fns";
import { useDataStore } from "@/store/dataStore";

interface GoalFormProps {
  onClose: () => void;
  parentId?: string | null;
  parentColor?: string | null;
}

const priorities: { value: Priority; label: string; className: string }[] = [
  { value: "LOW", label: "Low", className: "bg-blue-500 text-white" },
  { value: "MEDIUM", label: "Medium", className: "bg-indigo-500 text-white" },
  { value: "HIGH", label: "High", className: "bg-amber-500 text-white" },
  { value: "URGENT", label: "Urgent", className: "bg-red-500 text-white" },
];

export function GoalForm({ onClose, parentId, parentColor }: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [goalType, setGoalType] = useState<GoalType>("quantity");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [color, setColor] = useState(parentColor || DEFAULT_GOAL_COLOR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
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
    setSuccess(false);

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
        targetValue:
          goalType !== "project" && targetValue
            ? parseFloat(targetValue)
            : undefined,
        unit:
          goalType === "time"
            ? unit || "hours"
            : goalType === "quantity"
              ? unit.trim() || undefined
              : undefined,
        color: isSubGoal ? undefined : color,
        parentId,
        startDate: selectedStartDate
          ? format(selectedStartDate, "yyyy-MM-dd") + "T00:00:00.000Z"
          : undefined,
        endDate: selectedEndDate
          ? format(selectedEndDate, "yyyy-MM-dd") + "T00:00:00.000Z"
          : undefined,
      };

      const newGoal = await goalService.create(payload);

      const state = useDataStore.getState();
      useDataStore.setState({
        allGoals: [...state.allGoals, newGoal],
        goals:
          newGoal.status === "ACTIVE" || newGoal.status === "OVERDUE"
            ? [...state.goals, newGoal]
            : state.goals,
      });

      setSuccess(true);
      setTitle("");
      setDescription("");
      setTargetValue("");
      setUnit("");

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 800);
    } catch {
      setError("Failed to create goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goalTypes = [
    { type: "quantity" as GoalType, label: "Quantity", icon: "📏" },
    { type: "time" as GoalType, label: "Time", icon: "⏱️" },
    { type: "project" as GoalType, label: "Project", icon: "📂" },
  ];

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
          <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-bg">
                <Target size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">
                  {isSubGoal ? "Create Sub-Goal" : "Create Goal"}
                </h3>
                {isSubGoal && (
                  <p className="text-xs text-text-muted">
                    Inherits parent color and deadline
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
            >
              <X size={20} />
            </button>
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
                    className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-4 text-sm font-medium flex items-center gap-2"
                  >
                    <AlertTriangle size={16} />
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-success-bg text-success border border-success/20 rounded-xl p-4 text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Goal created successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-text mb-2">
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
                <label className="block text-sm font-bold text-text mb-2">
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

              {/* Color Picker - Locked for sub-goals */}
              <ColorPicker
                value={color}
                onChange={setColor}
                disabled={isColorLocked}
              />

              {/* Goal Type */}
              <div>
                <label className="block text-sm font-bold text-text mb-2">
                  Goal Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {goalTypes.map(({ type, label, icon }) => (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setGoalType(type);
                        setUnit(type === "time" ? "hours" : "");
                        if (type === "project") setTargetValue("");
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

              {/* Target Value & Unit - Only for quantity/time */}
              {goalType !== "project" && (
                <div>
                  <label className="block text-sm font-bold text-text mb-2">
                    Target Value & Unit
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                        placeholder={
                          goalType === "time" ? "e.g., 10" : "e.g., 100"
                        }
                        min="0"
                        step={goalType === "time" ? "0.5" : "1"}
                      />
                    </div>
                    <div className="col-span-2">
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
                          placeholder="e.g., words"
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <label className="block text-sm font-bold text-text mb-2">
                  Timeline
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      Start Date
                    </label>
                    {selectedStartDate ? (
                      <div className="flex items-center gap-2 p-2.5 bg-primary-bg/20 rounded-xl border border-primary/20">
                        <CalendarIcon size={14} className="text-primary" />
                        <span className="text-xs font-medium text-primary flex-1">
                          {format(selectedStartDate, "MMM d, yyyy")}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedStartDate(null)}
                          className="p-0.5 text-text-muted hover:text-danger"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowStartCalendar(!showStartCalendar)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-primary/30 hover:text-text transition-all text-xs"
                      >
                        <CalendarIcon size={14} /> Pick date
                      </button>
                    )}
                    <AnimatePresence>
                      {showStartCalendar && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2"
                        >
                          <Calendar
                            selectedDate={selectedStartDate}
                            onDateSelect={(date) => {
                              setSelectedStartDate(date);
                              setShowStartCalendar(false);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1.5">
                      End Date
                    </label>
                    {selectedEndDate ? (
                      <div className="flex items-center gap-2 p-2.5 bg-primary-bg/20 rounded-xl border border-primary/20">
                        <CalendarIcon size={14} className="text-primary" />
                        <span className="text-xs font-medium text-primary flex-1">
                          {format(selectedEndDate, "MMM d, yyyy")}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedEndDate(null)}
                          className="p-0.5 text-text-muted hover:text-danger"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowEndCalendar(!showEndCalendar)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-border text-text-muted hover:border-primary/30 hover:text-text transition-all text-xs"
                      >
                        <CalendarIcon size={14} /> Pick date
                      </button>
                    )}
                    <AnimatePresence>
                      {showEndCalendar && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2"
                        >
                          <Calendar
                            selectedDate={selectedEndDate}
                            onDateSelect={(date) => {
                              setSelectedEndDate(date);
                              setShowEndCalendar(false);
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                {selectedEndDate && (
                  <p className="text-[11px] text-amber-500 bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800 mt-3">
                    ⚠️ Miss the deadline? Your goal goes {"Overdue"} for 30
                    days, then auto-fails. Choose wisely!
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-text mb-3">
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
                      className={`py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                        priority === p.value
                          ? `${p.className} shadow-lg`
                          : "bg-bg text-text-secondary border-2 border-border hover:border-primary/30"
                      }`}
                    >
                      {p.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-border flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-border text-text-secondary rounded-xl font-semibold hover:bg-border-light transition-all"
            >
              Cancel
            </button>
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
