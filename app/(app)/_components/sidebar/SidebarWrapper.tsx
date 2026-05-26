"use client";

import { useUIStore } from "@/store/uiStore";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div
      className={`flex flex-1 flex-col transition-all duration-300 ${
        isSidebarOpen ? "md:pl-[280px]" : "md:pl-[72px]"
      }`}
    >
      {children}
    </div>
  );
}
