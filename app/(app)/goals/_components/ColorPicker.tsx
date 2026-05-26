"use client";

import { GOAL_COLORS } from "@/lib/constants";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  if (disabled) {
    // Show the locked color without interaction
    return (
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Color (inherited from parent)
        </label>
        <div className="flex items-center gap-2 p-2 bg-bg rounded-lg border border-border">
          <div
            className="w-6 h-6 rounded-full flex-shrink-0 ring-2 ring-offset-1 ring-border"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-text-muted">
            {getColorLabel(value)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">
        Color
      </label>
      <div className="flex flex-wrap gap-2">
        {GOAL_COLORS.map((color) => {
          const isSelected = value === color.value;
          return (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange(color.value)}
              disabled={disabled}
              title={color.label}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                isSelected ? "ring-2 ring-offset-2 ring-text scale-110" : ""
              }`}
              style={{ backgroundColor: color.value }}
            >
              {isSelected && <Check size={14} className="text-white" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getColorLabel(value: string): string {
  return GOAL_COLORS.find((c) => c.value === value)?.label || "Unknown";
}
