import Link from "next/link";
import { Plus } from "lucide-react";

export function HabitCreateButton() {
  return (
    <Link
      href="/create?tab=habit"
      className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
    >
      <Plus size={18} />
      <span className="hidden sm:inline">New Habit</span>
    </Link>
  );
}
