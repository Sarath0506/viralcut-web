import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { PortalSearch } from "@/components/shell/portal-search";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <div className="border-b border-border bg-surface px-4 py-2 md:hidden">
          <PortalSearch />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <div className="mx-auto w-full max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
