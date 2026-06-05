import { cn } from "@/lib/utils";

export function ProgressBar({
  percent,
  className,
  variant = "default",
}: {
  percent: number;
  className?: string;
  variant?: "default" | "warning";
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-variant", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all",
          variant === "warning" || clamped > 80
            ? "bg-warning"
            : "bg-primary",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
