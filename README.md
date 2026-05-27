# ⏱️ TimeFlow - Frontend

A time management application built with Next.js 16, React 19, and TypeScript. Track goals, habits, and time with a beautiful, responsive interface.

## 🚀 Tech Stack

| Category             | Technology                         |
| -------------------- | ---------------------------------- |
| **Framework**        | Next.js 16 (App Router)            |
| **UI Library**       | React 19                           |
| **Language**         | TypeScript                         |
| **Styling**          | Tailwind CSS v4                    |
| **State Management** | Zustand                            |
| **Server State**     | TanStack React Query               |
| **HTTP Client**      | Axios (with request deduplication) |
| **Forms**            | React Hook Form + Zod              |
| **Charts**           | Recharts                           |
| **Drag & Drop**      | @dnd-kit                           |
| **Icons**            | Lucide React                       |
| **Animations**       | Framer Motion                      |
| **Dates**            | date-fns                           |
| **Sound**            | Web Audio API                      |

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Login/Register pages
│   │   ├── login/
│   │   └── register/
│   ├── (app)/               # Authenticated pages
│   │   ├── today/           # Main dashboard
│   │   ├── goals/           # Goals CRUD + hierarchy
│   │   ├── habits/          # Habits tracking
│   │   ├── analytics/       # Charts & insights
│   │   └── settings/        # User preferences
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles + theme
├── components/              # Shared UI components
│   └── ui/                  # Button, Input, Modal, etc.
├── hooks/                   # Custom hooks
├── lib/                     # Utilities
│   ├── api.ts               # Axios client (race condition protection)
│   ├── server-api.ts        # Server-side fetch wrapper
│   ├── constants.ts         # Colors, config
│   ├── sounds.ts            # Web Audio API sounds
│   ├── timerPersistence.ts  # LocalStorage persistence
│   └── services/            # API service modules
├── store/                   # Zustand stores
│   ├── authStore.ts         # Authentication state
│   ├── timerStore.ts        # Timer state machine
│   └── uiStore.ts           # UI state (sidebar, etc.)
└── types/                   # TypeScript types
```

## 🎨 Features

### Timer

- **Three modes**: Simple, Pomodoro, Quick Log
- **Task context switching**: Change tasks mid-session without losing time
- **Session history**: Track time per task with live updates
- **Persistence**: Survives page reloads via localStorage
- **Browser tab timer**: See elapsed time in the tab title

### Goals

- **Hierarchical goals**: Nest sub-goals infinitely
- **Color coding**: 16 colors, sub-goals inherit parent color
- **Progress tracking**: Manual updates + automatic timer sync
- **Time-based goals**: Track hours/minutes from timer
- **Quantity-based goals**: Track counts (words, pages, etc.)
- **Tasks**: Break goals into actionable items

### Habits

- **Flexible scheduling**: Daily, weekly, custom frequency
- **Streak tracking**: Current streak, longest streak
- **Rollover support**: Complete missed habits next day
- **Heatmap view**: GitHub-style consistency visualization
- **Amount tracking**: Log values, not just yes/no

### Dashboard

- **Today view**: Habits, goals, tasks, and timer in one place
- **Task grouping**: Tasks grouped by parent goal
- **Collapsible sidebar**: More screen space when needed
- **Responsive**: Works on desktop and mobile

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
NEXT_PUBLIC_DEV_MODE=true   # Shorter Pomodoro times for testing
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🏗️ Architecture Decisions

### Why Zustand over Redux?

- Minimal boilerplate
- No provider needed
- Direct store access via `getState()` for non-reactive reads
- Perfect for timer state that updates every second

### Why Axios with AbortController?

- Built-in request deduplication
- Automatic cancellation of stale requests
- Prevents race conditions on rapid interactions
- Centralized error handling with user-friendly messages

### Why Server Components + Client Components?

- **Server Components**: Fetch initial data with Next.js caching
- **Client Components**: Interactive timer, forms, drag-drop
- **Best of both**: Fast initial load + rich interactivity

### Why localStorage for Timer Persistence?

- Instant recovery on page reload
- No backend dependency for session state
- 24-hour expiry prevents stale data
- Automatically paused on reload to prevent runaway timers

## 🎯 Key Design Patterns

### Request Deduplication

Same requests cancel previous ones:

```typescript
api.post("/goals", data, CancelKeys.GOAL_CREATE);
// Second call cancels the first
```

### Timer State Machine

```
IDLE → RUNNING → PAUSED → RUNNING → COMPLETED
                    ↓
                 STOPPED
```

### Task Context Switching

When changing tasks during a running timer:

1. Stop current time entry (saves time to current task)
2. Start new time entry (time goes to new task)
3. Display continues without resetting

### Color Inheritance

Sub-goals automatically inherit parent goal color:

```
Parent (Blue) → Child (Blue) → Grandchild (Blue)
```

## 📦 Available Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm start`     | Start production server  |
| `npm run lint`  | Run ESLint               |

---

Want me to add specific sections like API documentation, component documentation, or deployment instructions?
