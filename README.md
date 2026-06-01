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
- **Auto-fail overdue goals**: Goals past their deadline are automatically marked as failed
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

### 📊 Analytics Dashboard

- **Overview stats**: Goals completed, active habits, time tracked
- **Goal progress chart**: Horizontal bar chart with goal colors
- **Habit consistency**: Current vs longest streak comparison
- **Time distribution**: Donut chart showing time by goal
- **Productivity patterns**: Habit load by day, priority distribution, weekly wins
- **Daily breakdown**: Line chart with week/month/year views
- **Comparison mode**: Compare with previous period (dashed lines)
- **AI-powered insights**: Personalized suggestions based on your data
- **Recent activity**: Last 10 time entries with context

### 🎨 Dashboard Layout

- **Customizable layout**: Single or double column mode
- **Draggable sections**: Reorder Habits, Tasks, and Goals sections
- **Collapsible sections**: Expand/collapse each section independently
- **Goal hierarchy**: Expand goals to see sub-goals and tasks inline
- **Quick timer start**: Start timer directly from any task
- **Dark mode**: Full dark mode support with no flash on load

### 🔧 Other Features

- **Settings page**: Profile management
- **404 page**: Custom not-found page
- **Request deduplication**: Automatic cancellation of duplicate API calls
- **Race condition protection**: AbortController for stale requests
- **Cookie-based auth**: JWT stored in cookies for security
- **Server Components**: SSR/SSG with revalidation for initial data
- **Responsive design**: Mobile bottom nav, adaptive layouts

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Login/Register pages
│   ├── (app)/               # Authenticated pages
│   │   ├── today/           # Main dashboard
│   │   ├── goals/           # Goals CRUD + hierarchy
│   │   ├── habits/          # Habits list + detail
│   │   ├── analytics/       # Charts & insights
│   │   ├── create/          # Goal/habit creation
│   │   └── settings/        # User preferences
├── components/
│   ├── calendar/            # Calendar, TimePicker, DayDetails
│   ├── tasks/               # Shared TaskItem component
│   └── ui/                  # ThemeProvider, ThemeToggle
├── hooks/                   # useGoalProgressSync
├── lib/                     # Utilities, services, persistence
├── store/                   # Zustand stores (auth, timer, ui)
└── types/                   # TypeScript types
```

## 🔧 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Backend server running (see backend README)

### Installation

```bash
cd frontend
npm install
cd ../backend
npm install
```

### Environment Variables

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** (`.env`):

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/timemanager"
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
OPENROUTER_API_KEY=your-openrouter-key
```

### Database Setup

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
```

### Seed Data (Optional)

```bash
node scripts/seed.js
```

### Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
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

### Browser-Based Date Logic

All date calculations use the browser's local time:

- `new Date().getDay()` for day of week
- `toLocaleDateString('en-CA')` for YYYY-MM-DD format
- No server timezone dependencies

### Dark Mode

Theme preference stored in both cookie (server-side, no flash) and localStorage (client persistence).

---
