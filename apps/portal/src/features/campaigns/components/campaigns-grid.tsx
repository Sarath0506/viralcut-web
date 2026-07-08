import { CampaignCard } from "@/features/campaigns/components/campaign-card";
import type { CampaignMenuAction } from "@/features/campaigns/components/campaign-row-actions";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/lib/api";

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
  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", isRefreshing && "opacity-70")}>
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          isAdmin={isAdmin}
          basePath={basePath}
          onMenuAction={onMenuAction}
        />
      ))}
    </div>
  );
}
