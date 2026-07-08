import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ClipperCard } from "@/features/admin/components/clipper-card";
import { adminApi, type AdminCreatorSummary } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

type SortKey = "newest" | "name" | "earnings" | "campaigns";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name (A–Z)" },
  { value: "earnings", label: "Most earned" },
  { value: "campaigns", label: "Most campaigns" },
];

function sortCreators(creators: AdminCreatorSummary[], sort: SortKey): AdminCreatorSummary[] {
  const copy = [...creators];
  const nameOf = (c: AdminCreatorSummary) => c.displayName ?? c.username ?? "";
  if (sort === "name") return copy.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
  if (sort === "earnings") return copy.sort((a, b) => b.walletLifetimePaise - a.walletLifetimePaise);
  if (sort === "campaigns") return copy.sort((a, b) => b.campaignCount - a.campaignCount);
  return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function AdminClippersPage() {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const { data, isPending } = useQuery({
    queryKey: ["admin-creators"],
    queryFn: () => adminApi.creators(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const creators = data ?? [];
  const q = query.trim().toLowerCase();
  const filtered = q
    ? creators.filter((c) =>
        (c.displayName ?? "").toLowerCase().includes(q) ||
        (c.username ?? "").toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q),
      )
    : creators;
  const visible = sortCreators(filtered, sort);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Clippers</h1>
          <p className="mt-1 text-sm text-muted">
            {creators.length} creator{creators.length !== 1 ? "s" : ""} on the platform
          </p>
        </div>
      </div>

      {creators.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex h-10 flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, username, email or phone…"
              className="h-full w-full rounded-xl border border-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="font-medium">No clippers yet</p>
          <p className="mt-1 text-sm text-muted">Creators appear here once they sign up and join a campaign.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="font-medium">No clippers match "{query}"</p>
          <p className="mt-1 text-sm text-muted">Try a different name, username, email or phone.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((c) => (
            <ClipperCard key={c.id} creator={c} />
          ))}
        </div>
      )}
    </div>
  );
}
