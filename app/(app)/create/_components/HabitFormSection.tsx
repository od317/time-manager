"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { habitService } from "@/lib/services";
import { CreateHabitPayload, FrequencyType } from "@/types";
import { ColorPicker } from "../../goals/_components/ColorPicker";
import { DEFAULT_GOAL_COLOR } from "@/lib/constants";
import { CreateSummary } from "./CreateSummary";
import { Calendar, Clock, Repeat, ChevronDown } from "lucide-react";

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
}[] = [
  { value: "DAILY", label: "Daily", description: "Every day" },
  {
    value: "WEEKLY",
    label: "Weekly",
    description: "Specific days of the week",
  },
  { value: "CUSTOM", label: "Custom", description: "Choose your own schedule" },
];

export function HabitFormSection({ onSuccess }: HabitFormSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("DAILY");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
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

      await habitService.create(payload);

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

  const getFrequencyLabel = (): string => {
    if (frequencyType === "DAILY") return "Every day";
    if (frequencyType === "WEEKLY") {
      return `Every ${selectedDays.map((d) => WEEKDAYS[d].label).join(", ")}`;
    }
    return "Custom";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="lg:col-span-3 bg-surface rounded-xl border border-border p-6 space-y-5"
    >
      {error && (
        <div className="bg-danger-bg text-danger border border-danger/20 rounded-lg p-3 text-sm animate-slide-down">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success-bg text-success border border-success/20 rounded-lg p-3 text-sm animate-slide-down">
          Habit created successfully!
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          placeholder="e.g., Read 1 page, Exercise, Meditate"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          placeholder="Why do you want to build this habit? (optional)"
        />
      </div>

      {/* Frequency Type */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Frequency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {FREQUENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFrequencyType(option.value)}
              className={`py-3 px-3 rounded-lg text-sm transition-all border text-center ${
                frequencyType === option.value
                  ? "bg-primary text-white border-primary"
                  : "bg-bg text-text-secondary border-border hover:border-primary/30"
              }`}
            >
              <p className="font-medium">{option.label}</p>
              <p className="text-xs mt-0.5 opacity-70">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Day Selection (for Weekly) */}
      {frequencyType === "WEEKLY" && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Days of the week
          </label>
          <div className="flex gap-1.5">
            {WEEKDAYS.map((day) => {
              const isSelected = selectedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-bg text-text-secondary border border-border hover:border-primary/30"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Times per day */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Times per day
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTimesPerDay(Math.max(1, timesPerDay - 1))}
            className="w-10 h-10 rounded-lg border border-border bg-bg text-text flex items-center justify-center hover:border-primary/30 transition-all"
          >
            -
          </button>
          <span className="text-lg font-semibold text-text w-8 text-center">
            {timesPerDay}
          </span>
          <button
            type="button"
            onClick={() => setTimesPerDay(Math.min(10, timesPerDay + 1))}
            className="w-10 h-10 rounded-lg border border-border bg-bg text-text flex items-center justify-center hover:border-primary/30 transition-all"
          >
            +
          </button>
          <span className="text-sm text-text-muted">
            time{timesPerDay > 1 ? "s" : ""} per day
          </span>
        </div>
      </div>

      {/* Track Amount Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={trackAmount}
            onChange={(e) => setTrackAmount(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <span className="text-sm text-text-secondary">
            Track a specific amount
          </span>
        </label>
      </div>

      {/* Target Value & Unit (if tracking amount) */}
      {trackAmount && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Target Value & Unit
          </label>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3">
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="e.g., pages"
              />
            </div>
          </div>
        </div>
      )}

      {/* Color */}
      <ColorPicker value={color} onChange={setColor} />

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

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 px-4 border border-border text-text-secondary rounded-lg font-medium hover:bg-border-light transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Creating..." : "Create Habit"}
        </button>
      </div>
    </form>
  );
}
