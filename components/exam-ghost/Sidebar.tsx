"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, History, BarChart3, Bookmark, Settings, Crown, PanelLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSidebarCtx } from "./sidebar-context";

const nav = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "History", icon: History, to: "/history" },
  { label: "Analytics", icon: BarChart3, to: "/analytics" },
  { label: "Bookmarks", icon: Bookmark, to: "/bookmarks" },
  { label: "Settings", icon: Settings, to: "/settings" },
] as const;

function SidebarInner({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full px-3 py-6">
      <Link
        href="/"
        onClick={onNavigate}
        className={`flex items-center gap-3 mb-10 px-2 ${collapsed ? "justify-center" : ""}`}
      >
        <img src="/ghost-logo.png" alt="ExamGhost" width={44} height={44} className="h-11 w-11 shrink-0" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.18 }}
              className="leading-tight overflow-hidden whitespace-nowrap"
            >
              <div className="text-xl font-bold text-primary">ExamGhost</div>
              <div className="text-xs text-muted-foreground">AI Exam Simulator</div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      <nav className="flex flex-col gap-1.5">
        {nav.map((item, i) => {
          const Icon = item.icon;
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.25 }}
            >
              <Link
                href={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-primary text-primary-foreground font-medium shadow-[var(--shadow-glow)]"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key="lbl"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            key="upgrade"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-warning" />
              <span className="font-semibold text-foreground">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Unlock unlimited exams, deep analytics and advanced features.
            </p>
            <Button className="w-full bg-[image:var(--gradient-primary)] hover:opacity-90 text-primary-foreground shadow-[var(--shadow-soft-glow)] cursor-pointer">
              Upgrade Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebarCtx();
  const width = collapsed ? 80 : 256;

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="hidden lg:block shrink-0 bg-sidebar border-r border-sidebar-border sticky top-0 h-screen overflow-hidden"
      >
        <SidebarInner collapsed={collapsed} />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border"
            >
              <SidebarInner collapsed={false} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}