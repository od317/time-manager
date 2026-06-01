"use client";

import { motion } from "framer-motion";
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

  const priorityLabels: Record<
    string,
    { label: string; color: string; bg: string }
  > = {
    LOW: { label: "Low", color: "text-blue-600", bg: "bg-blue-50" },
    MEDIUM: { label: "Medium", color: "text-indigo-600", bg: "bg-indigo-50" },
    HIGH: { label: "High", color: "text-amber-600", bg: "bg-amber-50" },
    URGENT: { label: "Urgent", color: "text-red-600", bg: "bg-red-50" },
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
      value:
        goalType === "time"
          ? "Time-based"
          : goalType === "project"
            ? "Project"
            : "Quantity-based",
    });
  }

  if (selectedDate) {
    details.push({
      icon: Calendar,
      label: type === "habit" ? "Starts" : "Date",
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-bg">
          <Eye size={16} className="text-text-muted" />
        </div>
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider">
          Preview
        </h3>
      </div>

      <div className="bg-surface rounded-2xl border-2 border-border overflow-hidden hover:shadow-lg transition-all">
        {/* Color bar */}
        <div className="h-2 w-full" style={{ backgroundColor: color }} />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon size={24} style={{ color }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-text-muted uppercase bg-bg px-2 py-0.5 rounded-full">
                  {typeLabel}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityInfo.bg} ${priorityInfo.color}`}
                >
                  <Flag size={10} className="inline mr-1" />
                  {priorityInfo.label}
                </span>
              </div>
              <h4 className="text-lg font-bold text-text truncate mt-1">
                {displayTitle}
              </h4>
              <p className="text-sm text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                {displayDescription}
              </p>
            </div>
          </div>

          {/* Details */}
          {details.length > 0 && (
            <div className="border-t-2 border-border pt-4 space-y-2.5">
              {details.map((detail, index) => {
                const DetailIcon = detail.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-1.5 rounded-lg bg-bg">
                      <DetailIcon size={14} className="text-text-muted" />
                    </div>
                    <span className="text-xs font-semibold text-text-muted w-20">
                      {detail.label}
                    </span>
                    <span className="text-sm font-medium text-text truncate">
                      {detail.value}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {details.length === 0 && (
            <div className="border-t-2 border-border pt-4">
              <p className="text-xs text-text-muted text-center py-3">
                Fill in the form to see a preview
              </p>
            </div>
          )}

          {/* Progress bar for goals */}
          {type === "goal" && (
            <div className="border-t-2 border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text-muted">
                  Progress
                </span>
                <span className="text-xs font-bold text-text-muted">0%</span>
              </div>
              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: "0%", backgroundColor: color }}
                />
              </div>
            </div>
          )}

          {/* Streak for habits */}
          {type === "habit" && (
            <div className="border-t-2 border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted">
                  Starting streak
                </span>
                <span className="text-sm font-bold text-text">0 🔥</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
