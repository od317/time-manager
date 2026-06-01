"use client";

import { useUIStore } from "@/store/uiStore";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="relative p-2 text-text-muted hover:text-text rounded-xl hover:bg-border-light transition-colors overflow-hidden"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
