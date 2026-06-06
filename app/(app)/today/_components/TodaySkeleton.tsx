// _components/TodaySkeleton.tsx
"use client";

import { Clock, Sparkles } from "lucide-react";

export function TodaySkeleton() {
  return (
    <div className="space-y-6 pb-20 md:pb-6">
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
      <div className="bg-surface rounded-2xl border border-border shadow-sm">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <Clock size={20} className="text-primary" />
            </div>
            <div className="h-6 w-32 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-border rounded-xl animate-pulse" />
        </div>
        <div className="px-6 pb-6 text-center">
          <div className="h-20 w-48 bg-border rounded-lg animate-pulse mx-auto mb-8" />
          <div className="h-12 w-36 bg-border rounded-2xl animate-pulse mx-auto" />
        </div>
      </div>

      {/* Dashboard sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl border border-border shadow-sm p-5"
          >
            <div className="h-5 w-32 bg-border rounded-lg animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div
                  key={j}
                  className="h-16 bg-bg rounded-xl border border-border animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Goals skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-5">
        <div className="h-5 w-32 bg-border rounded-lg animate-pulse mb-4" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 bg-bg rounded-xl border border-border animate-pulse"
            />
          ))}
        </div>
      </div>

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
