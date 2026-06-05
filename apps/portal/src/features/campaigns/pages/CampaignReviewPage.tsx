import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Rocket } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { WizardStepper } from "@/features/campaigns/components/wizard-stepper";
import { useCampaignDraftSave } from "@/features/campaigns/hooks/use-campaign-draft-save";
import { hasInvalidReferenceAssets } from "@/features/campaigns/lib/campaign-payload";
import {
  estimateViewsFromBudget,
  formatEstimatedViews,
} from "@/features/campaigns/lib/estimate-views";
import { formatPlatformList } from "@/features/campaigns/lib/platform-labels";
import { parseRulePoints } from "@/features/campaigns/lib/rule-points";
import { resolveMediaUrl } from "@/lib/media-url";
import { useCampaignWizard } from "@/providers/campaign-wizard";

export function CampaignReviewPage() {
  const navigate = useNavigate();
  const { draft, paths } = useCampaignWizard();
  const { toast } = useToast();
  const { saveDraftWithFeedback, publishWithFeedback, saving } =
    useCampaignDraftSave();

  const invalidAssets = hasInvalidReferenceAssets(draft.referenceAssets);
  const hookPoints = useMemo(() => parseRulePoints(draft.briefHook), [draft.briefHook]);
  const doPoints = useMemo(() => parseRulePoints(draft.doRules), [draft.doRules]);
  const avoidPoints = useMemo(
    () => parseRulePoints(draft.avoidRules),
    [draft.avoidRules],
  );
  const estimatedViews = estimateViewsFromBudget(
    Number(draft.budgetRupees),
    Number(draft.ratePer1kRupees),
  );

  async function onPublish() {
    await publishWithFeedback(toast);
  }

  return (
    <>
      <WizardStepper />
      <div className="pb-20">
        <CampaignWizardHeader
          title="Review your Campaign"
          subtitle="Check all campaign details before publishing to creators."
        />
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <CardTitle className="text-base">Basics</CardTitle>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => navigate(paths.basics)}
                >
                  Edit
                </button>
              </div>
              <p className="text-xs text-muted">Campaign Name</p>
              <p className="font-semibold">{draft.title}</p>
              {draft.coverImageUrl ? (
                <img
                  src={resolveMediaUrl(draft.coverImageUrl)}
                  alt=""
                  className="mt-3 h-24 w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="mt-2 text-xs text-muted">Category</p>
              <p className="font-semibold">{draft.category || "Not set"}</p>
              <p className="mt-2 text-xs text-muted">Platforms</p>
              <p className="font-semibold">
                {draft.platforms.length > 0
                  ? formatPlatformList(draft.platforms)
                  : "Not selected"}
              </p>
            </Card>
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <CardTitle className="text-base">Budget</CardTitle>
                <button
                  type="button"
                  className="text-xs font-semibold text-primary hover:underline"
                  onClick={() => navigate(paths.payout)}
                >
                  Edit
                </button>
              </div>
              <p className="text-xs text-muted">Rate</p>
              <p className="font-semibold text-money">
                ₹{draft.ratePer1kRupees} / 1K views
              </p>
              <p className="mt-2 text-xs text-muted">Total Pool</p>
              <p className="font-semibold">
                ₹{Number(draft.budgetRupees || 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-2 text-xs text-muted">Estimated views (full spend)</p>
              <p className="font-semibold">{formatEstimatedViews(estimatedViews)}</p>
            </Card>
          </div>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <CardTitle className="text-base">Content Brief</CardTitle>
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline"
                onClick={() => navigate(paths.brief)}
              >
                Edit
              </button>
            </div>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  The hook
                </p>
                {hookPoints.length > 0 ? (
                  <ul className="space-y-1.5 text-foreground">
                    {hookPoints.map((point) => (
                      <li key={point.id} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{point.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">-</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Things to do
                </p>
                {doPoints.length > 0 ? (
                  <ul className="space-y-1.5 text-foreground">
                    {doPoints.map((point) => (
                      <li key={point.id} className="flex gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{point.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">-</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-400">
                  Things to avoid
                </p>
                {avoidPoints.length > 0 ? (
                  <ul className="space-y-1.5 text-foreground">
                    {avoidPoints.map((point) => (
                      <li key={point.id} className="flex gap-2">
                        <span className="text-rose-400">•</span>
                        <span>{point.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">-</p>
                )}
              </div>
            </div>
            {draft.sourceAssets.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-xs font-semibold text-muted">Source assets</p>
                <ul className="space-y-1 text-sm text-muted">
                  {draft.sourceAssets.map((asset) => (
                    <li key={asset.id}>
                      <span className="font-medium capitalize text-foreground">
                        {asset.type}
                      </span>
                      {asset.label ? ` — ${asset.label}` : ""}: {asset.url}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {draft.referenceAssets.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="mb-2 text-xs font-semibold text-muted">
                  Reference assets
                </p>
                <ul className="space-y-1 text-sm text-muted">
                  {draft.referenceAssets.map((asset) => (
                    <li key={asset.id}>
                      <span className="font-medium capitalize text-foreground">
                        {asset.type === "image" ? "Image (Post)" : "Video (Reel)"}
                      </span>
                      {asset.label ? ` — ${asset.label}` : ""}: {asset.url}
                    </li>
                  ))}
                </ul>
                {invalidAssets ? (
                  <p className="mt-2 text-xs font-semibold text-rose-700">
                    Upload is required for image/video assets before publishing.
                  </p>
                ) : null}
              </div>
            )}
          </Card>
        </div>
        <CampaignWizardFooter
          leftAction={{
            id: "back",
            label: "Back",
            onClick: () => navigate(-1),
            buttonProps: { size: "sm", variant: "outline" },
          }}
          rightActions={[
            {
              id: "save-draft",
              label: saving ? "Saving..." : "Save as Draft",
              onClick: () => void saveDraftWithFeedback(toast),
              buttonProps: { size: "sm", variant: "ghost", disabled: saving },
            },
            {
              id: "publish",
              label: saving ? "Publishing..." : "Publish Campaign",
              onClick: () => void onPublish(),
              icon: !saving ? <Rocket className="h-4 w-4" /> : undefined,
              buttonProps: {
                size: "sm",
                variant: "success",
                disabled: saving || invalidAssets,
              },
            },
          ]}
        />
      </div>
    </>
  );
}
