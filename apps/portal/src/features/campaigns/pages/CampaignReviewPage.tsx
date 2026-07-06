import { Link, useNavigate } from "react-router-dom";
import { useMemo, type ReactNode } from "react";
import {
  AlertTriangle,
  Bookmark,
  Check,
  Eye,
  MapPin,
  Rocket,
  UserPlus,
} from "lucide-react";

import { useToast } from "@/components/ui/toaster";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
  WizardPage,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { WizardStepper } from "@/features/campaigns/components/wizard-stepper";
import { useCampaignDraftSave } from "@/features/campaigns/hooks/use-campaign-draft-save";
import { useWizardBack } from "@/features/campaigns/hooks/use-wizard-back";
import { hasInvalidReferenceAssets } from "@/features/campaigns/lib/campaign-payload";
import {
  estimateViewsFromBudget,
  formatEstimatedViews,
} from "@/features/campaigns/lib/estimate-views";
import { getPlatformOption } from "@/features/campaigns/lib/platform-options";
import { parseRulePoints } from "@/features/campaigns/lib/rule-points";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/media-url";
import { usePortalRole } from "@/providers/auth-provider";
import { useCampaignWizard } from "@/providers/campaign-wizard";

function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold text-primary hover:underline"
    >
      Edit
    </button>
  );
}

function ReviewCard({
  title,
  onEdit,
  className,
  children,
}: {
  title: string;
  onEdit: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <EditLink onClick={onEdit} />
      </div>
      {children}
    </div>
  );
}

