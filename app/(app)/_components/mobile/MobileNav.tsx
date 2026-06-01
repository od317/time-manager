"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  Repeat,
  BarChart3,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Today", href: "/today", icon: LayoutDashboard },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Habits", href: "/habits", icon: Repeat },
  { name: "Stats", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-10 glass border-t border-border safe-area-bottom"
    >
      <div className="flex items-center justify-around h-[60px] px-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors"
            >
              {active && (
                <motion.div
                  layoutId="mobileActiveTab"
                  className="absolute inset-0 bg-primary-bg rounded-xl"
                  transition={{ duration: 0.2 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.8 }} className="relative z-10">
                <Icon
                  size={20}
                  className={active ? "text-primary" : "text-text-muted"}
                />
              </motion.div>
              <span
                className={`relative z-10 text-[10px] font-medium ${
                  active ? "text-primary" : "text-text-muted"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
