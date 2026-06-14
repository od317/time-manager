"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { habitService } from "@/lib/services";
import { CreateHabitPayload, FrequencyType } from "@/types";
import { ColorPicker } from "../../goals/_components/ColorPicker";
import { DEFAULT_GOAL_COLOR } from "@/lib/constants";
import { CreateSummary } from "./CreateSummary";
import {
  Calendar,
  Clock,
  Repeat,
  Minus,
  Plus,
  AlertTriangle,
  CheckCircle,
  Save,
} from "lucide-react";
import { useDataStore } from "@/store/dataStore";

interface HabitFormSectionProps {
  onSuccess: () => void;
}

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const FREQUENCY_OPTIONS: {
  value: FrequencyType;
  label: string;
  description: string;
  icon: typeof Repeat;
}[] = [
  {
    value: "DAILY",
    label: "Daily",
    description: "Every day",
    icon: Calendar,
  },
  {
    value: "WEEKLY",
    label: "Weekly",
    description: "Specific days",
    icon: Repeat,
  },
  {
    value: "CUSTOM",
    label: "Custom",
    description: "Your schedule",
    icon: Clock,
  },
];

export function HabitFormSection({ onSuccess }: HabitFormSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("DAILY");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [trackAmount, setTrackAmount] = useState(false);
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [color, setColor] = useState(DEFAULT_GOAL_COLOR);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day].sort(),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (frequencyType === "WEEKLY" && selectedDays.length === 0) {
      setError("Please select at least one day");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateHabitPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        frequencyType,
        frequencyDays: frequencyType === "WEEKLY" ? selectedDays : [],
        timesPerDay,
        trackAmount,
        targetValue:
          trackAmount && targetValue ? parseFloat(targetValue) : undefined,
        unit: trackAmount ? unit.trim() || undefined : undefined,
        color,
      };

      const newHabit = await habitService.create(payload);

      const state = useDataStore.getState();
      useDataStore.setState({
        allHabits: [...state.allHabits, newHabit],
        habits:
          newHabit.status === "ACTIVE"
            ? [...state.habits, newHabit]
            : state.habits,
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
        setError("Failed to create habit. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6"
    >
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
          placeholder="e.g., Read 1 page, Exercise, Meditate"
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
          placeholder="Why do you want to build this habit? (optional)"
        />
      </div>

      {/* Frequency Type */}
      <div>
        <label className="block text-sm font-bold text-text mb-3">
          Frequency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENCY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = frequencyType === option.value;
            return (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFrequencyType(option.value)}
                className={`relative py-4 px-3 rounded-xl text-sm transition-all border-2 text-center overflow-hidden ${
                  isSelected
                    ? "text-white border-transparent shadow-lg"
                    : "bg-bg text-text-secondary border-border hover:border-primary/30"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="freqBg"
                    className="absolute inset-0 bg-gradient-to-br from-primary to-secondary"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <Icon size={18} className="mx-auto mb-1.5 relative z-10" />
                <p className="font-semibold relative z-10">{option.label}</p>
                <p className="text-xs mt-0.5 opacity-80 relative z-10">
                  {option.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Day Selection (for Weekly) */}
      <AnimatePresence>
        {frequencyType === "WEEKLY" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <label className="block text-sm font-bold text-text mb-3">
              Days of the week
            </label>
            <div className="flex gap-2">
              {WEEKDAYS.map((day) => {
                const isSelected = selectedDays.includes(day.value);
                return (
                  <motion.button
                    key={day.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDay(day.value)}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-md"
                        : "bg-bg text-text-secondary border-2 border-border hover:border-primary/30"
                    }`}
                  >
                    {day.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Times per day */}
      <div>
        <label className="block text-sm font-bold text-text mb-3">
          Times per day
        </label>
        <div className="flex items-center gap-4 p-3 bg-bg rounded-2xl border border-border">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
            className="w-12 h-12 rounded-xl border-2 border-border bg-surface text-text flex items-center justify-center hover:border-primary/30 hover:text-primary transition-all"
          >
            <Minus size={20} />
          </motion.button>

          <motion.span
            key={timesPerDay}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-text w-12 text-center"
          >
            {timesPerDay}
          </motion.span>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTimesPerDay(Math.min(10, timesPerDay + 1))}
            className="w-12 h-12 rounded-xl border-2 border-border bg-surface text-text flex items-center justify-center hover:border-primary/30 hover:text-primary transition-all"
          >
            <Plus size={20} />
          </motion.button>

          <span className="text-sm font-medium text-text-muted ml-2">
            time{timesPerDay > 1 ? "s" : ""} per day
          </span>
        </div>
      </div>

      {/* Track Amount Toggle */}
      <div>
        <motion.label
          whileHover={{ x: 2 }}
          className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-bg transition-colors"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              trackAmount
                ? "bg-primary border-primary"
                : "border-border group-hover:border-primary/50"
            }`}
          >
            {trackAmount && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CheckCircle size={14} className="text-white" />
              </motion.div>
            )}
          </motion.div>
          <input
            type="checkbox"
            checked={trackAmount}
            onChange={(e) => setTrackAmount(e.target.checked)}
            className="hidden"
          />
          <span className="text-sm font-semibold text-text-secondary group-hover:text-text transition-colors">
            Track a specific amount
          </span>
        </motion.label>
      </div>

      {/* Target Value & Unit (if tracking amount) */}
      <AnimatePresence>
        {trackAmount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <label className="block text-sm font-bold text-text mb-3">
              Target Value & Unit
            </label>
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-3">
                <input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="e.g., 1"
                  min="0"
                  step="1"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  placeholder="e.g., pages"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color */}
      <ColorPicker value={color} onChange={setColor} />

      {/* Preview */}
      <CreateSummary
        type="habit"
        title={title}
        description={description}
        priority="MEDIUM"
        color={color}
        frequencyType={frequencyType}
        frequencyDays={selectedDays}
        targetValue={trackAmount ? targetValue : undefined}
        unit={trackAmount ? unit : undefined}
      />

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
            Habit created successfully!
          </motion.div>
        )}
      </AnimatePresence>

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
          disabled={isSubmitting || !title.trim()}
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
              Create Habit
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
