"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ErrorState";

export default function GoalDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      message="Something went wrong"
      description="Failed to load this goal. Please try again."
      onRetry={reset}
    />
  );
}
