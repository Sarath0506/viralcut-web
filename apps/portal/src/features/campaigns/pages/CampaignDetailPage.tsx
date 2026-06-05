import { Link, useParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { useCampaign } from "@/features/campaigns/hooks/use-campaigns";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: campaign, isPending } = useCampaign(id);

  if (isPending || !campaign) {
    return <DetailPageSkeleton />;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusPill status={campaign.status} />
        <span className="text-sm font-semibold text-money">
          {campaign.ratePer1kDisplay}
        </span>
        {campaign.status === "draft" && (
          <Link
            to={`/campaigns/${campaign.id}/edit`}
            className={cn(buttonVariants({ size: "sm" }), "ml-auto")}
          >
            Continue editing
          </Link>
        )}
      </div>

      {campaign.coverImageUrl && (
        <div className="mb-6 overflow-hidden rounded-xl border border-border">
          <img
            src={resolveMediaUrl(campaign.coverImageUrl)}
            alt=""
            className="max-h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Campaign brief</CardTitle>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {campaign.brief}
          </p>
          {campaign.productUrl && (
            <a
              href={campaign.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
            >
              Product page
            </a>
          )}
        </Card>

        <Card>
          <CardTitle>Budget pool</CardTitle>
          <p className="mt-2 text-2xl font-bold">
            {formatInr(campaign.budgetUsedPaise)}{" "}
            <span className="text-base font-normal text-muted">
              / {formatInr(campaign.budgetPaise)}
            </span>
          </p>
          <ProgressBar
            className="mt-4"
            percent={campaign.poolPercent}
            variant={campaign.poolPercent > 80 ? "warning" : "default"}
          />
          <p className="mt-2 text-sm text-muted">
            {campaign.poolRemainingPercent}% remaining
          </p>
          <p className="mt-4 text-sm text-muted">
            {campaign.submissionCount ?? 0} submissions
          </p>
          <Link
            to="/submissions"
            className={cn(buttonVariants(), "mt-4 inline-flex w-full justify-center")}
          >
            Review submissions
          </Link>
        </Card>
      </div>
    </>
  );
}
