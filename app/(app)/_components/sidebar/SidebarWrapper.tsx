"use client";

import { motion } from "framer-motion";
import { useUIStore } from "@/store/uiStore";

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <motion.div
      layout
      className={`flex flex-1 flex-col min-w-0 ${
        isSidebarOpen ? "md:pl-[280px]" : "md:pl-[72px]"
      }`}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
