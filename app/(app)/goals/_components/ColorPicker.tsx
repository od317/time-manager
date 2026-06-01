"use client";

import { motion } from "framer-motion";
import { GOAL_COLORS } from "@/lib/constants";
import { Check, Lock } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  if (disabled) {
    return (
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Color
        </label>
        <div className="flex items-center gap-3 p-3 bg-bg rounded-xl border-2 border-border">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-border"
            style={{ backgroundColor: value }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-text">
              {getColorLabel(value)}
            </p>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Lock size={10} />
              Inherited from parent
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-text mb-3">
        Color
      </label>
      <div className="flex flex-wrap gap-2.5">
        {GOAL_COLORS.map((color) => {
          const isSelected = value === color.value;
          return (
            <motion.button
              key={color.value}
              type="button"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(color.value)}
              disabled={disabled}
              title={color.label}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-text scale-110 shadow-lg"
                  : "hover:shadow-md"
              }`}
              style={{ backgroundColor: color.value }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Check size={16} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function getColorLabel(value: string): string {
  return GOAL_COLORS.find((c) => c.value === value)?.label || "Unknown";
}
