import { BarChart3 } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text flex items-center gap-2">
        <BarChart3 size={28} className="text-primary" />
        Analytics
      </h2>
      <p className="text-text-muted text-sm mt-1">
        Track your progress, habits, and productivity patterns
      </p>
    </div>
  );
}
