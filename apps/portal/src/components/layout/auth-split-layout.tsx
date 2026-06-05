import { Clapperboard } from "lucide-react";
import type { ReactNode } from "react";

import { BrandAuthHero, type BrandAuthHeroVariant } from "@/components/auth/brand-auth-hero";
import { cn } from "@/lib/utils";

export interface AuthSplitLayoutProps {
  heroVariant: BrandAuthHeroVariant;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const FORM_MAX_WIDTH = "max-w-[520px]";

const formColumnPadding = "px-4 sm:px-8 lg:px-10 xl:px-14";

export function AuthSplitLayout({
  heroVariant,
  children,
  footer,
  className,
}: AuthSplitLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-dvh max-h-dvh min-h-0 w-full overflow-hidden bg-background",
        className,
      )}
    >
      <BrandAuthHero variant={heroVariant} />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div
            className={cn(
              "flex min-h-full flex-col justify-center",
              formColumnPadding,
              "py-6 sm:py-8 lg:py-10",
            )}
          >
            <div className={cn("mx-auto w-full", FORM_MAX_WIDTH)}>{children}</div>
          </div>
        </div>

        {footer ? (
          <div
            className={cn(
              "shrink-0 border-t border-border bg-background py-3",
              formColumnPadding,
            )}
          >
            <div className={cn("mx-auto w-full", FORM_MAX_WIDTH)}>{footer}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AuthMobileBrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("mb-5 flex items-center gap-2 lg:hidden", className)}>
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
        <Clapperboard className="size-5 text-white" aria-hidden />
      </div>
      <span className="font-display text-lg font-semibold text-primary">
        ViralCut
      </span>
    </div>
  );
}

export function AuthPageHeader({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-5 min-h-[4.75rem] sm:mb-6 sm:min-h-[5.25rem]",
        className,
      )}
    >
      <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1.5 max-w-md text-sm leading-snug text-muted sm:mt-2">
        {description}
      </p>
    </header>
  );
}

export function AuthTrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-bold tracking-wide text-muted uppercase sm:gap-x-6 sm:text-xs",
        className,
      )}
    >
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-money" aria-hidden />
        ISO 27001
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        GDPR Compliant
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-muted" aria-hidden />
        PCI DSS
      </span>
    </div>
  );
}
