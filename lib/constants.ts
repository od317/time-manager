export const GOAL_COLORS = [
  { value: "#6366F1", label: "Indigo" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#10B981", label: "Emerald" },
  { value: "#22C55E", label: "Green" },
  { value: "#84CC16", label: "Lime" },
  { value: "#EAB308", label: "Yellow" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#F97316", label: "Orange" },
  { value: "#EF4444", label: "Red" },
  { value: "#EC4899", label: "Pink" },
  { value: "#A855F7", label: "Purple" },
  { value: "#8B5CF6", label: "Violet" },
  { value: "#64748B", label: "Slate" },
  { value: "#6B7280", label: "Gray" },
  { value: "#78716C", label: "Warm Gray" },
];

export const DEFAULT_GOAL_COLOR = "#6366F1";

export const POMODORO_PRESETS = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional Pomodoro",
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
  {
    id: "short",
    name: "Short Focus",
    description: "Quick sessions for small tasks",
    workDuration: 15,
    shortBreakDuration: 3,
    longBreakDuration: 10,
    sessionsBeforeLongBreak: 4,
  },
  {
    id: "long",
    name: "Deep Work",
    description: "Extended focus sessions",
    workDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 20,
    sessionsBeforeLongBreak: 3,
  },
  {
    id: "meeting",
    name: "Meeting Style",
    description: "30 min blocks with quick breaks",
    workDuration: 30,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
  {
    id: "power",
    name: "Power Hour",
    description: "Intense 60 min sessions",
    workDuration: 60,
    shortBreakDuration: 10,
    longBreakDuration: 25,
    sessionsBeforeLongBreak: 2,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Set your own timings",
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
  },
] as const;

export const DEFAULT_POMODORO_PRESET = "classic";
