// app/(app)/goals/_components/GoalsSkeleton.tsx
export function GoalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-border rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-border rounded-lg animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-border rounded-2xl animate-pulse" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-10 w-20 bg-border rounded-xl animate-pulse"
          />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-surface rounded-2xl border border-border animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