export function CampaignReviewPage() {
  const navigate = useNavigate();
  const { goBack, backLabel } = useWizardBack();
  const role = usePortalRole();
  const isAdmin = role === "admin";
  const { draft, paths, saving: autoSaving } = useCampaignWizard();
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

  const rate = Number(draft.ratePer1kRupees);
  const maxPayout = Number(draft.maxPayoutRupees);
  const budget = Number(draft.budgetRupees);
  const budgetValid =
    Number.isFinite(rate) &&
    rate > 0 &&
    Number.isFinite(maxPayout) &&
    maxPayout >= 1000 &&
    Number.isFinite(budget) &&
    budget >= maxPayout;

  const checklist = [
    { label: "Campaign name", ok: draft.title.trim().length > 0, path: paths.basics },
    { label: "Target platform selected", ok: draft.platforms.length > 0, path: paths.basics },
    {
      label: "Target location set",
      ok: draft.locationType === "pan_india" || draft.targetStates.length > 0,
      path: paths.basics,
    },
    { label: "Creative brief written", ok: draft.briefHook.trim().length > 0, path: paths.brief },
    { label: "Sample content uploaded", ok: !invalidAssets, path: paths.brief },
    { label: "Budget & payout configured", ok: budgetValid, path: paths.payout },
  ];
  const readyToPublish = checklist.every((item) => item.ok);
  const platformOption = getPlatformOption(draft.platforms[0] ?? "");

  async function onPublish() {
    await publishWithFeedback(toast);
  }

  return (
    <>
      <WizardStepper />
      <WizardPage>
        <div className="pb-24">
          <CampaignWizardHeader
            title="Review your Campaign"
            subtitle="Check all campaign details before publishing to creators."
            saving={autoSaving}
            onBack={goBack}
          />

          <div className="space-y-6">
            {/* ── Publish readiness ── */}
            <div
              className={cn(
                "rounded-2xl border p-5",
                readyToPublish
                  ? "border-money/30 bg-money/[0.04]"
                  : "border-warning/30 bg-warning/[0.04]",
              )}
            >
              <div className="flex items-center gap-2">
                {readyToPublish ? (
                  <Check className="h-4 w-4 text-money" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning" />
                )}
                <p className="text-sm font-semibold text-foreground">
                  {readyToPublish ? "Ready to publish" : "Before you publish"}
                </p>
              </div>
              <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {checklist.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => navigate(item.path)}
                    disabled={item.ok}
                    className="flex items-center gap-2 rounded-lg py-1 text-left text-sm disabled:cursor-default"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        item.ok ? "bg-money/15 text-money" : "bg-warning/15 text-warning",
                      )}
                    >
                      {item.ok ? (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                    </span>
                    <span className={item.ok ? "text-muted" : "font-medium text-foreground"}>
                      {item.label}
                    </span>
                    {!item.ok && <span className="text-xs text-primary">Fix →</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Basics + Budget ── */}
            <div className="grid gap-6 sm:grid-cols-2">
              <ReviewCard title="Basics" onEdit={() => navigate(paths.basics)}>
                {draft.coverImageUrl && (
                  <img
                    src={resolveMediaUrl(draft.coverImageUrl)}
                    alt=""
                    className="mb-3 aspect-video w-full rounded-lg object-cover"
                  />
                )}
                <p className="font-semibold text-foreground">{draft.title || "Untitled campaign"}</p>
                <p className="text-xs text-muted">{draft.category || "No category"}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {platformOption && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-variant px-2.5 py-1 text-xs font-medium text-foreground">
                      <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-white", platformOption.badge)}>
                        <platformOption.icon className="h-2.5 w-2.5" />
                      </span>
                      {platformOption.label}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-variant px-2.5 py-1 text-xs font-medium text-foreground">
                    <MapPin className="h-3 w-3" />
                    {draft.locationType === "pan_india"
                      ? "Pan India"
                      : draft.targetStates.length > 0
                        ? `${draft.targetStates.length} state${draft.targetStates.length !== 1 ? "s" : ""}`
                        : "Not set"}
                  </span>
                </div>
              </ReviewCard>

              <ReviewCard title="Budget" onEdit={() => navigate(paths.payout)}>
                <p className="font-semibold text-money">₹{draft.ratePer1kRupees || 0} / 1K views</p>
                <p className="mt-1 text-xs text-muted">
                  ₹{Number(draft.budgetRupees || 0).toLocaleString("en-IN")} total pool
                </p>

                <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    <Eye className="h-3.5 w-3.5" />
                    Estimated Views
                  </div>
                  <p className="mt-1 font-display text-2xl font-black text-foreground">
                    {formatEstimatedViews(estimatedViews)}
                  </p>
                </div>
              </ReviewCard>
            </div>

            {/* ── Content brief ── */}
            <ReviewCard title="Content Brief" onEdit={() => navigate(paths.brief)}>
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                    Creative brief
                  </p>
                  {draft.briefHook.trim() ? (
                    <p className="whitespace-pre-wrap text-foreground">{draft.briefHook.trim()}</p>
                  ) : (
                    <p className="text-muted">Not set</p>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-money">
                    Do this
                  </p>
                  {doPoints.length > 0 ? (
                    <ul className="space-y-1 text-foreground">
                      {doPoints.map((point) => (
                        <li key={point.id} className="flex gap-2">
                          <span className="text-money">•</span>
                          {point.text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Not set</p>
                  )}
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
                    Avoid this
                  </p>
                  {avoidPoints.length > 0 ? (
                    <ul className="space-y-1 text-foreground">
                      {avoidPoints.map((point) => (
                        <li key={point.id} className="flex gap-2">
                          <span className="text-destructive">•</span>
                          {point.text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Not set</p>
                  )}
                </div>
              </div>

              {draft.sourceAssets.length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-1.5 text-xs font-semibold text-muted">Source assets</p>
                  <ul className="space-y-1 text-sm text-muted">
                    {draft.sourceAssets.map((asset) => (
                      <li key={asset.id}>
                        <span className="font-medium capitalize text-foreground">{asset.type}</span>
                        {asset.label ? ` — ${asset.label}` : ""}: {asset.url}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {draft.referenceAssets.length > 0 && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="mb-1.5 text-xs font-semibold text-muted">Sample content</p>
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
                  {invalidAssets && (
                    <p className="mt-2 text-xs font-medium text-destructive">
                      Upload is required for image/video assets before publishing.
                    </p>
                  )}
                </div>
              )}
            </ReviewCard>

            {isAdmin && draft.campaignId && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Brand collaboration</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {draft.inviteAcceptedAt
                        ? "A brand has accepted the invite."
                        : "Optionally invite a brand to collaborate before publishing."}
                    </p>
                  </div>
                  <Link
                    to={`/admin/campaigns/${draft.campaignId}/invite`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    <UserPlus className="h-4 w-4" />
                    {draft.inviteAcceptedAt ? "Manage invite" : "Invite brand"}
                  </Link>
                </div>
              </div>
            )}
          </div>

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
                icon: !saving ? <Bookmark className="h-4 w-4" /> : undefined,
                buttonProps: { size: "sm", variant: "outline", disabled: saving },
              },
              {
                id: "publish",
                label: saving ? "Publishing..." : "Publish Campaign",
                onClick: () => void onPublish(),
                icon: !saving ? <Rocket className="h-4 w-4" /> : undefined,
                buttonProps: {
                  size: "sm",
                  variant: "success",
                  disabled: saving || !readyToPublish,
                },
              },
            ]}
          />
        </div>
      </WizardPage>
    </>
  );
}
