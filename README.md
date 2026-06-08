# ⏱️ TimeFlow

A comprehensive time management application with goal tracking, habit building, Pomodoro timer, analytics, and AI-powered planning. Built with Next.js 16, Express, Prisma, and PostgreSQL.

## 🚀 Tech Stack

| Layer           | Technology                                                                    |
| --------------- | ----------------------------------------------------------------------------- |
| **Frontend**    | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| **Backend**     | Express.js, Prisma ORM, PostgreSQL                                            |
| **State**       | Zustand                                                                       |
| **Charts**      | Recharts                                                                      |
| **Drag & Drop** | @dnd-kit                                                                      |
| **Auth**        | JWT (cookies)                                                                 |
| **Email**       | Resend                                                                        |
| **AI**          | OpenRouter (Gemini 2.0 Flash)                                                 |
| **Database**    | Neon (serverless PostgreSQL)                                                  |
| **Hosting**     | Vercel (frontend) + Render (backend)                                          |

## ✨ Features

### ⏱️ Timer System

- **Three modes**: Simple, Pomodoro, Quick Log
- **Task context switching**: Change tasks while timer runs without losing time
- **Session history**: Track time per task with grouped display
- **Auto-select next task**: Completing a task auto-selects the next available one
- **Pomodoro presets**: Classic, Short Focus, Deep Work, Meeting, Power Hour, Custom
- **Pomodoro persistence**: Full localStorage-based state with 30-minute crash recovery
- **Bulk session submission**: Single API call at session end (not per-phase)
- **Offline queue**: Failed submissions retry automatically on reconnect
- **Sound notifications**: Web Audio API cues for phase changes
- **Browser tab timer**: See elapsed time in tab title

### 🎯 Goals

- **Hierarchical**: Nest sub-goals infinitely with recursive task search
- **Three types**: Quantity, Time-based, Project
- **Custom colors**: 16 presets + custom hex color picker
- **Inline editing**: Edit title, description, priority, color, and due date
- **Progress tracking**: Manual + auto-sync from timer + auto-calculated from tasks
- **Tasks**: Break goals into actionable items with priority and estimated time
- **Calendar integration**: Date picker with event visualization and conflict detection
- **Drag & drop**: Reorder goals and sub-goals
- **Overdue system**: Goals past deadline become "Overdue" (not failed) with 30-day grace period
- **Deadline warnings**: Visual amber indicators for overdue items
- **Locked completion**: Can't complete goals with active sub-goals/tasks
- **Rule-based editing**: Different edit permissions based on status (Active/Overdue/Failed)

### 🤖 AI Planner

- **Plan generation**: Describe your goal and AI creates a structured plan with phases
- **Editable preview**: Modify titles, descriptions, tasks, and dates before creating
- **Phased breakdown**: AI organizes goals into sequential phases with estimated hours
- **Task assignment**: Each phase includes actionable tasks with deadlines
- **Progress indicators**: Rotating status messages during AI processing
- **One-click creation**: Creates full goal hierarchy with sub-goals and tasks

### 🔄 Habits

- **Flexible scheduling**: Daily, weekly, custom frequency
- **Client-side filtering**: Instant filter by Active/Paused/Archived
- **Streaks**: Current, longest, total completions
- **Heatmap**: GitHub-style yearly activity view
- **Log history**: Today/Yesterday labels with undo support
- **Browser-based dates**: All logic uses local time
- **Pause/Resume/Archive**: Full lifecycle

### 📊 Analytics

- **Overview stats**: Goals by status (Active, Overdue, Completed, Failed, Paused)
- **Goal progress**: Horizontal bar chart with goal colors
- **Habit consistency**: Streak comparison chart
- **Time distribution**: Donut chart by goal with pre-formatted durations
- **Daily breakdown**: Line chart with week/month/year views and comparison mode
- **AI insights**: Personalized feedback with strengths, improvements, and recommendations
- **Productivity patterns**: Day activity, priority distribution

### 🎨 Dashboard

