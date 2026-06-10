// app/(app)/today/error.tsx
"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TodayError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Today page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="w-20 h-20 rounded-2xl bg-danger-bg border-2 border-danger/20 flex items-center justify-center">
          <AlertTriangle size={36} className="text-danger" />
        </div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger flex items-center justify-center"
        >
          <span className="text-white text-[10px] font-bold">!</span>
        </motion.div>
      </motion.div>

      {/* Error Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h2 className="text-xl font-bold text-text">Something went wrong</h2>
        <p className="text-sm text-text-muted max-w-md">
          We couldn&apos;t load your dashboard. This might be a temporary issue.
        </p>
      </motion.div>

      {/* Error Details (collapsed by default) */}
      {error.digest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-surface rounded-xl border border-border px-4 py-2"
        >
          <p className="text-xs text-text-muted font-mono">
            Error ID: {error.digest}
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
        >
          <RefreshCw size={18} />
          Try again
        </motion.button>

        <Link
          href={"/today"}
          className="flex items-center gap-2 px-5 py-3 bg-bg text-text-secondary rounded-2xl font-semibold border-2 border-border hover:border-primary/30 transition-all"
        >
          <Home size={18} />
          Go home
        </Link>
      </motion.div>

      {/* Help Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-text-muted text-center"
      >
        If the problem persists, try refreshing the page or contact support.
      </motion.p>
    </div>
  );
}
