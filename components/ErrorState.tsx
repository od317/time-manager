// components/ErrorState.tsx
"use client";

import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry: () => void;
}

export function ErrorState({
  message = "Something went wrong",
  description = "Failed to load data",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="p-4 rounded-2xl bg-danger-bg text-danger">
        <AlertTriangle size={32} />
      </div>
      <p className="text-text-muted font-medium">{message}</p>
      <p className="text-sm text-text-muted">{description}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all"
      >
        Try Again
      </button>
    </div>
  );
}