- **Single endpoint**: `/api/today` aggregates all dashboard data in one call
- **Collapsible sections**: Habits, Focus Tasks, Goals with expand/collapse
- **Optimistic updates**: Task CRUD operations update UI instantly via Zustand
- **Goal hierarchy**: Expand to see sub-goals and tasks at any depth
- **Quick task add**: Modal from any goal with calendar date picker
- **Task auto-select**: Completing selected task picks next available task
- **Dark mode**: Full support, no flash on load
- **Responsive**: Mobile bottom nav

### 🔧 Auth & Optimization

- **Register/Login**: JWT-based with cookies
- **Instant auth**: Token check is instant, user fetch is lazy-loaded
- **Skeleton loading**: User-dependent UI shows skeletons, not full-page spinners
- **Email verification**: Resend integration
- **Password reset**: Secure token-based flow
- **Route protection**: Proxy middleware

## 📁 Project Structure

```
timeflow/
├── frontend/                    # Next.js application
│   ├── app/
│   │   ├── (auth)/              # Login, Register, Forgot/Reset password
│   │   └── (app)/               # Authenticated pages
│   │       ├── today/           # Dashboard with timer, habits, goals, tasks
│   │       ├── goals/           # Goals CRUD + detail page with inline editing
│   │       ├── habits/          # Habits list + detail + heatmap
│   │       ├── analytics/       # Charts, daily breakdown, AI insights
│   │       ├── create/          # Goal/habit creation with calendar
│   │       ├── create-plan/     # AI plan generator with editable preview
│   │       └── settings/        # Profile management
│   ├── components/
│   │   ├── calendar/            # Self-contained Calendar with data fetching
│   │   └── tasks/               # Shared TaskItem, TaskRow
│   ├── hooks/                   # useCalendarData, useTimezone
│   ├── lib/                     # API client, services, persistence
│   ├── store/                   # Zustand stores (timer, task, auth, modal, toast)
│   └── types/                   # TypeScript types
│
├── backend/                     # Express API
│   ├── controllers/             # Auth, Goal, Habit, TimeEntry, AI
│   ├── middleware/               # Auth, Error handler
│   ├── routes/                  # API routes
│   ├── services/                # Deadline service, AI service
│   ├── utils/                   # Prisma, Email (Resend)
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   └── server.js                # Entry point
```

## 🔧 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local) or Neon (cloud)
- Resend account (for emails)
- OpenRouter API key (for AI features)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/timeflow.git
cd timeflow

# Backend
cd backend
npm install
cp .env.example .env  # Edit with your values
npx prisma migrate dev --name init
npx prisma generate
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local  # Edit with your values
npm run dev
```

### Environment Variables

**Backend** (`.env`):

```env
PORT=5000
DATABASE_URL="postgresql://..."
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
RESEND_API_KEY=re_your_key
OPENROUTER_API_KEY=sk-or-v1-your-key
SETUP_SECRET=your-setup-secret
```

**Frontend** (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import project on Vercel
3. Set `NEXT_PUBLIC_API_URL` to your Render API URL
4. Deploy

### Backend (Render)

1. Push to GitHub
2. Create Web Service on Render
3. Set environment variables
4. Build: `npm install && npx prisma generate`
5. Start: `node server.js`

### Database (Neon)

1. Create project on Neon
2. Copy connection string
3. Set `DATABASE_URL` on Render
4. Run migrations via setup endpoint

## 🎯 Key Design Patterns

### Request Deduplication

Duplicate API calls are automatically cancelled:

```typescript
api.post("/goals", data, CancelKeys.GOAL_CREATE);
```

### Timer State Machine

```
IDLE → RUNNING → PAUSED → RUNNING → COMPLETED
```

### Pomodoro Persistence

```
localStorage (primary) → Backend (bulk on complete) → Offline queue (retry)
```

### Optimistic UI Updates

Task/goal mutations update Zustand stores instantly, API calls happen in background. Failed requests can be retried.

### Browser-Based Date Logic

All date calculations use browser's local time, no server timezone dependencies.

### Modal Management

Global modal store prevents prop drilling and DOM nesting issues.

### Self-Contained Calendar

Calendar component fetches its own data via hook, no prop drilling needed.

## 📄 License

MIT
