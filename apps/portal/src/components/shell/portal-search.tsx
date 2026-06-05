import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export function PortalSearch({
  className,
  placeholder = "Search campaigns…",
}: {
  className?: string;
  placeholder?: string;
}) {
  return (
    <label
      className={cn(
        "relative flex h-10 w-full items-center",
        className,
      )}
    >
      <Search
        className="pointer-events-none absolute left-3 size-4 text-muted"
        aria-hidden
      />
      <input
        type="search"
        placeholder={placeholder}
        className="h-full w-full rounded-xl border border-border bg-surface-variant/80 py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      />
    </label>
  );
}
