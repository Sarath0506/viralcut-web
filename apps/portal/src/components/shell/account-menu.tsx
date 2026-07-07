import { useQuery } from "@tanstack/react-query";
import { ChevronDown, LogOut, Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { portalApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

function initials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.trim() || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AccountMenu() {
  const menuId = useId();
  const { auth, getToken, logout } = useAuth();
  const role = usePortalRole();
  const token = getToken();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isAdmin = role === "admin";

  const { data: me } = useQuery({
    queryKey: ["me", role],
    queryFn: () => portalApi.me(token!),
    enabled: Boolean(token),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const profileHref =
    role === "admin" ? "/admin/profile" : role === "staff" ? "/staff/profile" : "/settings/brand";

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");
  const label = isAdmin
    ? (auth?.user.displayName ?? "Admin")
    : (me?.companyName ??
      me?.brandProfile?.companyName ??
      me?.displayName ??
      auth?.user.displayName ??
      "Brand account");

  return (
    <div ref={rootRef} className="relative flex items-center gap-2">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`${menuId}-menu`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex max-w-[200px] items-center gap-2 rounded-xl border border-border bg-surface py-1.5 pr-2 pl-1.5 transition-colors hover:bg-surface-variant sm:max-w-[240px]",
          open && "border-primary/30 bg-surface-variant",
        )}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-bold text-primary"
          aria-hidden
        >
          {me?.avatarUrl ? (
            <img src={me.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(
              me?.displayName ?? auth?.user.displayName ?? null,
              me?.email ?? auth?.user.email ?? null,
            )
          )}
        </span>
        <span className="hidden min-w-0 truncate text-sm font-semibold text-foreground sm:block">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={`${menuId}-menu`}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {label}
            </p>
            <p className="truncate text-xs text-muted">
              {me?.email ?? auth?.user.email ?? ""}
            </p>
          </div>

          <Link
            to={profileHref}
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-surface-variant"
            onClick={() => setOpen(false)}
          >
            <Settings className="size-4 text-muted" />
            {isAdmin ? "My Profile" : "Settings"}
          </Link>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-surface-variant"
            onClick={() => {
              setTheme(isDark ? "light" : "dark");
            }}
          >
            {isDark ? (
              <Sun className="size-4 text-warning" />
            ) : (
              <Moon className="size-4 text-muted" />
            )}
            {isDark ? "Light mode" : "Dark mode"}
          </button>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-sm text-destructive hover:bg-surface-variant"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
