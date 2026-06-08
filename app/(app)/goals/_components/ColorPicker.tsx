"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GOAL_COLORS } from "@/lib/constants";
import { Check, Lock, Plus } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [showCustom, setShowCustom] = useState(false);

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
              <Lock size={10} /> Inherited from parent
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCustomColor = !GOAL_COLORS.some((c) => c.value === value);

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
              onClick={() => {
                onChange(color.value);
                setShowCustom(false);
              }}
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

        {/* Custom color button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCustom(!showCustom)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-2 border-dashed ${
            isCustomColor
              ? "ring-2 ring-offset-2 ring-text scale-110 border-text"
              : "border-border hover:border-primary/50"
          }`}
          title="Custom color"
        >
          <Plus
            size={16}
            className={isCustomColor ? "text-text" : "text-text-muted"}
          />
        </motion.button>
      </div>

      {/* Custom color input */}
      {showCustom && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-3 flex items-center gap-3"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl border-2 border-border cursor-pointer p-0.5 bg-bg"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-3 py-2 rounded-xl border-2 border-border bg-bg text-sm text-text focus:outline-none focus:border-primary font-mono"
          />
        </motion.div>
      )}
    </div>
  );
}

function getColorLabel(value: string): string {
  return GOAL_COLORS.find((c) => c.value === value)?.label || "Custom";
}
