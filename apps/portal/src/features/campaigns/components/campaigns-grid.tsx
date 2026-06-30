import { useNavigate } from "react-router-dom";

import {
  CampaignRowActions,
  type CampaignMenuAction,
} from "@/features/campaigns/components/campaign-row-actions";
import { formatCpv, formatInr } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media-url";
import type { Campaign } from "@/lib/api";

const STATUS_STYLE: Record<string, { dot: string; badge: string }> = {
  live:   { dot: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  draft:  { dot: "bg-zinc-400",    badge: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25" },
  paused: { dot: "bg-orange-400",  badge: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
  closed: { dot: "bg-red-400",     badge: "bg-red-500/15 text-red-400 border-red-500/25" },
};

type CampaignsGridProps = {
  campaigns: Campaign[];
  onMenuAction: (campaign: Campaign, action: CampaignMenuAction) => void;
  isAdmin?: boolean;
  basePath?: string;
  isRefreshing?: boolean;
};

export function CampaignsGrid({
  campaigns,
  onMenuAction,
  isAdmin = false,
  basePath = "/campaigns",
  isRefreshing = false,
}: CampaignsGridProps) {
  const navigate = useNavigate();

  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${isRefreshing ? "opacity-70" : ""}`}>
      {campaigns.map((campaign) => {
        const style = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft;

        return (
          <div
            key={campaign.id}
            onClick={() => navigate(`${basePath}/${campaign.id}`)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-border/80 hover:shadow-xl"
          >
            {/* Cover image */}
            <div className="relative h-48 w-full overflow-hidden bg-surface-variant">
              {campaign.coverImageUrl ? (
                <img
                  src={resolveMediaUrl(campaign.coverImageUrl)}
                  alt={campaign.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5">
                  <svg className="h-14 w-14 text-primary/15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.847v6.306a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
              )}

              {/* Top overlay: platform chips + status + menu */}
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                {/* Platform chips */}
                <div className="flex flex-wrap gap-1">
                  {campaign.platforms.map((p) => (
                    <span
                      key={p}
                      className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium capitalize text-white backdrop-blur-sm"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                {/* Status badge + 3-dot menu */}
                <div className="flex items-center gap-1.5">
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {campaign.status}
                  </span>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg bg-black/40 backdrop-blur-sm"
                  >
                    <CampaignRowActions
                      campaign={campaign}
                      onMenuAction={onMenuAction}
                      basePath={basePath}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/60 to-transparent" />
            </div>

            {/* Card body */}
            <div className="p-4">
              <h3 className="truncate font-bold leading-tight">{campaign.title}</h3>

              {isAdmin && (
                <p className="mt-0.5 truncate text-xs text-muted">
                  {campaign.brandCompanyName ?? campaign.pendingInviteEmail ?? "Unassigned"}
                </p>
              )}

              <div className="mt-3 border-t border-border/40 pt-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[11px] text-muted">Rate</p>
                    <p className="mt-0.5 text-xs font-bold text-primary">{formatCpv(campaign.ratePer1kPaise)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Budget</p>
                    <p className="mt-0.5 text-xs font-semibold">{formatInr(campaign.budgetPaise)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted">Submissions</p>
                    <p className="mt-0.5 text-xs font-semibold">{campaign.submissionCount ?? 0}</p>
                  </div>
                </div>

                {/* Pool used bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-muted mb-1">
                    <span>Pool used</span>
                    <span className="font-semibold text-foreground">{campaign.poolPercent}%</span>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-surface-variant">
                    <div
                      className={`h-full rounded-full transition-all ${campaign.poolPercent > 80 ? "bg-orange-400" : "bg-primary"}`}
                      style={{ width: `${Math.min(campaign.poolPercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
