import { Link } from "react-router-dom";

import { SelectBrandPrompt } from "@/components/shell/select-brand-prompt";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useBrandStats } from "@/features/dashboard/hooks/use-brand-stats";
import { formatInr, formatViews } from "@/lib/format";
import { usePortalRole } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function DashboardPage() {
  const role = usePortalRole();
  const isAgency = role === "agency";
  const { brandProfileId } = useSelectedBrand();
  const { data: stats, isPending } = useBrandStats();

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Monitor live campaigns, review queue, and spend.
        </p>
      </header>

      {isAgency ? <SelectBrandPrompt /> : null}

      {(!isAgency || brandProfileId) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Live campaigns"
            value={
              isAgency && isPending
                ? "…"
                : String(stats?.liveCampaigns ?? 0)
            }
          />
          <KpiCard
            label="Pending reviews"
            value={
              isAgency && isPending
                ? "…"
                : String(stats?.pendingReviews ?? 0)
            }
            href="/submissions"
          />
          <KpiCard
            label="Budget used"
            value={
              isAgency && isPending
                ? "…"
                : formatInr(stats?.budgetUsedPaise ?? 0)
            }
          />
          <KpiCard
            label="Total views"
            value={
              isAgency && isPending
                ? "…"
                : formatViews(stats?.totalViews ?? 0)
            }
          />
        </div>
      )}

      {(!isAgency || brandProfileId) && (
        <Card className="mt-6">
          <CardTitle>Quick actions</CardTitle>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/submissions"
              className={buttonVariants({ variant: "secondary" })}
            >
              Review submissions
            </Link>
            <Link
              to="/campaigns"
              className={buttonVariants({ variant: "outline" })}
            >
              View campaigns
            </Link>
            {isAgency ? (
              <Link
                to="/brands"
                className={buttonVariants({ variant: "outline" })}
              >
                Manage brands
              </Link>
            ) : null}
          </div>
        </Card>
      )}
    </>
  );
}

function KpiCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <Card className={href ? "transition-shadow hover:shadow-md" : ""}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-foreground">
        {value}
      </p>
    </Card>
  );
  return href ? <Link to={href}>{inner}</Link> : inner;
}
