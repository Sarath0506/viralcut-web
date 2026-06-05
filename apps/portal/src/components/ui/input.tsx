import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    suppressHydrationWarning={
      type === "email" || type === "password" || type === "tel"
    }
    className={cn(
      "flex h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
