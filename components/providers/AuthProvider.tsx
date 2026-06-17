"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
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
  const { initialize, isInitialized, isAuthenticated } = useAuthStore();
  const initialized = useRef(false);
  useTimezone();
  useGoalProgressSync();

  const isPublicPath = pathname
    ? publicPaths.some((p) => pathname.startsWith(p))
    : false;

  useEffect(() => {
    if (!isPublicPath && !initialized.current) {
      initialized.current = true;
      initialize();
    }
  }, [isPublicPath, initialize]);

  // Redirect if not authenticated
  if (!isPublicPath && isInitialized && !isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Don't block rendering
  if (!isInitialized && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
