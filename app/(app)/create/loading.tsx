// app/(app)/create/loading.tsx

import { Plus } from "lucide-react";

export default function CreateLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-40 bg-border rounded-lg animate-pulse" />
        <div className="h-4 w-72 bg-border rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selector skeleton */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-2">
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 py-4 px-4 rounded-xl bg-border animate-pulse"
                >
                  <div className="w-6 h-6 bg-border rounded" />
                  <div className="h-4 w-12 bg-border rounded-md" />
                </div>
              ))}
            </div>
            <div className="h-4 w-48 bg-border rounded-md animate-pulse mx-auto mt-3" />
          </div>

          {/* Form skeleton */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
            {/* Title input */}
            <div className="space-y-2">
              <div className="h-4 w-12 bg-border rounded-md animate-pulse" />
              <div className="h-12 bg-border rounded-xl animate-pulse" />
            </div>

            {/* Description input */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-border rounded-md animate-pulse" />
              <div className="h-24 bg-border rounded-xl animate-pulse" />
            </div>

            {/* Goal Type selector */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-border rounded-md animate-pulse" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-border rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Target Value & Unit */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-border rounded-md animate-pulse" />
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3 h-12 bg-border rounded-xl animate-pulse" />
                <div className="col-span-2 h-12 bg-border rounded-xl animate-pulse" />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-border rounded-md animate-pulse" />
              <div className="h-14 bg-border rounded-xl animate-pulse" />
            </div>

            {/* Priority selector */}
            <div className="space-y-2">
              <div className="h-4 w-16 bg-border rounded-md animate-pulse" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-border rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2">
              <div className="h-4 w-12 bg-border rounded-md animate-pulse" />
              <div className="flex gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-xl bg-border animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Preview section */}
            <div className="space-y-4 pt-4 border-t-2 border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-border animate-pulse" />
                <div className="h-4 w-16 bg-border rounded-md animate-pulse" />
              </div>
              <div className="bg-surface rounded-2xl border-2 border-border p-5 space-y-4">
                <div className="h-2 bg-border w-full" />
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-border animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-12 bg-border rounded-full animate-pulse" />
                      <div className="h-4 w-16 bg-border rounded-full animate-pulse" />
                    </div>
                    <div className="h-6 w-48 bg-border rounded-lg animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full bg-border rounded-md animate-pulse" />
                      <div className="h-3 w-2/3 bg-border rounded-md animate-pulse" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-border rounded-md animate-pulse" />
                  <div className="h-2 bg-border rounded-full" />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t-2 border-border">
              <div className="flex-1 h-12 bg-border rounded-xl animate-pulse" />
              <div className="flex-1 h-12 bg-border rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Date Picker Card skeleton */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-bg">
                <div className="w-4 h-4 bg-border rounded animate-pulse" />
              </div>
              <div className="h-4 w-12 bg-border rounded-md animate-pulse" />
            </div>

            {/* Start date */}
            <div className="space-y-2">
              <div className="h-16 bg-border rounded-xl animate-pulse" />
            </div>

            {/* End date */}
            <div className="space-y-2">
              <div className="h-16 bg-border rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Calendar skeleton */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 bg-border rounded-lg animate-pulse" />
              <div className="h-5 w-32 bg-border rounded-md animate-pulse" />
              <div className="w-8 h-8 bg-border rounded-lg animate-pulse" />
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-4 bg-border rounded animate-pulse" />
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-border rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Context Panel skeleton */}
          <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="h-5 w-24 bg-border rounded-lg animate-pulse" />

              {/* Stats */}
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-border w-9 h-9" />
                      <div className="h-4 w-20 bg-border rounded-md" />
                    </div>
                    <div className="h-5 w-8 bg-border rounded-md" />
                  </div>
                ))}
              </div>

              {/* Tip */}
              <div className="space-y-3 pt-4 border-t-2 border-border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-border rounded animate-pulse" />
                  <div className="h-4 w-16 bg-border rounded-md animate-pulse" />
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-border">
                  <div className="h-3 w-full bg-border rounded-md animate-pulse" />
                  <div className="h-3 w-5/6 bg-border rounded-md animate-pulse" />
                  <div className="h-3 w-4/6 bg-border rounded-md animate-pulse" />
                </div>
              </div>

              {/* Consistency card */}
              <div className="bg-gradient-to-br from-primary-bg to-secondary-bg rounded-xl p-5 border border-primary/20 space-y-2 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-border rounded" />
                  <div className="h-4 w-32 bg-border rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-border rounded-md" />
                  <div className="h-3 w-3/4 bg-border rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
