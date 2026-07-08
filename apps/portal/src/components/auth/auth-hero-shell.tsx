import type { ReactNode } from "react";

import {
  AUTH_HERO_CONTENT_CLASS,
  AUTH_HERO_INNER_CLASS,
  AUTH_HERO_PANEL_CLASS,
} from "@/components/auth/auth-hero-panel";
import { HalchalMark } from "@/components/brand/halchal-mark";
import { cn } from "@/lib/utils";

export function AuthHeroBrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-2.5", className)}>
      <HalchalMark className="h-8 w-auto" />
      <span className="font-display text-lg font-semibold tracking-tight text-white xl:text-xl">
        Halchal
      </span>
    </div>
  );
}

export function AuthHeroShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={AUTH_HERO_PANEL_CLASS}>
      <div className={AUTH_HERO_INNER_CLASS}>
        <div className={cn(AUTH_HERO_CONTENT_CLASS, "min-h-0 flex-1")}>
          <AuthHeroBrandMark />
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          {footer ? <div className="shrink-0 pt-8">{footer}</div> : null}
        </div>
      </div>
      <div
        className="pointer-events-none absolute -top-10 -right-8 size-32 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-1/4 -left-12 size-40 rounded-full bg-primary/25 blur-3xl"
        aria-hidden
      />
    </section>
  );
}
