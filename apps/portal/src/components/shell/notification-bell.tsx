import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { notificationsApi, type AppNotification } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function NotificationBell() {
  const menuId = useId();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = getToken();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(token!),
    enabled: Boolean(token),
  });

  const { data: unread } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => notificationsApi.unreadCount(token!),
    enabled: Boolean(token),
  });

  const unreadCount = unread?.count ?? 0;

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  }

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(token!, id),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(token!),
    onSuccess: invalidate,
  });

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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

  function handleSelect(n: AppNotification) {
    if (!n.read) markReadMutation.mutate(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`${menuId}-menu`}
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex size-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:bg-surface-variant",
          open && "bg-surface-variant text-foreground",
        )}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" aria-hidden />
        )}
      </button>

      {open && (
        <div
          id={`${menuId}-menu`}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    role="menuitem"
                    onClick={() => handleSelect(n)}
                    className={cn(
                      "flex w-full items-start gap-2.5 px-3 py-3 text-left transition-colors hover:bg-surface-variant",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    {!n.read && <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />}
                    <div className={cn("min-w-0 flex-1", n.read && "pl-3.5")}>
                      <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                      {n.body && <p className="mt-0.5 truncate text-xs text-muted">{n.body}</p>}
                      <p className="mt-1 text-[10px] text-muted/70">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
