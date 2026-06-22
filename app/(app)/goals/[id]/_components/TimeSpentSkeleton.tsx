// components/goals/TimeSpentSkeleton.tsx
export function TimeSpentSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border-2 border-border p-5 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-border mb-4" />
      <div className="h-7 w-20 bg-border rounded mb-2" />
      <div className="h-3 w-16 bg-border rounded" />
      <div className="h-2 w-12 bg-border rounded mt-1" />
    </div>
  );
}
