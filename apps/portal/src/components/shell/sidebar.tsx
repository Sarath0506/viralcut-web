import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { ShellNavLink } from "@/components/shell/shell-nav-link";
import {
  getNavForRole,
  isNavItemActive,
  portalSidebarLabel,
} from "@/components/shell/nav-config";
import { cn } from "@/lib/utils";
import { usePortalRole } from "@/providers/auth-provider";

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const { pathname } = useLocation();
  const role = usePortalRole();
  const navItems = getNavForRole(role ?? "brand");
  const label = portalSidebarLabel(role ?? "brand");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-deep/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100vw-3rem,14rem)] flex-col border-r border-border bg-surface transition-transform duration-200 ease-out lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:w-56 lg:shrink-0 lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:shadow-none",
        )}
        aria-label={`${label} navigation`}
      >
        <div className="flex shrink-0 items-start justify-between px-4 pt-6 pb-3">
          <div>
            <Link
              to={role === "admin" ? "/admin/dashboard" : "/dashboard"}
              onClick={onClose}
              className="font-display text-xl font-extrabold tracking-tight text-primary"
            >
              ViralCut
            </Link>
            <p className="mt-0.5 text-xs font-medium text-muted">{label}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-muted hover:bg-surface-variant hover:text-foreground lg:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="Main">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <ShellNavLink
                key={item.href}
                to={item.href}
                label={item.label}
                icon={item.icon}
                active={isNavItemActive(pathname, item)}
                onNavigate={onClose}
              />
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
