// app/(app)/habits/[id]/loading.tsx

export default function HabitDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-6">
        {/* Back button */}
        <div className="h-5 w-32 bg-border rounded-md animate-pulse" />

        {/* Title section */}
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-border animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-border rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-border rounded-md animate-pulse" />
              <div className="h-4 w-3/4 bg-border rounded-md animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-20 bg-border rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-border rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-border rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-border rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl border-2 border-border p-5 space-y-4 animate-pulse"
          >
            <div className="w-10 h-10 rounded-xl bg-border" />
            <div className="space-y-2">
              <div className="h-8 w-16 bg-border rounded-lg" />
              <div className="h-3 w-20 bg-border rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-info-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
              <div className="h-3 w-40 bg-border rounded-md animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-border rounded-lg animate-pulse" />
            <div className="h-5 w-12 bg-border rounded-md animate-pulse" />
            <div className="h-8 w-8 bg-border rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="space-y-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 53 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-3.5 h-3.5 rounded-sm bg-border animate-pulse"
                    style={{ animationDelay: `${(i + j) * 0.01}s` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-8 bg-border rounded-md animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-sm bg-border animate-pulse"
            />
          ))}
          <div className="h-3 w-8 bg-border rounded-md animate-pulse" />
        </div>
      </div>

      {/* Activity log skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 pb-4 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-info-bg">
            <div className="w-5 h-5 bg-border rounded animate-pulse" />
          </div>
          <div className="h-5 w-36 bg-border rounded-lg animate-pulse" />
          <div className="h-5 w-8 bg-border rounded-full animate-pulse" />
        </div>
        <div className="px-6 pb-6 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3.5 rounded-xl border-2 border-border bg-bg animate-pulse"
            >
              <div className="w-8 h-8 rounded-lg bg-border" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-border rounded-md" />
                  <div className="h-4 w-16 bg-border rounded-full" />
                </div>
                <div className="h-3 w-48 bg-border rounded-md" />
              </div>
              <div className="h-4 w-20 bg-border rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Actions skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-bg">
            <div className="w-5 h-5 bg-border rounded animate-pulse" />
          </div>
          <div className="h-5 w-20 bg-border rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-36 bg-border rounded-2xl animate-pulse" />
          <div className="h-12 w-36 bg-border rounded-2xl animate-pulse" />
          <div className="h-12 w-28 bg-border rounded-2xl animate-pulse" />
          <div className="h-12 w-28 bg-border rounded-2xl animate-pulse ml-auto" />
        </div>
      </div>
    </div>
  );
}
