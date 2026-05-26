"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { User, LogOut, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-border-light transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-primary-bg text-primary flex items-center justify-center font-semibold text-sm">
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <ChevronDown size={16} className="text-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border py-1 z-50 animate-slide-down">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-text">{user?.name}</p>
            <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-all"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
