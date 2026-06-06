"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Repeat,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/uiStore";

const navigation = [
  { name: "Today", href: "/today", icon: LayoutDashboard },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Habits", href: "/habits", icon: Repeat },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isSidebarOpen ? 280 : 72,
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        width: { duration: 0.3 },
      }}
      className="flex flex-col h-full bg-surface border-r border-border overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border flex-shrink-0">
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full"
            >
              <Link
                href="/today"
                className="flex items-center gap-3 group flex-1 min-w-0"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  <Clock size={26} className="text-primary" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xl font-bold gradient-text whitespace-nowrap overflow-hidden"
                >
                  TimeFlow
                </motion.span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors flex-shrink-0"
              >
                <ChevronLeft size={18} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center w-full"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors"
              >
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Clock size={26} className="text-primary" />
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isSidebarOpen ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative group ${
                active
                  ? "bg-primary-bg text-primary shadow-sm"
                  : "text-text-secondary hover:bg-border-light hover:text-text"
              } ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              <Icon size={20} className="flex-shrink-0" />

              {/* Label - always render but hide when collapsed */}
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isSidebarOpen
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                {item.name}
              </span>

              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Tooltip for collapsed state */}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-text text-bg text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-200 shadow-lg">
                  {item.name}
                  {/* Arrow */}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-text rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle button at bottom */}
      <div className="flex-shrink-0 px-2 pb-2">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.button
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors mb-2"
            >
              <ChevronLeft size={16} />
              <span className="whitespace-nowrap">Collapse</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* User section */}
      <div className="flex-shrink-0 p-3 border-t border-border">
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div
              key="user-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-3"
            >
              {user ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center font-semibold text-sm text-white shadow-sm flex-shrink-0"
                  >
                    {user.name?.charAt(0)?.toUpperCase() ||
                      user.email?.charAt(0)?.toUpperCase() ||
                      "?"}
                  </motion.div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-medium text-text truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {user.email}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={logout}
                    className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-colors flex-shrink-0"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </motion.button>
                </>
              ) : (
                <>
                  {/* User skeleton */}
                  <div className="w-9 h-9 rounded-full bg-border animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 bg-border rounded animate-pulse w-24" />
                    <div className="h-3 bg-border rounded animate-pulse w-32" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-border animate-pulse flex-shrink-0" />
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="user-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-2"
            >
              {user ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center font-semibold text-sm text-white shadow-sm"
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={logout}
                    className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-border animate-pulse" />
                  <div className="w-8 h-8 rounded-lg bg-border animate-pulse" />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
