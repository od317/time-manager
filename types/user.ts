import { UserId } from "./common";

export interface User {
  id: UserId;
  email: string;
  name: string | null;
  timezone: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserSettings {
  id: string;
  userId: UserId;
  defaultGracePeriodHours: number;
  autoFailEnabled: boolean;
  habitEvaluationTime: string;
  habitGraceDays: number;
  allowRollover: boolean;
  maxRolloverDays: number;
  defaultTimerMode: "MANUAL" | "POMODORO" | "QUICK_LOG";
  pomodoroWorkMinutes: number;
  pomodoroBreakMinutes: number;
  weekStartDay: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}
