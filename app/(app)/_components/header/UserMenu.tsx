"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { LogOut, ChevronDown, Settings, HelpCircle } from "lucide-react";

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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-border-light transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center font-semibold text-sm text-white shadow-sm">
          {user?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className="text-text-muted" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-lg border border-border py-1 z-50 overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border bg-bg/50">
              <p className="text-sm font-medium text-text">{user?.name}</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">
                {user?.email}
              </p>
            </div>

            <div className="py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-border-light transition-colors">
                <Settings size={16} />
                Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-border-light transition-colors">
                <HelpCircle size={16} />
                Help & Support
              </button>
            </div>

            <div className="border-t border-border pt-1">
              <motion.button
                whileHover={{ backgroundColor: "var(--color-danger-bg)" }}
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:text-danger-light transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
