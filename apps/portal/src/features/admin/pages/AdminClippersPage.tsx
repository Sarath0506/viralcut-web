import { useQuery } from "@tanstack/react-query";
import { Mail, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { adminApi, type AdminCreatorSummary, type KycStatus } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

type SortKey = "newest" | "name" | "earnings" | "campaigns";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name (A–Z)" },
  { value: "earnings", label: "Most earned" },
  { value: "campaigns", label: "Most campaigns" },
];

const KYC_STYLE: Record<KycStatus, string> = {
  verified: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-warning/15 text-warning",
  not_started: "bg-surface-variant text-muted",
};

const KYC_LABEL: Record<KycStatus, string> = {
  verified: "KYC Verified",
  pending: "KYC Pending",
  not_started: "No KYC",
};

const ACCENTS = [
  { bg: "bg-violet-500/10",  text: "text-violet-400"  },
  { bg: "bg-blue-500/10",    text: "text-blue-400"    },
  { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  { bg: "bg-orange-500/10",  text: "text-orange-400"  },
  { bg: "bg-pink-500/10",    text: "text-pink-400"    },
  { bg: "bg-cyan-500/10",    text: "text-cyan-400"    },
];

function accentFor(name: string) {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "C";
}

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
  const navigate = useNavigate();
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
          {visible.map((c) => {
            const name = c.displayName ?? c.username ?? "Creator";
            const accent = accentFor(name);
            return (
              <div
                key={c.id}
                onClick={() => navigate(`/admin/clippers/${c.id}`)}
                className="group cursor-pointer rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black",
                        accent.bg,
                        accent.text,
                      )}
                    >
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initials(name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold leading-tight">{name}</p>
                        {!c.isActive && (
                          <span className="shrink-0 rounded-full bg-muted/20 px-1.5 py-0.5 text-[9px] font-bold text-muted">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                        <Mail className="h-3 w-3 shrink-0" strokeWidth={2} />
                        {c.email ?? c.phone ?? "—"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                      KYC_STYLE[c.kycStatus],
                    )}
                  >
                    {KYC_LABEL[c.kycStatus]}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-center">
                  <div>
                    <p className={cn("text-base font-bold leading-none", accent.text)}>{c.campaignCount}</p>
                    <p className="mt-1 text-[10px] text-muted">Campaigns</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none text-foreground">{formatInr(c.walletLifetimePaise)}</p>
                    <p className="mt-1 text-[10px] text-muted">Lifetime earned</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
