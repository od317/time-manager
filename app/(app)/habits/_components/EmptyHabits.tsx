import { Repeat } from "lucide-react";
import Link from "next/link";

export function EmptyHabits() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Repeat size={32} className="text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold text-text mb-2">No habits yet</h3>
      <p className="text-text-muted text-sm max-w-sm mx-auto mb-4">
        Build lasting routines by creating daily or weekly habits.
      </p>
      <Link
        href="/create?tab=habit"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
      >
        Create your first habit
      </Link>
    </div>
  );
}
