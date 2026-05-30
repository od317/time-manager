/**
 * Centralized date utilities that respect user timezone.
 * All "today" calculations should use these functions.
 */

// Default timezone - can be overridden
let userTimezone = "UTC";

export function setUserTimezone(tz: string) {
  userTimezone = tz;
}

export function getUserTimezone(): string {
  return userTimezone;
}

/**
 * Get the current date in the user's timezone as a Date object
 * that represents "today" at midnight in their timezone.
 */
export function getTodayInTimezone(): Date {
  const now = new Date();
  const localDate = new Date(
    now.toLocaleString("en-US", { timeZone: userTimezone }),
  );
  localDate.setHours(0, 0, 0, 0);
  return localDate;
}

/**
 * Get the day of week (0-6, 0=Sun) in the user's timezone.
 */
export function getDayOfWeek(): number {
  const now = new Date();
  const dayStr = now.toLocaleString("en-US", {
    timeZone: userTimezone,
    weekday: "short",
  });
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return dayMap[dayStr] ?? 0;
}

/**
 * Get the current date string (YYYY-MM-DD) in the user's timezone.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.toLocaleString("en-US", {
    timeZone: userTimezone,
    year: "numeric",
  });
  const month = now.toLocaleString("en-US", {
    timeZone: userTimezone,
    month: "2-digit",
  });
  const day = now.toLocaleString("en-US", {
    timeZone: userTimezone,
    day: "2-digit",
  });
  return `${year}-${month}-${day}`;
}

/**
 * Check if a habit is due today based on its frequency.
 */
export function isHabitDueToday(
  frequencyType: string,
  frequencyDays: number[],
): boolean {
  const today = getDayOfWeek();
  if (frequencyType === "DAILY") return true;
  if (frequencyType === "WEEKLY") {
    return frequencyDays.includes(today);
  }
  return true;
}

/**
 * Convert a UTC date string to a Date object in the user's timezone.
 */
export function toUserDate(utcDateStr: string): Date {
  const date = new Date(utcDateStr);
  const localStr = date.toLocaleString("en-US", { timeZone: userTimezone });
  return new Date(localStr);
}

/**
 * Get the start of today in the user's timezone as an ISO string.
 */
export function getTodayStartISO(): string {
  return getTodayInTimezone().toISOString();
}

/**
 * Get the start of a given date in the user's timezone.
 */
export function getDateStartISO(date: Date): string {
  const local = new Date(
    date.toLocaleString("en-US", { timeZone: userTimezone }),
  );
  local.setHours(0, 0, 0, 0);
  return local.toISOString();
}

/**
 * Format a date in the user's timezone.
 */
export function formatInTimezone(
  date: Date | string,
  formatStr: string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const options: Intl.DateTimeFormatOptions = { timeZone: userTimezone };

  if (formatStr.includes("day")) options.weekday = "long";
  if (formatStr.includes("month")) options.month = "long";
  if (formatStr.includes("year")) options.year = "numeric";
  if (formatStr.includes("d")) options.day = "numeric";

  return d.toLocaleDateString("en-US", options);
}

/*
 * Get the time remaining until midnight in the user's timezone.
 * Returns a formatted string like "14h 32m" or "45m".
 */
export function getTimeUntilMidnight(): {
  hours: number;
  minutes: number;
  formatted: string;
} {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const remainingMinutes = (23 - hours) * 60 + (60 - minutes);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;

  let formatted = "";
  if (remainingHours > 0) {
    formatted = `${remainingHours}h ${remainingMins}m`;
  } else {
    formatted = `${remainingMins}m`;
  }

  return { hours: remainingHours, minutes: remainingMins, formatted };
}
