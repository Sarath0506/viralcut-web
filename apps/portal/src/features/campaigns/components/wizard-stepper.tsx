import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";

import { useCampaignWizard } from "@/providers/campaign-wizard";
import { cn } from "@/lib/utils";

export function WizardStepper() {
  const { pathname } = useLocation();
  const { paths, draft } = useCampaignWizard();
  const canJump = Boolean(draft.campaignId);

  const steps = [
    { path: paths.basics, label: "Details" },
    { path: paths.brief, label: "Brief & Rules" },
    { path: paths.payout, label: "Timeline" },
    { path: paths.review, label: "Review" },
  ];
  const currentIndex = steps.findIndex((s) => s.path === pathname);

  return (
    <ol
      className="mx-auto mb-7 flex w-full max-w-[760px] items-start justify-between px-2"
      aria-label="Campaign steps"
    >
      {steps.map((step, i) => {
        const completed = i < currentIndex;
        const active = i === currentIndex;
        const reachable = canJump;

        const stepCircle = (
          <span
            className={cn(
              "relative z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
              completed
                ? "border-money bg-money/10 text-money"
                : active
                  ? "border-primary bg-primary text-primary-foreground"
                  : reachable
                    ? "border-border bg-background text-muted hover:border-primary hover:text-primary"
                    : "border-border bg-background text-muted",
            )}
          >
            {completed ? <Check className="h-4 w-4" /> : i + 1}
          </span>
        );

        const stepLabel = (
          <span
            className={cn(
              "mt-2 text-[11px] font-semibold tracking-wide",
              active || completed
                ? "text-foreground"
                : reachable
                  ? "text-muted hover:text-primary"
                  : "text-muted",
            )}
          >
            {step.label}
          </span>
        );

        return (
          <li
            key={step.path}
            className="relative flex flex-1 flex-col items-center text-center"
          >
            {i > 0 && (
              <span
                className={cn(
                  "absolute top-4 right-1/2 h-px w-1/2",
                  completed || active ? "bg-money" : "bg-border",
                )}
              />
            )}
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute top-4 left-1/2 h-px w-1/2",
                  i < currentIndex ? "bg-money" : "bg-border",
                )}
              />
            )}
            {reachable && !active ? (
              <Link
                to={step.path}
                className="relative z-10 flex flex-col items-center"
                aria-current={active ? "step" : undefined}
              >
                {stepCircle}
                {stepLabel}
              </Link>
            ) : (
              <div className="relative z-10 flex flex-col items-center">
                {stepCircle}
                {stepLabel}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
