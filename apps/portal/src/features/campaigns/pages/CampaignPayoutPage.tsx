import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import {
  CampaignWizardFooter,
  CampaignWizardHeader,
} from "@/features/campaigns/components/campaign-wizard-layout";
import { WizardStepper } from "@/features/campaigns/components/wizard-stepper";
import {
  estimateViewsFromBudget,
  formatEstimatedViews,
} from "@/features/campaigns/lib/estimate-views";
import { useCampaignDraftSave } from "@/features/campaigns/hooks/use-campaign-draft-save";
import { useCampaignWizard } from "@/providers/campaign-wizard";

export function CampaignPayoutPage() {
  const navigate = useNavigate();
  const { draft, paths, update } = useCampaignWizard();
  const { toast } = useToast();
  const { saveDraftWithFeedback, saving } = useCampaignDraftSave();
  const rate = Number(draft.ratePer1kRupees);
  const maxPayout = Number(draft.maxPayoutRupees);
  const budget = Number(draft.budgetRupees);
  const estimatedViews = estimateViewsFromBudget(budget, rate);
  const canContinue =
    Number.isFinite(rate) &&
    Number.isFinite(maxPayout) &&
    Number.isFinite(budget) &&
    rate > 0 &&
    maxPayout >= 1000 &&
    budget >= maxPayout;

  return (
    <>
      <WizardStepper />
      <div className="pb-20">
        <CampaignWizardHeader
          title="Timeline & Budget"
          subtitle="Set your CPV model, campaign budget pool, and projected reach."
        />
        <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <CardTitle>Payout & Budget Configuration</CardTitle>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-border bg-surface-variant/40 p-3 text-sm">
                <p className="font-semibold">Standard Payout Model</p>
                <p className="text-muted">Performance based total valid views.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    className="text-sm font-bold normal-case tracking-normal text-foreground"
                    htmlFor="rate"
                  >
                    ₹ / 1,000 views
                  </Label>
                  <Input
                    id="rate"
                    type="number"
                    min={1}
                    value={draft.ratePer1kRupees}
                    onChange={(e) => update({ ratePer1kRupees: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className="text-sm font-bold normal-case tracking-normal text-foreground"
                    htmlFor="max"
                  >
                    Max payout per creator
                  </Label>
                  <Input
                    id="max"
                    type="number"
                    min={1000}
                    value={draft.maxPayoutRupees}
                    onChange={(e) => update({ maxPayoutRupees: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  className="text-sm font-bold normal-case tracking-normal text-foreground"
                  htmlFor="budget"
                >
                  Total campaign budget pool (₹)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  min={1000}
                  value={draft.budgetRupees}
                  onChange={(e) => update({ budgetRupees: e.target.value })}
                />
              </div>
              <p className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
                A platform facilitation fee of 15% is added to checkout total.
              </p>
            </div>
          </Card>
          <div className="space-y-4">
            <Card className="bg-deep text-white">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/80">
                <Sparkles className="h-4 w-4" />
                Auto-pause protection
              </div>
              <p className="mt-3 text-sm text-white/90">
                Campaign pauses automatically once pool reaches 100% capacity to
                prevent over-delivery.
              </p>
              <p className="mt-4 text-xl font-bold">
                ₹{Number(draft.budgetRupees || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-white/70">Current budget pool</p>
            </Card>
            <Card>
              <CardTitle className="text-base">Estimated views</CardTitle>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatEstimatedViews(estimatedViews)}
              </p>
              <p className="mt-1 text-xs text-muted">
                Estimated views at full budget spend
              </p>
              {estimatedViews > 0 ? (
                <p className="mt-3 text-xs text-muted">
                  Based on ₹{rate.toLocaleString("en-IN")} / 1K views and ₹
                  {budget.toLocaleString("en-IN")} total pool.
                </p>
              ) : (
                <p className="mt-3 text-xs text-muted">
                  Enter a valid rate and budget to see the estimate.
                </p>
              )}
            </Card>
          </div>
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
              id: "next",
              label: "Next",
              onClick: () => navigate(paths.review),
              icon: <ArrowRight className="h-4 w-4" />,
              buttonProps: { size: "sm", disabled: !canContinue },
            },
          ]}
        />
      </div>
    </>
  );
}
