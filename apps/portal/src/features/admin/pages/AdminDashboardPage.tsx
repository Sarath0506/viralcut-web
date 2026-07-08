import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  FolderKanban,
  Radio,
  Trophy,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { CreatorProfileModal } from "@/features/creators/components/CreatorProfileModal";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const STATUS_LABEL: Record<string, string> = {
  draft_pending: "Draft pending",
  under_review: "Under review",
  proof_under_review: "Proof review",
};

const STATUS_DOT: Record<string, string> = {
  draft_pending: "bg-zinc-400",
  under_review: "bg-yellow-400",
  proof_under_review: "bg-orange-400",
};

const STAT_ACCENTS = {
  violet: { icon: "bg-primary/15 text-primary", glow: "bg-primary/25" },
  emerald: { icon: "bg-emerald-500/15 text-emerald-400", glow: "bg-emerald-500/25" },
  sky: { icon: "bg-sky-500/15 text-sky-400", glow: "bg-sky-500/25" },
  amber: { icon: "bg-amber-500/15 text-amber-400", glow: "bg-amber-500/25" },
} as const;

function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatInr(paise: number) {
  const rupees = paise / 100;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000) return `₹${(rupees / 1_000).toFixed(1)}K`;
  return `₹${rupees.toFixed(0)}`;
}

function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function useAdminDashboard() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.dashboard(getToken()!),
    enabled: Boolean(getToken()),
  });
}

function StatCard({
  accent,
  icon: Icon,
  label,
  value,
  suffix,
}: {
  accent: keyof typeof STAT_ACCENTS;
  icon: LucideIcon;
  label: string;
  value: string | number;
  suffix?: string;
}) {
  const style = STAT_ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-variant/60 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl">
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 blur-2xl transition group-hover:opacity-90",
          style.glow,
        )}
      />
      <div className="relative">
        <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", style.icon)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <p className="font-display text-2xl font-black tracking-tight text-foreground">
          {value}
          {suffix && <span className="ml-1.5 text-sm font-medium text-muted">{suffix}</span>}
        </p>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isPending } = useAdminDashboard();
  const [viewCreatorId, setViewCreatorId] = useState<string | null>(null);

  if (isPending) return <PortalShellSkeleton />;

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute -top-16 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
      <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-56 w-56 rounded-full bg-sky-500/5 blur-[100px]" />

      {viewCreatorId && <CreatorProfileModal creatorId={viewCreatorId} onClose={() => setViewCreatorId(null)} />}

      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of all brands and campaigns.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard accent="violet" icon={FolderKanban} label="Total Campaigns" value={data?.campaignCount ?? 0} />
        <StatCard
          accent="emerald"
          icon={Radio}
          label="Active Campaigns"
          value={data?.activeCampaignCount ?? 0}
          suffix="live"
        />
        <StatCard accent="sky" icon={Eye} label="Total Views" value={formatViews(data?.totalViews ?? 0)} />
        <StatCard accent="amber" icon={Wallet} label="Total Spent" value={formatInr(data?.totalSpentPaise ?? 0)} />
      </div>

      {/* Two-column body */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left — Pending tasks */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-variant/60 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="font-semibold">Pending Tasks</p>
              <p className="mt-0.5 text-xs text-muted">Deliverables waiting for review</p>
            </div>
            {data && data.pendingTasks.length > 0 && (
              <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-bold text-orange-400">
                {data.pendingTasks.length}
              </span>
            )}
          </div>

          {!data || data.pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-medium text-muted">All caught up!</p>
              <p className="mt-0.5 text-xs text-muted/60">No pending reviews</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.pendingTasks.map((task) => {
                const dotColor = STATUS_DOT[task.status] ?? "bg-zinc-400";
                const statusLabel = STATUS_LABEL[task.status] ?? task.status;
                return (
                  <button
                    key={task.id}
                    onClick={() => {
                      const tab = task.status === "proof_under_review" ? "proof" : "submissions";
                      navigate(`/campaigns/${task.campaignId}?tab=${tab}`);
                    }}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewCreatorId(task.creatorId);
                          }}
                          className="truncate text-sm font-semibold hover:text-primary hover:underline"
                        >
                          {task.creatorName}
                        </span>
                        <span className="shrink-0 text-[10px] capitalize text-muted">
                          {task.platform.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">{task.campaignTitle}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">{statusLabel}</p>
                      <p className="mt-0.5 text-[10px] text-muted">{timeAgo(task.draftSubmittedAt)}</p>
                    </div>

                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted/40" strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Top clippers */}
        <div className="overflow-hidden rounded-2xl border border-border bg-surface-variant/60 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <Trophy className="h-4 w-4 text-amber-400" strokeWidth={2} />
            <div>
              <p className="font-semibold">Top Clippers</p>
              <p className="mt-0.5 text-xs text-muted">Ranked by total earnings</p>
            </div>
          </div>

          {!data || data.topClippers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <p className="text-sm font-medium text-muted">No clippers yet</p>
              <p className="mt-0.5 text-xs text-muted/60">Earnings will appear once campaigns have approved work</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.topClippers.map((clipper, i) => (
                <div key={clipper.creatorId} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className={cn(
                      "w-5 shrink-0 text-center text-xs font-black",
                      i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-orange-400" : "text-muted",
                    )}
                  >
                    {i + 1}
                  </span>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                    {initials(clipper.creatorName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setViewCreatorId(clipper.creatorId)}
                      className="truncate text-sm font-semibold hover:text-primary hover:underline"
                    >
                      {clipper.creatorName}
                    </button>
                    <p className="text-xs text-muted">{formatViews(clipper.totalViews)} views</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-emerald-400">{formatInr(clipper.earnedPaise)}</p>
                    <p className="text-[10px] text-muted">earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
