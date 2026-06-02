"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/lib/services";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      })
      .catch(() => {
        setStatus("error");
        setMessage(
          "Invalid or expired verification link. Please request a new one.",
        );
      });
  }, [searchParams, router]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <Loader size={48} className="text-primary animate-spin mx-auto mb-4" />
      )}
      {status === "success" && (
        <CheckCircle size={48} className="text-success mx-auto mb-4" />
      )}
      {status === "error" && (
        <XCircle size={48} className="text-danger mx-auto mb-4" />
      )}
      <h2 className="text-xl font-bold text-text mb-2">
        {status === "loading"
          ? "Verifying your email..."
          : status === "success"
            ? "Email Verified!"
            : "Verification Failed"}
      </h2>
      <p className="text-text-secondary text-sm mb-4">{message}</p>
      {status === "error" && (
        <Link href="/login" className="text-primary text-sm font-medium">
          Go to login
        </Link>
      )}
    </div>
  );
}
