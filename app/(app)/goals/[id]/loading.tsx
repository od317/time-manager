// app/(app)/goals/[id]/loading.tsx


export default function GoalDetailLoading() {
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
            <div className="h-8 w-72 bg-border rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-border rounded-md animate-pulse" />
              <div className="h-4 w-2/3 bg-border rounded-md animate-pulse" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-7 w-20 bg-border rounded-full animate-pulse" />
              <div className="h-7 w-16 bg-border rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-border rounded-full animate-pulse" />
              <div className="h-7 w-32 bg-border rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Update skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-bg">
            <div className="w-5 h-5 bg-border rounded animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
            <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
          </div>
        </div>

        {/* Current progress display */}
        <div className="flex items-center justify-between p-4 bg-bg rounded-xl">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
            <div className="h-7 w-32 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-16 bg-border rounded-md animate-pulse" />
            <div className="h-7 w-20 bg-border rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-1 h-10 bg-border rounded-xl animate-pulse"
            />
          ))}
        </div>

        {/* Input field */}
        <div className="flex gap-2">
          <div className="flex-1 h-12 bg-border rounded-xl animate-pulse" />
          <div className="h-12 w-12 bg-border rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Progress chart skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-bg">
            <div className="w-5 h-5 bg-border rounded animate-pulse" />
          </div>
          <div className="h-5 w-24 bg-border rounded-lg animate-pulse" />
        </div>

        {/* Goal completion bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-border rounded-md animate-pulse" />
            <div className="h-4 w-8 bg-border rounded-md animate-pulse" />
          </div>
          <div className="h-3 bg-border rounded-full" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-32 bg-border rounded-md animate-pulse" />
            <div className="h-3 w-24 bg-border rounded-md animate-pulse" />
          </div>
        </div>

        {/* Time elapsed bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-border rounded-md animate-pulse" />
            <div className="h-4 w-8 bg-border rounded-md animate-pulse" />
          </div>
          <div className="h-3 bg-border rounded-full" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 bg-border rounded-md animate-pulse" />
            <div className="h-3 w-28 bg-border rounded-md animate-pulse" />
          </div>
        </div>

        {/* Timeline analysis */}
        <div className="p-4 bg-bg rounded-xl border border-border space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-border rounded animate-pulse" />
            <div className="h-3 w-28 bg-border rounded-md animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-24 bg-border rounded-md animate-pulse" />
            <div className="h-4 w-4 bg-border rounded-md animate-pulse" />
            <div className="h-4 w-20 bg-border rounded-md animate-pulse" />
            <div className="h-4 w-20 bg-border rounded-full animate-pulse ml-auto" />
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
              <div className="h-7 w-16 bg-border rounded-lg" />
              <div className="h-3 w-20 bg-border rounded-md" />
              <div className="h-3 w-24 bg-border rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Tasks section skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="h-5 w-16 bg-border rounded-lg animate-pulse" />
              <div className="h-3 w-16 bg-border rounded-md animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-28 bg-border rounded-xl animate-pulse" />
        </div>
        <div className="px-6 pb-6 space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-border bg-bg animate-pulse"
            >
              <div className="w-5 h-5 rounded-lg bg-border" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-border rounded-md" />
                <div className="flex items-center gap-2">
                  <div className="h-3 w-16 bg-border rounded-md" />
                  <div className="h-3 w-12 bg-border rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-goals section skeleton */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-info-bg">
              <div className="w-5 h-5 bg-border rounded animate-pulse" />
            </div>
            <div className="h-5 w-32 bg-border rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-border rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-bg border-2 border-border animate-pulse"
            >
              <div className="w-3 h-3 rounded-full bg-border" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-36 bg-border rounded-md" />
                  <div className="h-5 w-16 bg-border rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-16 bg-border rounded-md" />
                    <div className="h-3 w-8 bg-border rounded-md" />
                  </div>
                  <div className="h-2 bg-border rounded-full" />
                </div>
              </div>
              <div className="w-5 h-5 bg-border rounded" />
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
        <div className="flex gap-3 flex-wrap">
          <div className="h-12 w-36 bg-border rounded-2xl animate-pulse" />
          <div className="h-12 w-32 bg-border rounded-2xl animate-pulse" />
          <div className="h-12 w-28 bg-border rounded-2xl animate-pulse" />
          <div className="h-12 w-28 bg-border rounded-2xl animate-pulse ml-auto" />
        </div>
      </div>
    </div>
  );
}
