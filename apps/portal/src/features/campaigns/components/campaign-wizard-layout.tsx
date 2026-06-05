import type { ReactNode } from "react";
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

export function CampaignWizardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted">{subtitle}</p>
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
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-border/80 bg-surface lg:left-56">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-3 sm:px-6">
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
