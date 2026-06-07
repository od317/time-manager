// app/(app)/create-plan/_components/CreatePlanClient.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  aiService,
  GeneratedPlan,
  GeneratePlanPayload,
} from "@/lib/services/aiService";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PlanForm } from "./PlanForm";
import { PlanLoading } from "./PlanLoading";
import { PlanPreview } from "./PlanPreview";

type Step = "form" | "loading" | "preview";

export function CreatePlanClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(
    null,
  );
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleGenerate = async (data: GeneratePlanPayload) => {
    setStep("loading");
    setError("");
    try {
      const plan = await aiService.generatePlan(data);
      setGeneratedPlan(plan);
      setStep("preview");
    } catch {
      setError("Failed to generate plan. Please try again.");
      setStep("form");
    }
  };

  const handleCreate = async (plan: GeneratedPlan) => {
    setIsCreating(true);
    try {
      const goal = await aiService.createPlan(plan);
      router.push(`/goals/${goal.id}`);
    } catch {
      setError("Failed to create plan. Please try again.");
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    setStep("form");
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/goals"
          className="p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-text">AI Plan Generator</h2>
          <p className="text-sm text-text-muted mt-1">
            Describe your goal and let AI create a structured plan
          </p>
        </div>
        <div className="ml-auto p-2 rounded-xl bg-primary-bg">
          <Sparkles size={20} className="text-primary" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PlanForm onSubmit={handleGenerate} error={error} />
          </motion.div>
        )}

        {step === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PlanLoading onCancel={handleRetry} />
          </motion.div>
        )}

        {step === "preview" && generatedPlan && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PlanPreview
              plan={generatedPlan}
              onUpdate={setGeneratedPlan}
              onCreate={handleCreate}
              isCreating={isCreating}
              error={error}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
