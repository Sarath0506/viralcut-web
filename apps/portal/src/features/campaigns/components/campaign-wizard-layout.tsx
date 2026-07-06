import type { ReactNode } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import type { ButtonProps } from "@/components/ui/button";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionButton = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  buttonProps?: Omit<ButtonProps, "onClick" | "children">;
};

export const WIZARD_SHELL_WIDTH = "max-w-[1100px]";

/** Bounds every wizard step to the same wide shell used by the stepper and footer. */
export function WizardPage({ children }: { children: ReactNode }) {
  return <div className={cn("mx-auto w-full", WIZARD_SHELL_WIDTH)}>{children}</div>;
}

export function CampaignWizardHeader({
  title,
  subtitle,
  saving,
  onBack,
}: {
  title: string;
  subtitle: string;
  /** When provided, shows a subtle autosave status pill next to the title. */
  saving?: boolean;
  /** When provided, renders a square icon back-button before the title. */
  onBack?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>
      </div>
      {saving !== undefined && (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
            saving ? "bg-surface-variant text-muted" : "bg-primary/10 text-primary",
          )}
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          )}
        </span>
      )}
    </div>
  );
}

export function CampaignWizardFooter({
  leftAction,
  rightActions,
}: {
  leftAction: ActionButton;
  rightActions: ActionButton[];
}) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-border/70 bg-surface lg:left-56">
      <div className={cn("mx-auto w-full px-4 py-3 sm:px-6", WIZARD_SHELL_WIDTH)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            {...leftAction.buttonProps}
            onClick={leftAction.onClick}
            className={cn("w-full sm:w-auto", leftAction.buttonProps?.className)}
          >
            {leftAction.icon}
            {leftAction.label}
          </Button>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {rightActions.map((action) => (
              <Button
                key={action.id}
                {...action.buttonProps}
                onClick={action.onClick}
                className={cn("w-full sm:w-auto", action.buttonProps?.className)}
              >
                {action.label}
                {action.icon}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
