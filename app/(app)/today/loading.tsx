// app/(app)/today/loading.tsx

import { Clock, Sparkles } from "lucide-react";

export default function TodayLoading() {
  return (
    <div className="space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Overview skeleton */}
      <div className="flex items-center gap-2 px-5 py-3 bg-surface rounded-2xl border border-border shadow-sm flex-wrap">
        <div className="flex items-center gap-2 mr-3">
          <div className="p-1.5 rounded-lg bg-primary-bg">
            <Clock size={14} className="text-primary" />
          </div>
          <div className="h-4 w-12 bg-border rounded-md animate-pulse" />
        </div>
        <div className="h-6 w-px bg-border hidden sm:block" />
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-7 h-7 rounded-md bg-border animate-pulse" />
              <div className="h-4 w-12 bg-border rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Timer skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <Clock size={20} className="text-primary animate-pulse" />
            </div>
            <div className="h-6 w-32 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-border rounded-xl animate-pulse" />
        </div>
        <div className="px-6 pb-4">
          <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-10 bg-border rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="px-6 pb-6 text-center">
          <div className="h-20 w-48 bg-border rounded-lg animate-pulse mx-auto mb-8" />
          <div className="flex items-center justify-center gap-3">
            <div className="h-12 w-36 bg-border rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Dashboard sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Habits section */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-secondary-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-36 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-bg rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Tasks section */}
        <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-success-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-28 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-16 bg-bg rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Goals section skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary-bg">
            <div className="w-5 h-5 bg-border rounded animate-pulse" />
          </div>
          <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 bg-bg rounded-xl border border-border animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-surface rounded-2xl border border-border shadow-sm">
          <Sparkles size={16} className="text-primary animate-pulse" />
          <span className="text-sm font-medium text-text-muted">
            Loading your dashboard...
          </span>
        </div>
      </div>
    </div>
  );
}
