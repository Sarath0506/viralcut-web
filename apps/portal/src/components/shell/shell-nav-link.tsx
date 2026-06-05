import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

export function ShellNavLink({
  to,
  label,
  icon: Icon,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full items-center gap-2.5 rounded-none py-2.5 pr-3 pl-4 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-muted hover:bg-surface-variant hover:text-foreground",
      )}
    >
      {active ? (
        <span
          className="absolute top-0 bottom-0 left-0 w-1 bg-primary"
          aria-hidden
        />
      ) : null}
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          active ? "text-primary" : "text-muted",
        )}
        aria-hidden
      />
      <span>{label}</span>
    </Link>
  );
}
