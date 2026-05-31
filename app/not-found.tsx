import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="text-8xl font-bold text-primary mb-4">404</div>

        <h1 className="text-2xl font-bold text-text mb-2">Page Not Found</h1>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/today"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
          >
            <Home size={18} />
            Go Home
          </Link>
          <Link
            href="/goals"
            className="flex items-center gap-2 px-5 py-2.5 border border-border text-text-secondary rounded-lg font-medium hover:bg-border-light transition-all"
          >
            <Search size={18} />
            View Goals
          </Link>
        </div>
      </div>
    </div>
  );
}
