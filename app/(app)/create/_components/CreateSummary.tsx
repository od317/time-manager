"use client";

import {
  Target,
  Repeat,
  CheckSquare,
  Calendar,
  Clock,
  Flag,
  Hash,
  BarChart3,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { Priority, GoalType } from "@/types";

interface CreateSummaryProps {
  type: "goal" | "habit" | "task";
  title: string;
  description: string;
  priority: Priority;
  color: string;
  goalType?: GoalType;
  targetValue?: string;
  unit?: string;
  selectedDate?: Date | null;
  selectedTime?: string;
  frequencyType?: string;
  frequencyDays?: number[];
  estimatedMinutes?: string;
  parentGoalTitle?: string;
}

export function CreateSummary({
  type,
  title,
  description,
  priority,
  color,
  goalType,
  targetValue,
  unit,
  selectedDate,
  selectedTime,
  frequencyType,
  frequencyDays,
  estimatedMinutes,
  parentGoalTitle,
}: CreateSummaryProps) {
  const displayTitle = title || "Untitled";
  const displayDescription = description || "No description";

  const priorityLabels: Record<string, { label: string; color: string }> = {
    LOW: { label: "Low", color: "bg-priority-low" },
    MEDIUM: { label: "Medium", color: "bg-priority-medium" },
    HIGH: { label: "High", color: "bg-priority-high" },
    URGENT: { label: "Urgent", color: "bg-priority-urgent" },
  };

  const priorityInfo = priorityLabels[priority] || priorityLabels.MEDIUM;

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const Icon =
    type === "goal" ? Target : type === "habit" ? Repeat : CheckSquare;
  const typeLabel =
    type === "goal" ? "Goal" : type === "habit" ? "Habit" : "Task";

  const details: { icon: typeof Target; label: string; value: string }[] = [];

  if (type === "goal" && targetValue) {
    details.push({
      icon: Hash,
      label: "Target",
      value: `${targetValue} ${unit || (goalType === "time" ? "hours" : "")}`,
    });
  }

  if (type === "goal" && goalType) {
    details.push({
      icon: BarChart3,
      label: "Type",
      value: goalType === "time" ? "Time-based" : "Quantity-based",
    });
  }

  if (selectedDate) {
    details.push({
      icon: Calendar,
      label: type === "habit" ? "Starts" : "Deadline",
      value:
        format(selectedDate, "MMM d, yyyy") +
        (selectedTime ? ` at ${selectedTime}` : ""),
    });
  }

  if (type === "habit" && frequencyType) {
    const freqLabel =
      frequencyType === "DAILY"
        ? "Daily"
        : frequencyType === "WEEKLY" && frequencyDays?.length
          ? `Weekly (${frequencyDays.map((d) => dayNames[d]).join(", ")})`
          : frequencyType;
    details.push({ icon: Repeat, label: "Frequency", value: freqLabel });
  }

  if (type === "task" && estimatedMinutes) {
    details.push({
      icon: Clock,
      label: "Est. Time",
      value: `${estimatedMinutes} minutes`,
    });
  }

  if (type === "task" && parentGoalTitle) {
    details.push({ icon: Target, label: "Under Goal", value: parentGoalTitle });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Eye size={18} className="text-text-muted" />
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
          Preview
        </h3>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        {/* Color bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}15` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted uppercase">
                  {typeLabel}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium text-white ${priorityInfo.color}`}
                >
                  {priorityInfo.label}
                </span>
              </div>
              <h4 className="text-lg font-semibold text-text truncate mt-1">
                {displayTitle}
              </h4>
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                {displayDescription}
              </p>
            </div>
          </div>

          {/* Details */}
          {details.length > 0 && (
            <div className="border-t border-border pt-4 space-y-2.5">
              {details.map((detail, index) => {
                const DetailIcon = detail.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <DetailIcon
                      size={16}
                      className="text-text-muted flex-shrink-0"
                    />
                    <span className="text-xs text-text-muted w-16 flex-shrink-0">
                      {detail.label}
                    </span>
                    <span className="text-sm text-text font-medium truncate">
                      {detail.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {details.length === 0 && (
            <div className="border-t border-border pt-4">
              <p className="text-xs text-text-muted text-center py-2">
                Fill in the form to see a preview
              </p>
            </div>
          )}

          {/* Progress bar placeholder for goals */}
          {type === "goal" && (
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-text-muted">Progress</span>
                <span className="text-xs text-text-muted">0%</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: "0%", backgroundColor: color }}
                />
              </div>
            </div>
          )}

          {/* Streak placeholder for habits */}
          {type === "habit" && (
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Starting streak</span>
                <span className="text-sm font-bold text-text">0 🔥</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
