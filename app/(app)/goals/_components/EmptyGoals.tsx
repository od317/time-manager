import { Target } from "lucide-react";

export function EmptyGoals() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-primary-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Target size={32} className="text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">No goals yet</h3>
      <p className="text-text-muted text-sm max-w-sm mx-auto">
        Create your first goal to start tracking your progress and achieving
        what matters most.
      </p>
    </div>
  );
}
