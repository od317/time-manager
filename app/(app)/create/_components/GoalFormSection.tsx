"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { goalService } from "@/lib/services";
import { CreateGoalPayload, Priority } from "@/types";
import { ColorPicker } from "../../goals/_components/ColorPicker";
import { DEFAULT_GOAL_COLOR } from "@/lib/constants";
import { CreateSummary } from "./CreateSummary";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";

interface GoalFormSectionProps {
  selectedDate: Date | null;
  selectedTime: string;
  endDate: Date | null;
  endTime: string;
  onSuccess: () => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "LOW", label: "Low", color: "bg-priority-low" },
  { value: "MEDIUM", label: "Medium", color: "bg-priority-medium" },
  { value: "HIGH", label: "High", color: "bg-priority-high" },
  { value: "URGENT", label: "Urgent", color: "bg-priority-urgent" },
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
        targetValue: targetValue ? parseFloat(targetValue) : undefined,
        unit: unit.trim() || undefined,
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

      await goalService.create(payload);

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
          Goal created successfully!
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
          placeholder="e.g., Learn 100 Spanish words"
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
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          placeholder="What do you want to achieve? (optional)"
        />
      </div>

      {/* Start Date Display */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Start Date *
        </label>
        {selectedDate ? (
          <div className="flex items-center gap-3 p-3 bg-primary-bg/30 rounded-lg border border-primary/20">
            <Calendar size={18} className="text-primary" />
            <span className="text-sm font-medium text-primary flex-1">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </span>
            {selectedTime && (
              <>
                <Clock size={18} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  {formatDisplayTime(selectedTime)}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-bg rounded-lg border border-border border-dashed">
            <Calendar size={18} className="text-text-muted" />
            <span className="text-sm text-text-muted">
              Pick a date from the calendar →
            </span>
          </div>
        )}
      </div>

      {/* End Date Display */}
      {endDate && (
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            End Date
          </label>
          <div className="flex items-center gap-3 p-3 bg-primary-bg/30 rounded-lg border border-primary/20">
            <Calendar size={18} className="text-primary" />
            <span className="text-sm font-medium text-primary flex-1">
              {format(endDate, "EEEE, MMMM d, yyyy")}
            </span>
            {endTime && (
              <>
                <Clock size={18} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  {formatDisplayTime(endTime)}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Priority
        </label>
        <div className="flex gap-2">
          {priorities.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                priority === p.value
                  ? `${p.color} text-white`
                  : "bg-bg text-text-secondary border border-border hover:border-primary/30"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Value & Unit */}
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
              placeholder="e.g., 100"
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
              placeholder="e.g., words"
            />
          </div>
        </div>
      </div>

      {/* Color */}
      <ColorPicker value={color} onChange={setColor} />

      <CreateSummary
        type="goal"
        title={title}
        description={description}
        priority={priority}
        color={color}
        targetValue={targetValue}
        unit={unit}
        selectedDate={selectedDate}
        selectedTime={selectedTime ? formatDisplayTime(selectedTime) : ""}
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
          disabled={isSubmitting || !title.trim() || !selectedDate}
          className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSubmitting ? "Creating..." : "Create Goal"}
        </button>
      </div>
    </form>
  );
}
