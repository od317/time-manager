"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";

const filters = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Failed", value: "FAILED" },
];

export function GoalFilters() {
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
    router.push(`/goals?${params.toString()}`);
  };

  return (
    <div className="flex gap-1.5 p-1.5 bg-bg rounded-2xl border border-border w-fit">
      {filters.map((filter) => (
        <motion.button
          key={filter.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleFilter(filter.value)}
          className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            currentStatus === filter.value
              ? "text-text"
              : "text-text-muted hover:text-text"
          }`}
        >
          {currentStatus === filter.value && (
            <motion.div
              layoutId="activeGoalFilter"
              className="absolute inset-0 bg-surface rounded-xl shadow-sm border border-border"
              transition={{ duration: 0.2 }}
            />
          )}
          <span className="relative z-10">{filter.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
