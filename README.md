# ⏱️ TimeFlow

A comprehensive time management application with goal tracking, habit building, Pomodoro timer, and analytics. Built with Next.js 16, Express, Prisma, and PostgreSQL.

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
- **Pomodoro presets**: Classic, Short Focus, Deep Work, Meeting, Power Hour, Custom
- **Sound notifications**: Audio cues for phase changes
- **Persistence**: Survives page reloads via localStorage
- **Browser tab timer**: See elapsed time in tab title

### 🎯 Goals

- **Hierarchical**: Nest sub-goals infinitely
- **Three types**: Quantity, Time-based, Project
- **16 colors**: Sub-goals inherit parent color
- **Progress tracking**: Manual + auto-sync from timer
- **Tasks**: Break goals into actionable items
- **Calendar**: Pick dates with conflict detection
- **Drag & drop**: Reorder goals and sub-goals
- **Auto-fail**: Overdue goals marked automatically
- **Locked completion**: Can't complete goals with active sub-goals/tasks

### 🔄 Habits

- **Flexible scheduling**: Daily, weekly, custom frequency
- **Streaks**: Current, longest, total completions
- **Heatmap**: GitHub-style yearly activity view
- **Log history**: Today/Yesterday labels
- **Browser-based dates**: All logic uses local time
- **Pause/Resume/Archive**: Full lifecycle

### 📊 Analytics

- **Overview stats**: Goals, habits, time tracked
- **Goal progress**: Horizontal bar chart with colors
- **Habit consistency**: Streak comparison chart
- **Time distribution**: Donut chart by goal
- **Daily breakdown**: Line chart with week/month/year
- **Comparison mode**: Previous period comparison
- **AI insights**: Personalized suggestions (OpenRouter)
- **Productivity patterns**: Day activity, priority distribution

### 🎨 Dashboard

- **Customizable layout**: Single/double column, drag sections
- **Collapsible sections**: Habits, Tasks, Goals
- **Goal hierarchy**: Expand to see sub-goals and tasks
- **Quick task add**: Modal from any goal
- **Dark mode**: Full support, no flash on load
- **Responsive**: Mobile bottom nav

### 🔧 Auth & Email

- **Register/Login**: JWT-based with cookies
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
│   │       ├── today/           # Dashboard with timer, habits, goals
│   │       ├── goals/           # Goals CRUD + detail page
│   │       ├── habits/          # Habits list + detail + heatmap
│   │       ├── analytics/       # Charts, daily breakdown, AI insights
│   │       ├── create/          # Goal/habit creation with calendar
│   │       └── settings/        # Profile management
│   ├── components/
│   │   ├── calendar/            # Calendar, TimePicker, DayDetails
│   │   └── tasks/               # Shared TaskItem
│   ├── hooks/                   # Custom hooks
│   ├── lib/                     # API client, services, utils
│   ├── store/                   # Zustand stores
│   └── types/                   # TypeScript types
│
├── backend/                     # Express API
│   ├── controllers/             # Auth, Goal, Habit, TimeEntry
│   ├── middleware/               # Auth, Error handler
│   ├── routes/                  # API routes
│   ├── services/                # Deadline service
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

### Browser-Based Date Logic

All date calculations use browser's local time, no server timezone dependencies.

### Modal Management

Global modal store prevents prop drilling and DOM nesting issues.

## 📄 License

MIT

---
