"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services";
import { Lock, CheckCircle, ArrowLeft, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Invalid reset link");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("Invalid or expired reset link");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <XCircle size={48} className="text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Invalid Link</h2>
        <p className="text-text-secondary text-sm mb-4">
          This password reset link is invalid.
        </p>
        <Link
          href="/forgot-password"
          className="text-primary text-sm font-medium"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle size={48} className="text-success mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text mb-2">Password Reset!</h2>
        <p className="text-text-secondary text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="flex items-center gap-1 text-sm text-text-muted mb-6"
      >
        <ArrowLeft size={16} /> Back to login
      </Link>
      <h2 className="text-2xl font-bold text-text mb-2">Reset your password</h2>
      <p className="text-text-secondary text-sm mb-6">
        Enter your new password.
      </p>

      {error && (
        <div className="bg-danger-bg text-danger p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-border"
            placeholder="New password (min. 6 characters)"
          />
        </div>
        <div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-border"
            placeholder="Confirm new password"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-medium"
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
