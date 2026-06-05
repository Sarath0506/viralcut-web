import { cn } from "@/lib/utils";
import type { Portal } from "@/lib/portal";

export function PortalToggle({
  value,
  onChange,
  className,
}: {
  value: Portal;
  onChange: (portal: Portal) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex rounded-lg border border-border bg-surface-variant p-1",
        className,
      )}
      role="tablist"
      aria-label="Account type"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "brand"}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
          value === "brand"
            ? "bg-surface text-foreground shadow-sm"
            : "text-muted hover:text-foreground",
        )}
        onClick={() => onChange("brand")}
      >
        Brand
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "agency"}
        className={cn(
          "flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
          value === "agency"
            ? "bg-surface text-foreground shadow-sm"
            : "text-muted hover:text-foreground",
        )}
        onClick={() => onChange("agency")}
      >
        Agency
      </button>
    </div>
  );
}
