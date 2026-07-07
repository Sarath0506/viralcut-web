import { toApiReferenceAssets, type ReferenceAsset } from "@/features/campaigns/lib/reference-assets";
import { toApiSourceAssets } from "@/features/campaigns/lib/source-assets";
import type { CampaignDraft } from "@/providers/campaign-wizard";

export type CampaignWizardDraft = CampaignDraft & {
  campaignId: string | null;
};

export function composeCampaignBrief(draft: CampaignDraft): string {
  return [
    draft.briefHook && `HOOK:\n${draft.briefHook}`,
    draft.doRules && `\n\nDO:\n${draft.doRules}`,
    draft.avoidRules && `\n\nAVOID:\n${draft.avoidRules}`,
  ]
    .filter(Boolean)
    .join("");
}

export function hasInvalidReferenceAssets(assets: ReferenceAsset[]): boolean {
  return assets.some(
    (asset) =>
      (asset.type === "image" || asset.type === "video") &&
      asset.url.trim().length === 0,
  );
}

export function buildCampaignBody(
  draft: CampaignDraft,
  status: "draft" | "live" | "paused" | "closed",
  brandProfileId?: string | null,
): Record<string, unknown> {
  const referenceAssets = toApiReferenceAssets(draft.referenceAssets);
  const sourceAssets = toApiSourceAssets(draft.sourceAssets);
  const brief = composeCampaignBrief(draft);
  const platforms = draft.platforms.length > 0 ? draft.platforms.slice(0, 1) : ["instagram_reel"];

  return {
    ...(brandProfileId ? { brandProfileId } : {}),
    title: draft.title.trim(),
    status,
    category: draft.category || undefined,
    platforms,
    locationType: draft.locationType,
    targetStates: draft.locationType === "states" ? draft.targetStates : [],
    startDate: draft.startDate || undefined,
    briefHook: draft.briefHook || undefined,
    doRules: draft.doRules || undefined,
    avoidRules: draft.avoidRules || undefined,
    sourceAssets: sourceAssets.length > 0 ? sourceAssets : undefined,
    referenceAssets: referenceAssets.length > 0 ? referenceAssets : undefined,
    coverImageUrl: draft.coverImageUrl || undefined,
    brief: brief || undefined,
    productUrl: draft.productUrl || undefined,
    ratePer1kPaise: Math.round(Number(draft.ratePer1kRupees || 50) * 100),
    maxPayoutPaise: Math.round(Number(draft.maxPayoutRupees || 50000) * 100),
    budgetPaise: Math.round(Number(draft.budgetRupees || 100000) * 100),
  };
}
