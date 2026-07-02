import { parseReferenceAssetsFromApi } from "@/features/campaigns/lib/reference-assets";
import {
  createSourceAsset,
  type SourceAsset,
} from "@/features/campaigns/lib/source-assets";
import type { Campaign } from "@/lib/api";
import type { CampaignDraft } from "@/providers/campaign-wizard";

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function normalizePlatformId(id: string): string {
  return id === "instagram_reels" ? "instagram_reel" : id;
}

function mapSourceAssets(assets: Campaign["sourceAssets"]): SourceAsset[] {
  if (!assets || !Array.isArray(assets)) return [];
  return assets.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const type = (item as { type?: string }).type;
    const url = (item as { url?: string }).url;
    if ((type !== "drive" && type !== "youtube") || !url) return [];
    return [
      createSourceAsset({
        type,
        url,
        label: (item as { label?: string }).label ?? "",
      }),
    ];
  });
}

export function campaignToDraft(campaign: Campaign): CampaignDraft {
  const platforms =
    campaign.platforms.length > 0
      ? campaign.platforms.map(normalizePlatformId)
      : [normalizePlatformId(campaign.platform)];

  return {
    campaignId: campaign.id,
    status: campaign.status as CampaignDraft["status"],
    ownership: campaign.ownership,
    inviteAcceptedAt: campaign.inviteAcceptedAt,
    title: campaign.title,
    category: campaign.category ?? "",
    platforms,
    startDate: toDateInputValue(campaign.startDate),
    briefHook: campaign.briefHook ?? "",
    doRules: campaign.doRules ?? "",
    avoidRules: campaign.avoidRules ?? "",
    sourceAssets: mapSourceAssets(campaign.sourceAssets),
    referenceAssets: parseReferenceAssetsFromApi(campaign.referenceAssets),
    coverImageUrl: campaign.coverImageUrl ?? "",
    brief: campaign.brief,
    productUrl: campaign.productUrl ?? "",
    ratePer1kRupees: String(campaign.ratePer1kPaise / 100),
    maxPayoutRupees: String(campaign.maxPayoutPaise / 100),
    budgetRupees: String(campaign.budgetPaise / 100),
  };
}
