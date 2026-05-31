# ⏱️ TimeFlow

A comprehensive time management application built with Next.js 16, React 19, and TypeScript. Track goals, habits, and time with a beautiful, responsive interface.

## 🚀 Tech Stack

| Category             | Technology                         |
| -------------------- | ---------------------------------- |
| **Framework**        | Next.js 16 (App Router)            |
| **UI Library**       | React 19                           |
| **Language**         | TypeScript                         |
| **Styling**          | Tailwind CSS v4                    |
| **State Management** | Zustand                            |
| **HTTP Client**      | Axios (with request deduplication) |
| **Drag & Drop**      | @dnd-kit                           |
| **Icons**            | Lucide React                       |
| **Charts**           | Recharts                           |
| **Dates**            | date-fns                           |
| **Sound**            | Web Audio API                      |
| **AI**               | OpenRouter (Gemini 2.0 Flash)      |

## ✨ Features

### ⏱️ Timer System

- **Three modes**: Simple, Pomodoro, Quick Log
- **Task context switching**: Change tasks mid-session without losing time
- **Session history**: Track time per task with live updates and grouped display
- **Pomodoro presets**: Classic, Short Focus, Deep Work, Meeting Style, Power Hour, Custom
- **Customizable durations**: Work, short break, long break, sessions before long break
- **Sound notifications**: Audio cues for phase changes
- **Persistence**: Survives page reloads via localStorage with automatic pause on reload
- **Browser tab timer**: See elapsed time in the tab title
- **Goal progress auto-sync**: Time tracked on time-based goals updates progress automatically

### 🎯 Goals

- **Hierarchical goals**: Nest sub-goals infinitely with expand/collapse
- **Three goal types**: Quantity, Time-based, Project
- **Color coding**: 16 colors, sub-goals inherit parent color
- **Progress tracking**: Manual updates + automatic timer sync for time-based goals
- **Tasks**: Break goals into actionable items with priority, estimated time, and due dates
- **Calendar-based creation**: Pick start/end dates with optional time selection
- **Drag & drop reordering**: Reorder goals and sub-goals on the Today page
- **Sub-goal management**: Create, edit, and nest sub-goals from the detail page

### 🔄 Habits

- **Flexible scheduling**: Daily, weekly, or custom frequency
- **Day picker**: Select specific days for weekly habits
- **Streak tracking**: Current streak, longest streak, total completions
- **Amount tracking**: Log specific values, not just yes/no
- **Heatmap view**: GitHub-style yearly activity visualization
- **Log history**: Recent activity with Today/Yesterday labels
- **Browser-based date handling**: All date logic uses browser's local time
- **Edit habits**: Modal with title, description, and color
- **Pause/Resume/Archive/Delete**: Full lifecycle management
- **Time remaining**: Countdown until midnight for today's habits

### 📊 Dashboard

- **Customizable layout**: Single or double column mode
- **Draggable sections**: Reorder Habits, Tasks, and Goals sections
- **Collapsible sections**: Expand/collapse each section independently
- **Today overview**: Compact stats strip showing active counts
- **Focus tasks**: Shows only urgent or due-today tasks
- **Goal hierarchy**: Expand goals to see sub-goals and tasks inline
- **Quick timer start**: Start timer directly from any task
- **Responsive**: Works on desktop and mobile

### 📅 Calendar System

- **Month navigation**: Browse months with arrow controls
- **Event dots**: Colored dots for goals, tasks, and habits
- **Past day handling**: View history, disable future selection
- **Day details panel**: Shows all events grouped by type with status badges
- **Time picker**: Quick presets + custom hour/minute selection in 12-hour format
- **Date range selection**: Start and end dates for goals

### 🎨 UI/UX

- **Collapsible sidebar**: Toggle between full and icon-only modes
- **Color-coded everything**: Goals, tasks, and habits share consistent colors
- **Drag handles**: Appear on hover for reorderable items
- **Smooth animations**: Slide, fade, and pulse effects
- **Loading states**: Spinners and skeleton states
- **Error handling**: Network errors, timeouts, validation with retry options
- **Success feedback**: Green confirmation with auto-dismiss
- **Empty states**: Helpful messages with CTAs
- **Responsive design**: Mobile bottom nav, adaptive layouts

### 💾 Data & State

- **Request deduplication**: Automatic cancellation of duplicate API calls
- **Race condition protection**: AbortController for stale requests
- **localStorage persistence**: Timer state, layout preferences, goal order
- **Cookie-based auth**: JWT stored in cookies for security
- **Server Components**: SSR/SSG with revalidation for initial data
- **Client Components**: Interactive elements with Zustand stores

### 🤖 AI Insights

- **Personalized analysis**: AI reviews your goals, habits, and time tracking data
- **Smart suggestions**: Actionable tips based on your patterns
- **Encouragement**: Motivational messages tailored to your progress
- **Pattern detection**: Identifies trends in your productivity
- **Powered by OpenRouter**: Uses Gemini 2.0 Flash (free tier)
- **Fallback insights**: Works even when AI is unavailable

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Login/Register pages
│   ├── (app)/               # Authenticated pages
│   │   ├── today/           # Main dashboard with timer, habits, goals, tasks
│   │   ├── goals/           # Goals CRUD + hierarchy + detail page
│   │   ├── habits/          # Habits list + detail with heatmap
│   │   └── create/          # Unified goal/habit creation with calendar
├── components/
│   ├── calendar/            # Calendar, TimePicker, DayDetails
│   ├── tasks/               # Shared TaskItem component
│   └── ui/                  # Button, Input, Modal, etc.
├── hooks/                   # useGoalProgressSync, useTimezone
├── lib/                     # Utilities
│   ├── api.ts               # Axios client (race condition protection)
│   ├── server-api.ts        # Server-side fetch wrapper
│   ├── constants.ts         # Colors, Pomodoro presets
│   ├── sounds.ts            # Web Audio API sounds
│   ├── timerPersistence.ts  # LocalStorage helpers
│   └── services/            # API service modules (client + server)
├── store/                   # Zustand stores
│   ├── authStore.ts         # Authentication state
│   ├── timerStore.ts        # Timer state machine (Simple/Pomodoro/Quick Log)
│   └── uiStore.ts           # UI state (sidebar, layout, ordering)
└── types/                   # TypeScript types
```

## 🔧 Getting Started

### Prerequisites

- Node.js 20+
- Backend server running (see backend README)

### Installation

```bash
npm install
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Key Design Patterns

### Timer State Machine

```
IDLE → RUNNING → PAUSED → RUNNING → COMPLETED
```

### Request Deduplication

```typescript
api.post("/goals", data, CancelKeys.GOAL_CREATE);
// Second call cancels the first
```

### Task Context Switching

When changing tasks during a running timer:

1. Stop current time entry (saves time to current task)
2. Start new time entry (time goes to new task)
3. Display continues without resetting
4. Session history groups time by task

### Browser-Based Date Logic

All habit and date calculations use the browser's local time:

- `new Date().getDay()` for day of week
- `toLocaleDateString('en-CA')` for YYYY-MM-DD format
- No server timezone dependencies
