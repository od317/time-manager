"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/api";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (password.length > 50) {
      newErrors.password = "Password must be less than 50 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: ApiError): string => {
    switch (error.code) {
      case "CONFLICT":
        return "An account with this email already exists. Please sign in instead.";
      case "VALIDATION_ERROR":
        if (error.errors?.email) return error.errors.email[0];
        if (error.errors?.password) return error.errors.password[0];
        return "Please check your information and try again.";
      case "NETWORK_ERROR":
        return "Unable to connect. Please check your internet connection.";
      case "TIMEOUT":
        return "Request timed out. Please try again.";
      default:
        return error.message || "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    try {
      await register(email, password, name.trim());
      router.push("/today");
    } catch (err) {
      const apiError = err as ApiError;
      setServerError(getErrorMessage(apiError));
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-text mb-6">
        Create your account
      </h2>

      {serverError && (
        <div className="bg-danger-bg text-danger border border-danger/20 rounded-lg p-3 mb-6 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            autoComplete="name"
            className={`w-full px-4 py-2.5 rounded-lg border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:ring-primary/20 focus:border-primary"
            }`}
            placeholder="Your full name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-danger">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            autoComplete="email"
            className={`w-full px-4 py-2.5 rounded-lg border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
              errors.email
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:ring-primary/20 focus:border-primary"
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-danger">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            autoComplete="new-password"
            className={`w-full px-4 py-2.5 rounded-lg border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
              errors.password
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:ring-primary/20 focus:border-primary"
            }`}
            placeholder="Min. 6 characters"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-danger">{errors.password}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            autoComplete="new-password"
            className={`w-full px-4 py-2.5 rounded-lg border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-all ${
              errors.confirmPassword
                ? "border-danger focus:ring-danger/20"
                : "border-border focus:ring-primary/20 focus:border-primary"
            }`}
            placeholder="Repeat your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-danger">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-text-muted mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-primary-dark font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
