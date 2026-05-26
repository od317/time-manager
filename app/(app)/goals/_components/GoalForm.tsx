"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { goalService } from "@/lib/services";
import { CreateGoalPayload, Priority, GoalType } from "@/types";

interface GoalFormProps {
  onClose: () => void;
  parentId?: string | null;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "LOW", label: "Low", color: "bg-priority-low" },
  { value: "MEDIUM", label: "Medium", color: "bg-priority-medium" },
  { value: "HIGH", label: "High", color: "bg-priority-high" },
  { value: "URGENT", label: "Urgent", color: "bg-priority-urgent" },
];

export function GoalForm({ onClose, parentId }: GoalFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [goalType, setGoalType] = useState<GoalType>("quantity");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-text">
            {parentId ? "Create Sub-Goal" : "Create Goal"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-danger-bg text-danger border border-danger/20 rounded-lg p-3 text-sm">
              {error}
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
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="What do you want to achieve?"
            />
          </div>

          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Goal Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setGoalType("quantity");
                  setUnit("");
                }}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all border ${
                  goalType === "quantity"
                    ? "bg-primary text-white border-primary"
                    : "bg-bg text-text-secondary border-border hover:border-primary/30"
                }`}
              >
                📏 Quantity
              </button>
              <button
                type="button"
                onClick={() => {
                  setGoalType("time");
                  setUnit("hours");
                }}
                className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all border ${
                  goalType === "time"
                    ? "bg-primary text-white border-primary"
                    : "bg-bg text-text-secondary border-border hover:border-primary/30"
                }`}
              >
                ⏱️ Time-based
              </button>
            </div>
          </div>

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
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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

          {/* Target */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Target Value
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder={goalType === "time" ? "e.g., 10" : "e.g., 100"}
                min="0"
                step={goalType === "time" ? "0.5" : "1"}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">
                Unit
              </label>
              {goalType === "time" ? (
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="e.g., words, km"
                />
              )}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-text-secondary">Set deadline</span>
            </label>
            {hasEndDate && (
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-2 w-full px-4 py-2.5 rounded-lg border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-border text-text-secondary rounded-lg font-medium hover:bg-border-light transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
