"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { setUserTimezone } from "@/lib/dateUtils";
import { useTimezone } from "@/hooks/useTimezone";
import { useGoalProgressSync } from "@/hooks/useGoalProgressSync";

const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { initialize, isInitialized, user } = useAuthStore();
  const [skipped, setSkipped] = useState(false);
  useTimezone();
  useGoalProgressSync();

  const isPublicPath = pathname
    ? publicPaths.some((p) => pathname.startsWith(p))
    : false;

  useEffect(() => {
    if (isPublicPath) {
      setSkipped(true);
      return;
    }
    if (!isInitialized) {
      initialize();
    }
  }, [isPublicPath, isInitialized, initialize]);

  useEffect(() => {
    if (user) {
      const tz =
        user.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "UTC";
      setUserTimezone(tz);
    }
  }, [user]);

  if (!isInitialized && !skipped) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
