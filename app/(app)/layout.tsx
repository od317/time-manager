import type { Metadata } from "next";
import { Sidebar } from "./_components/sidebar/Sidebar";
import { Header } from "./_components/header/Header";
import { MobileNav } from "./_components/mobile/MobileNav";

export const metadata: Metadata = {
  title: "TimeFlow - Dashboard",
  description: "Master your time, achieve your goals",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden md:flex md:w-[280px] md:flex-col md:fixed md:inset-y-0">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:pl-[280px]">
        {/* Header */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
