// app/(app)/analytics/loading.tsx

import { BarChart3 } from "lucide-react";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-primary-bg">
          <BarChart3 size={28} className="text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-8 w-36 bg-border rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-border rounded-md animate-pulse" />
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl border-2 border-border p-5 space-y-4 animate-pulse"
          >
            <div className="w-10 h-10 rounded-xl bg-border" />
            <div className="space-y-2">
              <div className="h-7 w-16 bg-border rounded-lg" />
              <div className="h-3 w-20 bg-border rounded-md" />
              <div className="h-3 w-16 bg-border rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goal Progress Chart skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
          </div>
          {/* Chart area */}
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-24 bg-border rounded-md animate-pulse" />
                <div className="flex-1 h-4 bg-border rounded-md animate-pulse" />
                <div className="h-4 w-12 bg-border rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Habit Consistency Chart skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-40 bg-border rounded-lg animate-pulse" />
          </div>
          {/* Chart area */}
          <div className="space-y-4">
            <div className="h-48 bg-bg rounded-xl animate-pulse" />
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-border" />
                <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-border" />
                <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Distribution skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-5 w-40 bg-border rounded-lg animate-pulse" />
              <div className="h-3 w-20 bg-border rounded-md animate-pulse" />
            </div>
          </div>
          {/* Donut chart placeholder */}
          <div className="flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-8 border-border animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-border" />
                <div className="h-3 w-32 bg-border rounded-md animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Patterns skeleton */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-warning-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-44 bg-border rounded-lg animate-pulse" />
          </div>

          {/* Habit Load by Day */}
          <div className="space-y-3">
            <div className="h-4 w-32 bg-border rounded-md animate-pulse" />
            <div className="flex items-end gap-1.5 h-28">
              {[40, 65, 80, 55, 70, 45, 30].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t-lg bg-border animate-pulse"
                    style={{ height: `${height}%` }}
                  />
                  <div className="h-3 w-8 bg-border rounded-md animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          {/* Priority Distribution */}
          <div className="space-y-3">
            <div className="h-4 w-36 bg-border rounded-md animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-16 bg-border rounded-md animate-pulse" />
                <div className="flex-1 h-2.5 bg-border rounded-full animate-pulse" />
                <div className="h-4 w-8 bg-border rounded-md animate-pulse" />
              </div>
            ))}
          </div>
          {/* Weekly Wins */}
          <div className="bg-success-bg/50 rounded-xl p-5 border border-success/20 space-y-2 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-border rounded" />
              <div className="h-4 w-20 bg-border rounded-md" />
            </div>
            <div className="h-8 w-16 bg-border rounded-lg" />
            <div className="h-3 w-28 bg-border rounded-md" />
          </div>
        </div>
      </div>

      {/* Daily Breakdown skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-36 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-1 bg-bg rounded-xl border border-border">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 w-16 bg-border rounded-lg animate-pulse"
                />
              ))}
            </div>
            <div className="h-9 w-9 bg-border rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <div className="w-8 h-8 bg-border rounded-lg animate-pulse" />
          <div className="h-5 w-48 bg-border rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-border rounded-lg animate-pulse" />
        </div>

        {/* Line chart area */}
        <div className="h-64 bg-bg rounded-xl animate-pulse" />

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border-2 border-border p-5 space-y-3 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-border w-9 h-9" />
                <div className="h-3 w-16 bg-border rounded-md" />
              </div>
              <div className="h-7 w-20 bg-border rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Comparisons skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-info-bg">
            <div className="w-5 h-5 bg-border rounded animate-pulse" />
          </div>
          <div className="h-5 w-28 bg-border rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-bg rounded-2xl p-5 border border-border space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-border rounded-md" />
                <div className="p-1.5 rounded-lg bg-border w-8 h-8" />
              </div>
              <div className="h-8 w-16 bg-border rounded-lg" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-border rounded-md" />
                <div className="h-3 w-12 bg-border rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-bg to-secondary-bg">
                <div className="w-5 h-5 bg-border rounded animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="h-5 w-28 bg-border rounded-lg animate-pulse" />
                <div className="h-3 w-32 bg-border rounded-md animate-pulse" />
              </div>
            </div>
            <div className="w-9 h-9 bg-border rounded-xl animate-pulse" />
          </div>

          {/* Insight cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border-2 border-border bg-bg animate-pulse"
              >
                <div className="p-2.5 rounded-xl bg-border w-11 h-11" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 bg-border rounded-md" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-border rounded-md" />
                    <div className="h-3 w-5/6 bg-border rounded-md" />
                    <div className="h-3 w-4/6 bg-border rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-info-bg">
            <div className="w-5 h-5 bg-border rounded animate-pulse" />
          </div>
          <div className="h-5 w-36 bg-border rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3.5 rounded-xl bg-bg border border-border animate-pulse"
            >
              <div className="p-1.5 rounded-lg bg-border w-8 h-8" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-border rounded-md" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-24 bg-border rounded-full" />
                  <div className="h-3 w-28 bg-border rounded-md" />
                </div>
              </div>
              <div className="h-6 w-16 bg-border rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
