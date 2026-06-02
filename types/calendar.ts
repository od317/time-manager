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

export interface CalendarDataResponse {
  goals: CalendarGoal[];
  habits: CalendarHabit[];
  activeGoals: number;
  upcomingDeadlines: number;
  activeHabits: number;
}

export interface CalendarGoal {
  id: string;
  title: string;
  color: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  type: string;
}

export interface CalendarHabit {
  id: string;
  title: string;
  color: string | null;
  status: string;
  type: string;
  date: string;
}
