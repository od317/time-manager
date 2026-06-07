// app/(app)/create-plan/_components/PlanForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { GeneratePlanPayload } from "@/lib/services/aiService";

interface PlanFormProps {
  onSubmit: (data: GeneratePlanPayload) => void;
  error: string;
}

export function PlanForm({ onSubmit, error }: PlanFormProps) {
  const [form, setForm] = useState<GeneratePlanPayload>({
    title: "Get a full-stack software engineering job at a tech company",
    description:
      "Land a mid-level full-stack role with competitive salary. Target companies: tech startups and mid-size product companies.",
    category: "career",
    timeframe: "6 months",
    hoursPerWeek: "15",
    currentLevel: "intermediate",
    additionalNotes:
      "Tech stack: React, Node.js, PostgreSQL. Need to master: DSA (LeetCode medium/hard), system design (HLD + LLD), behavioral interviews (STAR method), and build 2 portfolio projects. Limited to evenings 7-10pm and weekends. Prefer structured weekly goals.",
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof GeneratePlanPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    onSubmit(form);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-5"
    >
      {error && (
        <div className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-4 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Title - Required */}
      <div>
        <label className="block text-sm font-bold text-text mb-2">
          What do you want to achieve? *
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., Get a full-stack software engineering job"
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-text mb-2">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          placeholder="What does success look like? Any specific requirements?"
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
        />
      </div>

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors"
      >
        {showAdvanced ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        More Options
      </button>

      {showAdvanced && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-bg text-sm text-text focus:outline-none focus:border-primary"
              >
                <option value="">Select category</option>
                <option value="career">Career</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="finance">Finance</option>
                <option value="creative">Creative</option>
                <option value="business">Business</option>
                <option value="language">Language</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Timeframe
              </label>
              <input
                type="text"
                value={form.timeframe}
                onChange={(e) => updateField("timeframe", e.target.value)}
                placeholder="e.g., 6 months"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-bg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Hours per Week
              </label>
              <input
                type="text"
                value={form.hoursPerWeek}
                onChange={(e) => updateField("hoursPerWeek", e.target.value)}
                placeholder="e.g., 15"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-bg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-muted mb-1.5">
                Current Level
              </label>
              <select
                value={form.currentLevel}
                onChange={(e) => updateField("currentLevel", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border bg-bg text-sm text-text focus:outline-none focus:border-primary"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-muted mb-1.5">
              Additional Notes
            </label>
            <textarea
              value={form.additionalNotes}
              onChange={(e) => updateField("additionalNotes", e.target.value)}
              rows={2}
              placeholder="Any extra context that helps the AI plan better..."
              className="w-full px-4 py-3 rounded-xl border-2 border-border bg-bg text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
            />
          </div>
        </motion.div>
      )}

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!form.title.trim() || isSubmitting}
        className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        <Sparkles size={18} />
        Generate Plan
      </motion.button>
    </motion.form>
  );
}
