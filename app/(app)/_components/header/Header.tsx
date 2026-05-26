"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { UserMenu } from "./UserMenu";

const pageTitles: Record<string, string> = {
  "/today": "Today",
  "/goals": "Goals",
  "/habits": "Habits",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (pageTitles[pathname]) return pageTitles[pathname];

  // Check parent path (e.g., /goals/123 -> 'Goals')
  const parentPath = "/" + pathname.split("/")[1];
  if (pageTitles[parentPath]) return pageTitles[parentPath];

  return "Dashboard";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 bg-surface/80 backdrop-blur-sm border-b border-border">
      <div>
        <h1 className="text-lg font-semibold text-text">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile user menu */}
        <div className="md:hidden">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
