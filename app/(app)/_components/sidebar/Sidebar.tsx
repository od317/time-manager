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
  Sparkles,
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
    <motion.div
      layout
      className={`flex flex-col h-full bg-surface border-r border-border ${
        isSidebarOpen ? "w-[280px]" : "w-[72px]"
      }`}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-border ${
          isSidebarOpen ? "justify-between" : "justify-center"
        }`}
      >
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Link href="/today" className="flex items-center gap-2 group">
                <motion.span
                  className="text-2xl"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  ⏱️
                </motion.span>
                <span className="text-xl font-bold gradient-text">
                  TimeFlow
                </span>
              </Link>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleSidebar}
                className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors"
              >
                <ChevronLeft size={18} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors"
            >
              <motion.span
                className="text-2xl block"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                ⏱️
              </motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={item.href}
                title={!isSidebarOpen ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                  active
                    ? "bg-primary-bg text-primary shadow-sm"
                    : "text-text-secondary hover:bg-border-light hover:text-text"
                } ${!isSidebarOpen ? "justify-center" : ""}`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.name}
                  </motion.span>
                )}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ duration: 0.2 }}
                  />
                )}
                {!active && !isSidebarOpen && (
                  <motion.div
                    className="absolute left-full ml-2 px-2 py-1 bg-text text-bg text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50"
                    initial={{ opacity: 0, x: -5 }}
                    whileHover={{ opacity: 1, x: 0 }}
                  >
                    {item.name}
                  </motion.div>
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Toggle button at bottom (when open) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-2"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User section */}
      <div
        className={`p-3 border-t border-border ${
          isSidebarOpen ? "px-4" : "px-2"
        }`}
      >
        <AnimatePresence mode="wait">
          {isSidebarOpen ? (
            <motion.div
              key="user-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center font-semibold text-sm text-white shadow-sm flex-shrink-0"
              >
                {user?.name?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "?"}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-text-muted truncate">
                  {user?.email}
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
            </motion.div>
          ) : (
            <motion.div
              key="user-collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center font-semibold text-sm text-white shadow-sm"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "?"}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
