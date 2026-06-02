"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/lib/services";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="p-4 rounded-full bg-success-bg inline-flex mb-4">
            <CheckCircle size={48} className="text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-2">
            Check your email
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            We sent a password reset link to{" "}
            <span className="font-semibold text-text">{email}</span>
          </p>
          <p className="text-text-muted text-xs mb-6">
            {"Didn't"} receive it? Check your spam folder or{" "}
            <button
              onClick={() => {
                setSent(false);
                handleSubmit({ preventDefault: () => {} } as React.FormEvent);
              }}
              className="text-primary font-medium hover:underline"
            >
              click here to resend
            </button>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </motion.div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text mb-2">
              Forgot password?
            </h2>
            <p className="text-text-muted text-sm">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-4 mb-6 text-sm font-medium flex items-center gap-3"
              >
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-text mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-border bg-bg text-text placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  placeholder="you@example.com"
                  autoFocus
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={isLoading || !email.trim()}
              className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Reset Link
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-border text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
}
