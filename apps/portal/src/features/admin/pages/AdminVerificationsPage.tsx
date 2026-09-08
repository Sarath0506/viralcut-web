import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/features/campaigns/lib/campaign-board-data";
import { adminApi, type AdminVerificationSummary } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

type OverallStatus = "pending" | "approved" | "rejected";
type FilterKey = "all" | OverallStatus;

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const OVERALL_STYLE: Record<OverallStatus, string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-emerald-500/15 text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "C";
}

function VerificationRow({ entry, onOpen }: { entry: AdminVerificationSummary; onOpen: () => void }) {
  const name = entry.displayName ?? entry.username ?? "Creator";
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-variant/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-bold text-primary">
        {entry.avatarUrl ? (
          <img src={entry.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <p className="mt-0.5 text-xs text-muted">Instagram verification</p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${OVERALL_STYLE[entry.overallStatus]}`}>
            {entry.overallStatus}
          </span>
          <p className="mt-1 text-[11px] text-muted">Updated {formatDate(entry.updatedAt)}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted" />
      </div>
    </button>
  );
}

export function AdminVerificationsPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data, isPending } = useQuery({
    queryKey: ["admin-verifications"],
    queryFn: () => adminApi.verifications(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const entries = data ?? [];
  const visible = filter === "all" ? entries : entries.filter((e) => e.overallStatus === filter);
  const counts = {
    pending: entries.filter((e) => e.overallStatus === "pending").length,
    approved: entries.filter((e) => e.overallStatus === "approved").length,
    rejected: entries.filter((e) => e.overallStatus === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Verification</h1>
        <p className="mt-1 text-sm text-muted">
          Signup verification (Instagram reviewed manually) across all clippers.
        </p>
      </div>

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
              {f.value !== "all" && ` (${counts[f.value]})`}
            </button>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <ShieldCheck className="h-8 w-8 text-muted/30" />
          <p className="mt-3 font-medium">No verifications yet</p>
          <p className="mt-1 text-sm text-muted">Entries appear once a new clipper connects Instagram.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
          <p className="font-medium">No {filter} verifications</p>
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border bg-surface">
          {visible.map((entry) => (
            <VerificationRow key={entry.id} entry={entry} onOpen={() => navigate(`/admin/clippers/${entry.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
