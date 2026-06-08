import { Sidebar } from "./_components/sidebar/Sidebar";
import { Header } from "./_components/header/Header";
import { MobileNav } from "./_components/mobile/MobileNav";
import { SidebarWrapper } from "./_components/sidebar/SidebarWrapper";
import { TimerProvider } from "@/components/providers/TimerProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg w-full max-w-[100vw]">
      <TimerProvider />
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 z-20">
        <Sidebar />
      </aside>
      <SidebarWrapper>
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 w-full min-w-0">
          {children}
        </main>
      </SidebarWrapper>
      <MobileNav />
    </div>
  );
}
