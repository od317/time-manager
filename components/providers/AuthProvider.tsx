"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { setUserTimezone } from "@/lib/dateUtils";
import { useTimezone } from "@/hooks/useTimezone";
import { useGoalProgressSync } from "@/hooks/useGoalProgressSync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, isInitialized, user } = useAuthStore();
  useTimezone();
  useGoalProgressSync();
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Set timezone from user data or browser
  useEffect(() => {
    if (user) {
      const tz =
        user.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC";
      setUserTimezone(tz);
    }
  }, [user]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
