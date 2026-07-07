import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";

import { useCampaignWizard } from "@/providers/campaign-wizard";
import { WIZARD_SHELL_WIDTH } from "@/features/campaigns/components/campaign-wizard-layout";
import { cn } from "@/lib/utils";

export function WizardStepper() {
  const { pathname } = useLocation();
  const { paths, draft } = useCampaignWizard();
  const canJump = Boolean(draft.campaignId);

  const steps = [
    { path: paths.basics, label: "Details" },
    { path: paths.brief, label: "Brief & Rules" },
    { path: paths.payout, label: "Budget" },
    { path: paths.review, label: "Review" },
  ];
  const currentIndex = Math.max(steps.findIndex((s) => s.path === pathname), 0);

  return (
    <div className={cn("mx-auto mb-8 w-full", WIZARD_SHELL_WIDTH)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex h-1 w-full">
          {steps.map((step, i) => (
            <span
              key={step.path}
              className={cn("h-full flex-1", i <= currentIndex ? "bg-primary" : "bg-transparent")}
            />
          ))}
        </div>
        <ol className="flex items-center gap-2 overflow-x-auto px-4 py-4 sm:gap-3 sm:px-6">
          {steps.map((step, i) => {
            const completed = i < currentIndex;
            const active = i === currentIndex;
            const reachable = canJump && !active;

            const circle = (
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_14px_rgba(99,14,212,0.45)]"
                    : completed
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-background text-muted",
                )}
              >
                {completed ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
            );

            const label = (
              <span
                className={cn(
                  "hidden whitespace-nowrap text-sm font-medium sm:inline",
                  active ? "text-foreground" : completed ? "text-foreground" : "text-muted",
                )}
              >
                {step.label}
              </span>
            );

            return (
              <li key={step.path} className="flex shrink-0 items-center gap-2 sm:gap-3">
                {i > 0 && <span className="h-px w-6 shrink-0 bg-border sm:w-10" />}
                {reachable ? (
                  <Link to={step.path} className="flex items-center gap-2 sm:gap-3">
                    {circle}
                    {label}
                  </Link>
                ) : (
                  <>
                    {circle}
                    {label}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
