import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Time Management",
  description: "Sign in to your account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text">⏱️ TimeFlow</h1>
          <p className="text-text-muted mt-2">
            Master your time, achieve your goals
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
