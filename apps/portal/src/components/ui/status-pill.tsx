import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  live: "bg-money/15 text-money",
  draft: "bg-surface-variant text-muted",
  paused: "bg-warning/15 text-warning",
  closed: "bg-muted/20 text-muted",
  draft_submitted: "bg-warning/15 text-warning",
  under_review: "bg-warning/15 text-warning",
  approved: "bg-money/15 text-money",
  rejected: "bg-destructive/15 text-destructive",
  awaiting_live_link: "bg-primary/15 text-primary",
  live_tracking: "bg-money-bright/15 text-money-bright",
  paid: "bg-money/15 text-money",
  draft_pending: "bg-surface-variant text-muted",
  draft_rejected: "bg-destructive/15 text-destructive",
  draft_approved: "bg-money/15 text-money",
  live_submitted: "bg-money-bright/15 text-money-bright",
  joined: "bg-surface-variant text-muted",
  drafts_incomplete: "bg-warning/15 text-warning",
  in_review: "bg-warning/15 text-warning",
  action_required: "bg-primary/15 text-primary",
  proof_complete: "bg-money/15 text-money",
};

const labels: Record<string, string> = {
  closed: "ENDED",
};

export function StatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = labels[status] ?? status.replace(/_/g, " ").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide",
        styles[status] ?? "bg-surface-variant text-muted",
        className,
      )}
    >
      {label}
    </span>
  );
}
