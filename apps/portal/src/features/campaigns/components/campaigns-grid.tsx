import { useNavigate } from "react-router-dom";
import { ImageIcon } from "lucide-react";

import {
  CampaignRowActions,
  type CampaignMenuAction,
} from "@/features/campaigns/components/campaign-row-actions";
import { formatCpv, formatInr } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/api";

const STATUS_STYLE: Record<string, { dot: string; badge: string }> = {
  live:   { dot: "bg-emerald-400", badge: "bg-emerald-500/15 text-emerald-400" },
  draft:  { dot: "bg-zinc-400",    badge: "bg-zinc-500/15 text-zinc-400" },
  paused: { dot: "bg-orange-400",  badge: "bg-orange-500/15 text-orange-400" },
  closed: { dot: "bg-red-400",     badge: "bg-red-500/15 text-red-400" },
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
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", isRefreshing && "opacity-70")}>
      {campaigns.map((campaign) => {
        const style = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.draft;

        return (
          <div
            key={campaign.id}
            onClick={() => navigate(`${basePath}/${campaign.id}`)}
            className="group cursor-pointer rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md"
          >
            {/* Header: thumbnail + identity + status/menu */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-variant">
                  {campaign.coverImageUrl ? (
                    <img
                      src={resolveMediaUrl(campaign.coverImageUrl)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-muted" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-tight">{campaign.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {isAdmin
                      ? campaign.brandCompanyName ?? campaign.pendingInviteEmail ?? "Unassigned"
                      : campaign.platforms.join(", ")}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", style.badge)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                  {campaign.status}
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <CampaignRowActions campaign={campaign} onMenuAction={onMenuAction} basePath={basePath} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
              <div>
                <p className="text-sm font-bold leading-none text-primary">{formatCpv(campaign.ratePer1kPaise)}</p>
                <p className="mt-1 text-[10px] text-muted">Rate</p>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none text-foreground">{formatInr(campaign.budgetPaise)}</p>
                <p className="mt-1 text-[10px] text-muted">Budget</p>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none text-foreground">{campaign.submissionCount ?? 0}</p>
                <p className="mt-1 text-[10px] text-muted">Submissions</p>
              </div>
            </div>

            {/* Pool used */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[10px] text-muted">
                <span>Pool used</span>
                <span className="font-semibold text-foreground">{campaign.poolPercent}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-surface-variant">
                <div
                  className={cn("h-full rounded-full transition-all", campaign.poolPercent > 80 ? "bg-orange-400" : "bg-primary")}
                  style={{ width: `${Math.min(campaign.poolPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
