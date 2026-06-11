// app/(app)/goals/_components/GoalsSkeleton.tsx
export function GoalsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-28 bg-border rounded-lg animate-pulse mb-2" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 bg-border rounded-md animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-border" />
              <div className="h-4 w-16 bg-border rounded-md animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-12 w-36 bg-border rounded-2xl animate-pulse" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl border border-border w-fit">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-10 w-24 bg-border rounded-xl animate-pulse"
          />
        ))}
      </div>

      {/* Goal cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl border-2 border-border overflow-hidden animate-pulse"
          >
            {/* Color bar */}
            <div className="h-1.5 w-full bg-border" />

            <div className="p-5 space-y-4">
              {/* Card header */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-border" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-48 bg-border rounded-lg" />
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-16 bg-border rounded-full" />
                      <div className="h-6 w-20 bg-border rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-border rounded-md" />
                    <div className="h-3 w-2/3 bg-border rounded-md" />
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-3 w-16 bg-border rounded-md" />
                  <div className="h-3 w-8 bg-border rounded-md" />
                </div>
                <div className="h-2 bg-border rounded-full" />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-border rounded-md" />
                  <div className="h-4 w-28 bg-border rounded-md" />
                </div>
                <div className="h-4 w-28 bg-border rounded-md" />
              </div>
            </div>

            {/* Add sub-goal button */}
            <div className="px-5 pb-4">
              <div className="h-6 w-28 bg-border rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
