"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { ApiError } from "@/lib/api";
import {
  Mail,
  Lock,
  User,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  // Password strength indicator
  const getPasswordStrength = (
    pwd: string,
  ): { strength: string; color: string; width: string } => {
    if (pwd.length === 0) return { strength: "", color: "", width: "0%" };
    if (pwd.length < 6)
      return { strength: "Weak", color: "bg-danger", width: "25%" };
    if (pwd.length < 8)
      return { strength: "Fair", color: "bg-warning", width: "50%" };
    if (pwd.length < 10)
      return { strength: "Good", color: "bg-info", width: "75%" };
    return { strength: "Strong", color: "bg-success", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-text">Create your account</h2>
        <p className="text-text-muted text-sm mt-1">
          Start your productivity journey
        </p>
      </div>

      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger-bg text-danger border border-danger/20 rounded-xl p-4 mb-6 text-sm font-medium flex items-start gap-3"
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-text mb-2"
          >
            Name
          </label>
          <div className="relative">
            <User
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
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
              className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-4 transition-all font-medium ${
                errors.name
                  ? "border-danger focus:ring-danger/10"
                  : "border-border focus:border-primary focus:ring-primary/10"
              }`}
              placeholder="Your full name"
            />
          </div>
          <AnimatePresence>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1.5 text-sm text-danger flex items-center gap-1"
              >
                <X size={14} />
                {errors.name}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email */}
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              autoComplete="email"
              className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-4 transition-all font-medium ${
                errors.email
                  ? "border-danger focus:ring-danger/10"
                  : "border-border focus:border-primary focus:ring-primary/10"
              }`}
              placeholder="you@example.com"
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1.5 text-sm text-danger flex items-center gap-1"
              >
                <X size={14} />
                {errors.email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-text mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              autoComplete="new-password"
              className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-4 transition-all font-medium ${
                errors.password
                  ? "border-danger focus:ring-danger/10"
                  : "border-border focus:border-primary focus:ring-primary/10"
              }`}
              placeholder="Min. 6 characters"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          </div>

          {/* Password strength indicator */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: passwordStrength.width }}
                    className={`h-full rounded-full ${passwordStrength.color}`}
                  />
                </div>
                <span className="text-xs font-semibold text-text-muted">
                  {passwordStrength.strength}
                </span>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1.5 text-sm text-danger flex items-center gap-1"
              >
                <X size={14} />
                {errors.password}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-semibold text-text mb-2"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
              }}
              autoComplete="new-password"
              className={`w-full pl-11 pr-12 py-3 rounded-xl border-2 bg-bg text-text placeholder:text-text-muted focus:outline-none focus:ring-4 transition-all font-medium ${
                errors.confirmPassword
                  ? "border-danger focus:ring-danger/10"
                  : password && confirmPassword && password === confirmPassword
                    ? "border-success focus:ring-success/10"
                    : "border-border focus:border-primary focus:ring-primary/10"
              }`}
              placeholder="Repeat your password"
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
            {password && confirmPassword && password === confirmPassword && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-12 top-1/2 -translate-y-1/2"
              >
                <Check size={18} className="text-success" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1.5 text-sm text-danger flex items-center gap-1"
              >
                <X size={14} />
                {errors.confirmPassword}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Create account
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 pt-6 border-t-2 border-border">
        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary-dark font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
