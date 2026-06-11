"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { goalService } from "@/lib/services";
import { CreateGoalPayload, Priority, GoalType } from "@/types";
import { ColorPicker } from "../../goals/_components/ColorPicker";
import { DEFAULT_GOAL_COLOR } from "@/lib/constants";
import { CreateSummary } from "./CreateSummary";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Save,
} from "lucide-react";
import { useDataStore } from "@/store/dataStore";

interface GoalFormSectionProps {
  selectedDate: Date | null;
  selectedTime: string;
  endDate: Date | null;
  endTime: string;
  onSuccess: () => void;
}

const priorities: { value: Priority; label: string; className: string }[] = [
  { value: "LOW", label: "Low", className: "bg-blue-500 text-white" },
  { value: "MEDIUM", label: "Medium", className: "bg-indigo-500 text-white" },
  { value: "HIGH", label: "High", className: "bg-amber-500 text-white" },
  { value: "URGENT", label: "Urgent", className: "bg-red-500 text-white" },
];

export function GoalFormSection({
  selectedDate,
  selectedTime,
  endDate,
  endTime,
  onSuccess,
}: GoalFormSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [goalType, setGoalType] = useState<GoalType>("quantity");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [color, setColor] = useState(DEFAULT_GOAL_COLOR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const formatDisplayTime = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!selectedDate) {
      setError("Please select a start date from the calendar");
      return;
    }

    setIsSubmitting(true);
    try {
      const startDate = selectedTime
        ? new Date(`${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`)
        : selectedDate;

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
        color,
        startDate: startDate.toISOString(),
        endDate: endDate
          ? endTime
            ? new Date(
                `${format(endDate, "yyyy-MM-dd")}T${endTime}:00`,
              ).toISOString()
            : endDate.toISOString()
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
      onSuccess();
      router.refresh();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      if (err?.code === "NETWORK_ERROR") {
        setError("Unable to connect. Please check your internet connection.");
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Failed to create goal. Please try again.");
      }
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
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6"
    >
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
          placeholder="What do you want to achieve? (optional)"
        />
      </div>

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

      {/* Target Value & Unit */}
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
                placeholder={goalType === "time" ? "e.g., 10" : "e.g., 100"}
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

      {/* Start Date Display */}
      <div>
        <label className="block text-sm font-bold text-text mb-2">
          Start Date *
        </label>
        {selectedDate ? (
          <div className="flex items-center gap-3 p-4 bg-primary-bg/30 rounded-xl border-2 border-primary/20">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar size={18} className="text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary flex-1">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </span>
            {selectedTime && (
              <>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock size={18} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatDisplayTime(selectedTime)}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-bg rounded-xl border-2 border-dashed border-border">
            <Calendar size={18} className="text-text-muted" />
            <span className="text-sm text-text-muted font-medium">
              Pick a date from the calendar →
            </span>
          </div>
        )}
      </div>

      {/* End Date Display */}
      {endDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <label className="block text-sm font-bold text-text mb-2">
            End Date
          </label>
          <div className="flex items-center gap-3 p-4 bg-primary-bg/30 rounded-xl border-2 border-primary/20">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar size={18} className="text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary flex-1">
              {format(endDate, "EEEE, MMMM d, yyyy")}
            </span>
            {endTime && (
              <>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock size={18} className="text-primary" />
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatDisplayTime(endTime)}
                </span>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* End Date Warning */}
      {endDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <p className="text-[11px] text-amber-500 bg-amber-50 dark:bg-amber-950 px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
            ⚠️ Miss the deadline? Your goal goes {"Overdue"} for 30 days, then
            auto-fails. Choose wisely!
          </p>
        </motion.div>
      )}

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

      {/* Color */}
      <ColorPicker value={color} onChange={setColor} />

      {/* Preview */}
      <CreateSummary
        type="goal"
        title={title}
        description={description}
        priority={priority}
        color={color}
        goalType={goalType}
        targetValue={goalType !== "project" ? targetValue : undefined}
        unit={goalType !== "project" ? unit : undefined}
        selectedDate={selectedDate}
        selectedTime={selectedTime ? formatDisplayTime(selectedTime) : ""}
      />

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t-2 border-border">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.back()}
          className="flex-1 py-3 px-4 border-2 border-border text-text-secondary rounded-xl font-semibold hover:bg-border-light transition-all"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || !title.trim() || !selectedDate}
          className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Creating...
            </>
          ) : (
            <>
              <Save size={18} />
              Create Goal
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
