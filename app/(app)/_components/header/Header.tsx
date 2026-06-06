"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

const pageTitles: Record<string, string> = {
  "/today": "Today",
  "/goals": "Goals",
  "/habits": "Habits",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const parentPath = "/" + pathname.split("/")[1];
  if (pageTitles[parentPath]) return pageTitles[parentPath];
  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 glass border-b border-border"
    >
      <div className="flex items-center gap-3">
        <AnimatePresence mode="wait">
          <motion.h1
            key={title}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-text"
          >
            {title}
          </motion.h1>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Desktop user menu */}
        <div className="hidden md:block">
          <UserMenu />
        </div>

        {/* Mobile user menu */}
        <div className="md:hidden">
          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}
