import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AuthFieldIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted sm:left-4",
        className,
      )}
    >
      {children}
    </span>
  );
}
