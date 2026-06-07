// app/(app)/create-plan/_components/PlanLoading.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, X } from "lucide-react";

interface PlanLoadingProps {
  onCancel: () => void;
}

const messages = [
  { text: "Analyzing your goal...", icon: "🔍" },
  { text: "Identifying key milestones...", icon: "🎯" },
  { text: "Breaking down into phases...", icon: "📋" },
  { text: "Estimating time requirements...", icon: "⏱️" },
  { text: "Creating actionable tasks...", icon: "✅" },
  { text: "Organizing your plan...", icon: "📊" },
  { text: "Almost done...", icon: "✨" },
];

export function PlanLoading({ onCancel }: PlanLoadingProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="bg-surface rounded-2xl border border-border shadow-sm p-12 text-center">
      {/* Animated icon */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl bg-primary-bg flex items-center justify-center mx-auto mb-8"
      >
        <Sparkles size={36} className="text-primary" />
      </motion.div>

      {/* Progress message */}
      <motion.div
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-8"
      >
        <span className="text-2xl mr-2">{messages[messageIndex].icon}</span>
        <p className="text-lg font-semibold text-text mt-2">
          {messages[messageIndex].text}
        </p>
      </motion.div>

      {/* Skeleton preview */}
      <div className="max-w-md mx-auto space-y-3">
        <div className="h-14 bg-bg rounded-xl border border-border animate-pulse" />
        <div className="h-32 bg-bg rounded-xl border border-border animate-pulse" />
        <div className="h-32 bg-bg rounded-xl border border-border animate-pulse" />
      </div>

      {/* Spinner */}
      <div className="flex items-center justify-center gap-3 mt-8 text-text-muted">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">AI is planning your goal...</span>
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="mt-6 text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1 mx-auto"
      >
        <X size={14} />
        Cancel
      </button>
    </motion.div>
  );
}
