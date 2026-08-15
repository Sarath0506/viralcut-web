import { useQuery } from "@tanstack/react-query";
import { LifeBuoy } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/features/campaigns/lib/campaign-board-data";
import { adminApi, type SupportTicketStatus } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

type FilterKey = "all" | SupportTicketStatus;

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "under_investigation", label: "Under investigation" },
  { value: "resolved", label: "Resolved" },
];

export function AdminSupportTicketsPage() {
  const { getToken } = useAuth();
  const [filter, setFilter] = useState<FilterKey>("under_investigation");

  const { data, isPending } = useQuery({
    queryKey: ["admin-support-tickets", filter],
    queryFn: () => adminApi.supportTickets(getToken()!, filter === "all" ? undefined : filter),
    enabled: Boolean(getToken()),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const tickets = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Support Tickets</h1>
        <p className="mt-1 text-sm text-muted">
          {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-surface-variant text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <LifeBuoy className="h-8 w-8 text-muted/30" />
          <p className="mt-3 font-medium">No tickets here</p>
          <p className="mt-1 text-sm text-muted">Tickets clippers raise from the app will show up here.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="divide-y divide-border/60">
            {tickets.map((t) => {
              const name = t.creator.displayName ?? t.creator.username ?? "Creator";
              return (
                <Link
                  key={t.id}
                  to={`/admin/support-tickets/${t.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-variant/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {t.creator.avatarUrl ? (
                      <img src={t.creator.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      name.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{t.subject}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {name} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <StatusPill status={t.status} className="shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
