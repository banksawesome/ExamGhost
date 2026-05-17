"use client";

import { ReactNode, useEffect, useState } from "react";
import { PanelLeft } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NameModal } from "./NameModal";
import { LoadingScreen } from "./LoadingScreen";
import { useSidebarCtx } from "./sidebar-context";

export function PageShell({
  children,
  rightPanel,
}: {
  children: ReactNode;
  rightPanel?: ReactNode;
}) {
  const { toggle } = useSidebarCtx();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem("examghost:visited");
    if (hasVisited) {
      setLoading(false);
    } else {
      localStorage.setItem("examghost:visited", "1");
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <>
      <NameModal />
      <div className="min-h-screen w-full bg-background flex">
        <Sidebar />

        <main className={`flex-1 min-w-0 px-4 md:px-8 py-6 flex flex-col ${rightPanel ? 'lg:flex-row' : ''} gap-8`}>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={toggle}
                aria-label="Toggle sidebar"
                className="h-10 w-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <PanelLeft className="h-5 w-5" />
              </button>
              <div className="lg:hidden">
                <Header compact />
              </div>
            </div>

            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </main>

        {rightPanel && (
          <aside className="hidden xl:flex flex-col w-[340px] shrink-0 gap-6 px-5 pt-4">
            <Header />
            {rightPanel}
          </aside>
        )}
      </div>
    </>
  );
}