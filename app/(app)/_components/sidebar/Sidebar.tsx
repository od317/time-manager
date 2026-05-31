"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Repeat,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
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
    <div
      className={`flex flex-col h-full bg-surface border-r border-border transition-all duration-300 ${
        isSidebarOpen ? "w-[280px]" : "w-[72px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-border ${
          isSidebarOpen ? "justify-between" : "justify-center"
        }`}
      >
        {isSidebarOpen ? (
          <>
            <Link href="/today" className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-xl font-bold text-text">TimeFlow</span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
            >
              <ChevronLeft size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isSidebarOpen ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-primary-bg text-primary"
                  : "text-text-secondary hover:bg-border-light hover:text-text"
              } ${!isSidebarOpen ? "justify-center" : ""}`}
            >
              <Icon size={20} />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Toggle button at bottom (when open) */}
      {isSidebarOpen && (
        <div className="px-4 pb-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-text-muted hover:text-text rounded-lg hover:bg-border-light transition-all"
          >
            <ChevronLeft size={16} />
            <span>Collapse</span>
          </button>
        </div>
      )}

      {/* User section */}
      <div
        className={`p-3 border-t border-border ${
          isSidebarOpen ? "px-4" : "px-2"
        }`}
      >
        {isSidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-bg text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() ||
                user?.email?.charAt(0)?.toUpperCase() ||
                "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-all flex-shrink-0"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary-bg text-primary flex items-center justify-center font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger-bg transition-all"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
