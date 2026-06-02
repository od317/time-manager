// app/(app)/habits/loading.tsx

import { Repeat } from "lucide-react";

export default function HabitsLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-32 bg-border rounded-lg animate-pulse mb-2" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-border rounded-md animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="h-4 w-24 bg-border rounded-md animate-pulse" />
          </div>
        </div>
        <div className="h-12 w-36 bg-border rounded-2xl animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl border border-border w-fit">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-20 bg-border rounded-xl animate-pulse"
          />
        ))}
      </div>

      {/* Today's Habits section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 rounded-lg bg-secondary-bg">
            <Repeat size={14} className="text-secondary" />
          </div>
          <div className="h-5 w-36 bg-border rounded-lg animate-pulse" />
          <div className="h-5 w-8 bg-border rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-border p-5 space-y-4 animate-pulse"
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-border rounded-lg" />
                    <div className="h-3 w-20 bg-border rounded-md" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-16 bg-border rounded-full" />
                  <div className="h-6 w-16 bg-border rounded-full" />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-border rounded-md" />
                <div className="h-3 w-3/4 bg-border rounded-md" />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg rounded-xl p-3 space-y-2">
                  <div className="h-3 w-12 bg-border rounded-md" />
                  <div className="h-6 w-16 bg-border rounded-lg" />
                </div>
                <div className="bg-bg rounded-xl p-3 space-y-2">
                  <div className="h-3 w-12 bg-border rounded-md" />
                  <div className="h-6 w-24 bg-border rounded-lg" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-20 bg-border rounded-md" />
                  <div className="h-3 w-8 bg-border rounded-md" />
                </div>
                <div className="h-1.5 bg-border rounded-full" />
              </div>

              {/* Action button */}
              <div className="h-12 bg-border rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Other Habits section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1.5 rounded-lg bg-bg">
            <Repeat size={14} className="text-text-muted" />
          </div>
          <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
          <div className="h-5 w-8 bg-border rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-border p-5 space-y-4 animate-pulse opacity-60"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="space-y-2">
                    <div className="h-5 w-28 bg-border rounded-lg" />
                    <div className="h-3 w-16 bg-border rounded-md" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-border rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bg rounded-xl p-3 space-y-2">
                  <div className="h-3 w-12 bg-border rounded-md" />
                  <div className="h-6 w-16 bg-border rounded-lg" />
                </div>
                <div className="bg-bg rounded-xl p-3 space-y-2">
                  <div className="h-3 w-12 bg-border rounded-md" />
                  <div className="h-6 w-20 bg-border rounded-lg" />
                </div>
              </div>
              <div className="h-12 bg-border rounded-xl w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
