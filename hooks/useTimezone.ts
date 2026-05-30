"use client";

import { useEffect } from "react";
import { setUserTimezone } from "@/lib/dateUtils";
import { useAuthStore } from "@/store/authStore";

export function useTimezone() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Use user's saved timezone, or detect from browser
    const tz =
      (user as any)?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC";
    setUserTimezone(tz);
  }, [user]);
}
