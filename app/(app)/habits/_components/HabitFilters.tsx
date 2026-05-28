"use client";

import { useRouter, useSearchParams } from "next/navigation";

const filters = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Paused", value: "PAUSED" },
  { label: "Archived", value: "ARCHIVED" },
];

export function HabitFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "";

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`/habits?${params.toString()}`);
  };

  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilter(filter.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            currentStatus === filter.value
              ? "bg-primary text-white"
              : "bg-surface border border-border text-text-secondary hover:border-primary/30"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
