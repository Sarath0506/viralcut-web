import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { CreatorProfileModal } from "@/features/creators/components/CreatorProfileModal";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const STATUS_LABEL: Record<string, string> = {
  draft_pending:      "Draft pending",
  under_review:       "Under review",
  proof_under_review: "Proof review",
};

const STATUS_DOT: Record<string, string> = {
  draft_pending:      "bg-zinc-400",
  under_review:       "bg-yellow-400",
  proof_under_review: "bg-orange-400",
};

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

const STATS = (data: NonNullable<ReturnType<typeof useAdminDashboard>["data"]>) => [
  {
    label: "Total Campaigns",
    value: data.campaignCount,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    accent: "text-primary bg-primary/10",
  },
  {
    label: "Active Campaigns",
    value: data.activeCampaignCount,
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    accent: "text-emerald-500 bg-emerald-500/10",
    suffix: "live",
  },
  {
    label: "Total Views",
    value: formatViews(data.totalViews),
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    accent: "text-blue-500 bg-blue-500/10",
  },
  {
    label: "Total Spent",
    value: formatInr(data.totalSpentPaise),
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    accent: "text-orange-500 bg-orange-500/10",
  },
];

function useAdminDashboard() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.dashboard(getToken()!),
    enabled: Boolean(getToken()),
  });
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { data, isPending } = useAdminDashboard();
  const [viewCreatorId, setViewCreatorId] = useState<string | null>(null);

  if (isPending) return <PortalShellSkeleton />;

  const stats = data ? STATS(data) : [];

  return (
    <div className="space-y-6">
      {viewCreatorId && <CreatorProfileModal creatorId={viewCreatorId} onClose={() => setViewCreatorId(null)} />}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Overview of all brands and campaigns.</p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${s.accent}`}>
              {s.icon}
            </div>
            <p className="mt-3 text-2xl font-black tracking-tight">
              {s.value}
              {s.suffix && <span className="ml-1.5 text-sm font-medium text-muted">{s.suffix}</span>}
            </p>
            <p className="mt-0.5 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Two-column body ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left — Pending tasks */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="font-semibold">Pending Tasks</p>
              <p className="text-xs text-muted mt-0.5">Deliverables waiting for review</p>
            </div>
            {data && data.pendingTasks.length > 0 && (
              <span className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-bold text-orange-400">
                {data.pendingTasks.length}
              </span>
            )}
          </div>

          {!data || data.pendingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="h-8 w-8 text-muted/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-muted">All caught up!</p>
              <p className="text-xs text-muted/60 mt-0.5">No pending reviews</p>
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
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-variant"
                  >
                    {/* Status dot */}
                    <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />

                    {/* Main info */}
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
                        <span className="shrink-0 text-[10px] text-muted capitalize">
                          {task.platform.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">{task.campaignTitle}</p>
                    </div>

                    {/* Right meta */}
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide">{statusLabel}</p>
                      <p className="text-[10px] text-muted mt-0.5">{timeAgo(task.draftSubmittedAt)}</p>
                    </div>

                    <svg className="h-3.5 w-3.5 shrink-0 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — Top clippers */}
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <p className="font-semibold">Top Clippers</p>
            <p className="text-xs text-muted mt-0.5">Ranked by total earnings</p>
          </div>

          {!data || data.topClippers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="h-8 w-8 text-muted/40 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p className="text-sm font-medium text-muted">No clippers yet</p>
              <p className="text-xs text-muted/60 mt-0.5">Earnings will appear once campaigns have approved work</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.topClippers.map((clipper, i) => (
                <div key={clipper.creatorId} className="flex items-center gap-3 px-5 py-3.5">
                  {/* Rank */}
                  <span className={`w-5 shrink-0 text-center text-xs font-black ${
                    i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-orange-400" : "text-muted"
                  }`}>
                    {i + 1}
                  </span>

                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                    {initials(clipper.creatorName)}
                  </div>

                  {/* Name + views */}
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

                  {/* Earned */}
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
