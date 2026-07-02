import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Rocket, UserPlus } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { WizardStepper } from "@/features/campaigns/components/wizard-stepper";
import { useCampaignDraftSave } from "@/features/campaigns/hooks/use-campaign-draft-save";
import { useWizardBack } from "@/features/campaigns/hooks/use-wizard-back";
import { hasInvalidReferenceAssets } from "@/features/campaigns/lib/campaign-payload";
import {
  estimateViewsFromBudget,
  formatEstimatedViews,
} from "@/features/campaigns/lib/estimate-views";
import { formatPlatformList } from "@/features/campaigns/lib/platform-labels";
import { parseRulePoints } from "@/features/campaigns/lib/rule-points";
import { resolveMediaUrl } from "@/lib/media-url";
import { usePortalRole } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";

export function CampaignReviewPage() {
  const navigate = useNavigate();
  const { goBack, backLabel } = useWizardBack();
  const role = usePortalRole();
  const isAdmin = role === "admin";
  const { draft, paths } = useCampaignWizard();
  const { toast } = useToast();
  const { saveDraftWithFeedback, publishWithFeedback, saving } =
    useCampaignDraftSave();

  const invalidAssets = hasInvalidReferenceAssets(draft.referenceAssets);
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
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  Creative brief
                </p>
                {draft.briefHook.trim() ? (
                  <p className="whitespace-pre-wrap text-foreground">
                    {draft.briefHook.trim()}
                  </p>
                ) : (
                  <p className="text-muted">-</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-money">
                  Things to do
                </p>
                {doPoints.length > 0 ? (
                  <ul className="space-y-1.5 text-foreground">
                    {doPoints.map((point) => (
                      <li key={point.id} className="flex gap-2">
                        <span className="text-money">•</span>
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
        {isAdmin && draft.campaignId ? (
          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Brand collaboration</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {draft.inviteAcceptedAt
                    ? "A brand has accepted the invite."
                    : "Optionally invite a brand to collaborate before publishing."}
                </p>
              </div>
              <Link
                to={`/admin/campaigns/${draft.campaignId}/invite`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <UserPlus className="h-4 w-4" />
                {draft.inviteAcceptedAt ? "Manage invite" : "Invite brand"}
              </Link>
            </div>
          </Card>
        ) : null}
        <CampaignWizardFooter
          leftAction={{
            id: "back",
            label: backLabel,
            onClick: goBack,
            buttonProps: { size: "sm", variant: "outline" },
          }}
          rightActions={[
            {
              id: "save-draft",
              label: saving
                ? "Saving..."
                : draft.status === "draft"
                  ? "Save as Draft"
                  : "Save changes",
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
