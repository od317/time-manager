import { Clock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - TimeFlow",
  description: "Sign in to your TimeFlow account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/20 mb-4">
            <Clock size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text">
            <span className="gradient-text">TimeFlow</span>
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Master your time, achieve your goals
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface rounded-2xl shadow-xl border border-border p-8 backdrop-blur-sm">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-text-muted mt-6">
          © {new Date().getFullYear()} TimeFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
