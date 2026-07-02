import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { StatusPill } from "@/components/ui/status-pill";
import { formatInr, formatViews } from "@/lib/format";
import { portalApi } from "@/lib/api";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

const RANK_STYLE: Record<number, string> = {
  1: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  2: "bg-zinc-400/15 text-zinc-300 border-zinc-400/25",
  3: "bg-orange-500/15 text-orange-400 border-orange-500/25",
};

export function AnalyticsPage() {
  const { getToken } = useAuth();
  const role = usePortalRole();
  const navigate = useNavigate();
  const campaignBase = role === "admin" ? "/admin/campaigns" : "/campaigns";

  const { data, isPending } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => portalApi.submissions.analyticsOverview(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending || !data) {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
        </header>
        <div className="h-64 animate-pulse rounded-2xl bg-surface" />
      </div>
    );
  }

  const { totals, campaigns, topCreators } = data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Performance and earnings across all your campaigns.
        </p>
      </header>

      {/* Overall totals */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Overview</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Campaigns",      value: String(totals.totalCampaigns) },
            { label: "Clippers",       value: String(totals.totalClippers) },
            { label: "Total Views",    value: formatViews(totals.totalViews) },
            { label: "Total Earnings", value: formatInr(totals.totalEarningsPaise) },
            { label: "Total Likes",    value: formatViews(totals.totalLikes) },
            { label: "Total Comments", value: formatViews(totals.totalComments) },
            { label: "Total Shares",   value: formatViews(totals.totalShares) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-5 text-center">
              <p className="text-2xl font-black">{value}</p>
              <p className="mt-1 text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign comparison */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Campaigns</p>
        {campaigns.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-14">
            <p className="text-sm text-muted">No campaign performance data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <div className="min-w-[560px]">
              <div className="grid grid-cols-[1fr_100px_90px_100px_110px] gap-2 border-b border-border bg-surface-variant/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                <span>Campaign</span>
                <span className="text-right">Status</span>
                <span className="text-right">Clippers</span>
                <span className="text-right">Views</span>
                <span className="text-right">Earnings</span>
              </div>
              {campaigns.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate(`${campaignBase}/${c.id}`)}
                  className="grid cursor-pointer grid-cols-[1fr_100px_90px_100px_110px] items-center gap-2 border-b border-border/40 px-4 py-3 last:border-0 hover:bg-surface-variant/30"
                >
                  <p className="truncate text-sm font-semibold">{c.title}</p>
                  <span className="flex justify-end"><StatusPill status={c.status} /></span>
                  <span className="text-right text-sm font-medium">{c.clipperCount}</span>
                  <span className="text-right text-sm font-medium">{formatViews(c.totalViews)}</span>
                  <span className="text-right text-sm font-semibold text-primary">{formatInr(c.totalEarningsPaise)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top performers leaderboard */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Top Performers</p>
        {topCreators.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-14">
            <p className="text-sm text-muted">No performance data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-[40px_1fr_80px_80px_90px_80px_100px] gap-2 border-b border-border bg-surface-variant/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                <span>#</span>
                <span>Creator</span>
                <span className="text-right">Views</span>
                <span className="text-right">Likes</span>
                <span className="text-right">Comments</span>
                <span className="text-right">Shares</span>
                <span className="text-right">Earnings</span>
              </div>
              {topCreators.map((c, i) => {
                const rank = i + 1;
                return (
                  <div
                    key={c.creatorId}
                    className="grid grid-cols-[40px_1fr_80px_80px_90px_80px_100px] items-center gap-2 border-b border-border/40 px-4 py-3 last:border-0"
                  >
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${RANK_STYLE[rank] ?? "bg-surface-variant text-muted border-border"}`}>
                      {rank}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                        {c.creatorName.charAt(0).toUpperCase()}
                      </div>
                      <p className="truncate text-sm font-semibold">{c.creatorName}</p>
                    </div>
                    <span className="text-right text-sm font-medium">{formatViews(c.totalViews)}</span>
                    <span className="text-right text-sm font-medium">{formatViews(c.totalLikes)}</span>
                    <span className="text-right text-sm font-medium">{formatViews(c.totalComments)}</span>
                    <span className="text-right text-sm font-medium">{formatViews(c.totalShares)}</span>
                    <span className="text-right text-sm font-semibold text-primary">{formatInr(c.totalEarningsPaise)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
