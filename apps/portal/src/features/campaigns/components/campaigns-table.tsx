import { useNavigate } from "react-router-dom";
import { ImageIcon } from "lucide-react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import {
  CampaignRowActions,
  type CampaignMenuAction,
} from "@/features/campaigns/components/campaign-row-actions";
import { formatCpv, formatInr } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media-url";
import type { Campaign } from "@/lib/api";

type CampaignsTableProps = {
  campaigns: Campaign[];
  onMenuAction: (campaign: Campaign, action: CampaignMenuAction) => void;
  isAdmin?: boolean;
  basePath?: string;
  isRefreshing?: boolean;
};

export function CampaignsTable({
  campaigns,
  onMenuAction,
  isAdmin = false,
  basePath = "/campaigns",
  isRefreshing = false,
}: CampaignsTableProps) {
  const navigate = useNavigate();

  const openCampaign = (id: string) => {
    navigate(`${basePath}/${id}`);
  };

  return (
    <div
      className={`overflow-x-auto overflow-y-visible ${isRefreshing ? "opacity-70" : ""}`}
    >
      <table className="w-full min-w-[880px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Campaign</th>
            {isAdmin ? <th className="px-4 py-3">Brand</th> : null}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">CPV Rate</th>
            <th className="px-4 py-3">Budget Cap</th>
            <th className="px-4 py-3">Pool Used</th>
            <th className="px-4 py-3">Submissions</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr
              key={campaign.id}
              className="cursor-pointer border-b border-border/70 transition hover:bg-surface-variant/30"
              onClick={() => openCampaign(campaign.id)}
            >
              <td className="px-4 py-3">
                <div className="flex min-w-[200px] items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-variant">
                    {campaign.coverImageUrl ? (
                      <img
                        src={resolveMediaUrl(campaign.coverImageUrl)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-foreground">
                    {campaign.title}
                  </span>
                </div>
              </td>
              {isAdmin ? (
                <td className="px-4 py-3 text-muted-foreground">
                  {campaign.brandCompanyName ??
                    campaign.pendingInviteEmail ??
                    "Unassigned"}
                </td>
              ) : null}
              <td className="px-4 py-3">
                <StatusPill status={campaign.status} />
              </td>
              <td className="px-4 py-3 font-medium text-foreground">
                {formatCpv(campaign.ratePer1kPaise)}
              </td>
              <td className="px-4 py-3 font-medium text-foreground">
                {formatInr(campaign.budgetPaise)}
              </td>
              <td className="px-4 py-3">
                <div className="min-w-[120px]">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {campaign.poolPercent}%
                    </span>
                  </div>
                  <ProgressBar
                    percent={campaign.poolPercent}
                    variant={campaign.poolPercent > 80 ? "warning" : "default"}
                  />
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-foreground">
                {campaign.submissionCount ?? 0}
              </td>
              <td
                className="px-4 py-3"
                onClick={(event) => event.stopPropagation()}
              >
                <CampaignRowActions
                  campaign={campaign}
                  onMenuAction={onMenuAction}
                  basePath={basePath}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
