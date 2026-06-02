"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { CalendarDataResponse } from "@/types/calendar";

export function useCalendarData() {
  const [data, setData] = useState<CalendarDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<CalendarDataResponse>("/create/calendar-data")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}
