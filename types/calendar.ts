export interface CalendarEvent {
  id: string;
  type: "goal" | "task" | "habit";
  title: string;
  color: string;
  date: string; // ISO date string
  time?: string; // "HH:MM" format
  status: string;
  goalId?: string;
  estimatedMinutes?: number;
  description?: string;
}
