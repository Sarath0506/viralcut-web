import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Eye,
  Plus,
  Radio,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { useBrandStats } from "@/features/dashboard/hooks/use-brand-stats";
import { formatInr, formatViews } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const KPI_ACCENTS = {
  violet: { icon: "bg-primary/15 text-primary", glow: "bg-primary/25" },
  amber: { icon: "bg-amber-500/15 text-amber-400", glow: "bg-amber-500/25" },
  emerald: { icon: "bg-money/15 text-money-bright", glow: "bg-money/25" },
  sky: { icon: "bg-sky-500/15 text-sky-400", glow: "bg-sky-500/25" },
} as const;

export function DashboardPage() {
  const { auth } = useAuth();
  const { data: stats, isPending } = useBrandStats();
  const firstName = auth?.user.displayName?.split(" ")[0];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-16 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[110px]" />
      <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-56 w-56 rounded-full bg-sky-500/5 blur-[100px]" />

      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Monitor live campaigns, review queue, and spend.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          accent="violet"
          icon={Radio}
          label="Live campaigns"
          value={isPending ? "…" : String(stats?.liveCampaigns ?? 0)}
        />
        <KpiCard
          accent="amber"
          icon={Clock}
          label="Pending reviews"
          value={isPending ? "…" : String(stats?.pendingReviews ?? 0)}
          href="/campaigns"
          hint={stats && stats.pendingReviews > 0 ? "Needs attention" : undefined}
        />
        <KpiCard
          accent="emerald"
          icon={Wallet}
          label="Budget used"
          value={isPending ? "…" : formatInr(stats?.budgetUsedPaise ?? 0)}
        />
        <KpiCard
          accent="sky"
          icon={Eye}
          label="Total views"
          value={isPending ? "…" : formatViews(stats?.totalViews ?? 0)}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ActionTile
          to="/campaigns/new"
          icon={Plus}
          title="Create a campaign"
          description="Brief it, set your rate, and go live."
          primary
        />
        <ActionTile
          to="/campaigns"
          icon={Clock}
          title="Review submissions"
          description="Approve drafts and verify live links awaiting payout."
        />
      </div>
    </div>
  );
}

function KpiCard({
  accent,
  icon: Icon,
  label,
  value,
  href,
  hint,
}: {
  accent: keyof typeof KPI_ACCENTS;
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  hint?: string;
}) {
  const style = KPI_ACCENTS[accent];
  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface-variant/60 p-5 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl">
      <div
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 blur-2xl transition group-hover:opacity-90",
          style.glow,
        )}
      />
      <div className="relative">
        <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", style.icon)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1.5 font-display text-2xl font-bold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-[11px] font-medium text-amber-400">{hint}</p>}
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

function ActionTile({
  to,
  icon: Icon,
  title,
  description,
  primary = false,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border p-5 transition hover:-translate-y-0.5",
        primary
          ? "border-primary/30 bg-linear-to-br from-primary/20 via-primary/10 to-transparent hover:border-primary/50"
          : "border-border bg-surface-variant/60 hover:border-primary/30",
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          primary ? "bg-primary text-white" : "bg-primary/15 text-primary",
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  );
}
