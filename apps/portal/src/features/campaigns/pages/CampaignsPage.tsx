import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, WandSparkles } from "lucide-react";

import { SelectBrandPrompt } from "@/components/shell/select-brand-prompt";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CampaignListSkeleton } from "@/components/ui/page-skeletons";
import { useToast } from "@/components/ui/toaster";
import { CampaignPagination } from "@/features/campaigns/components/campaign-pagination";
import { CampaignStatusFilterTabs } from "@/features/campaigns/components/campaign-status-filter";
import { CampaignsTable } from "@/features/campaigns/components/campaigns-table";
import type { CampaignMenuAction } from "@/features/campaigns/components/campaign-row-actions";
import {
  PAGE_SIZE,
  useCampaignsList,
  useDeleteCampaign,
  useUpdateCampaignStatus,
} from "@/features/campaigns/hooks/use-campaigns";
import { ApiError, type Campaign, type CampaignStatusFilter } from "@/lib/api";
import { cn } from "@/lib/utils";
import { usePortalRole } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function CampaignsPage() {
  const role = usePortalRole();
  const { brandProfileId } = useSelectedBrand();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pendingAction, setPendingAction] = useState<{
    campaign: Campaign;
    action: CampaignMenuAction;
  } | null>(null);

  const { data, isPending, isError, isFetching } = useCampaignsList(statusFilter, page);
  const updateStatus = useUpdateCampaignStatus();
  const deleteCampaign = useDeleteCampaign();

  const handleFilterChange = (value: CampaignStatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleMenuAction = (campaign: Campaign, action: CampaignMenuAction) => {
    setPendingAction({ campaign, action });
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    try {
      if (pendingAction.action.kind === "delete") {
        await deleteCampaign.mutateAsync(pendingAction.campaign.id);
        toast("Campaign deleted.", "success");
      } else {
        await updateStatus.mutateAsync({
          id: pendingAction.campaign.id,
          status: pendingAction.action.status,
        });
        toast("Campaign updated.", "success");
      }
      setPendingAction(null);
    } catch (error) {
      toast(
        error instanceof ApiError ? error.message : "Could not complete this action.",
        "error",
      );
    }
  };

  const isConfirmLoading = updateStatus.isPending || deleteCampaign.isPending;

  if (role === "agency" && !brandProfileId) {
    return <SelectBrandPrompt title="Select a brand to view campaigns" />;
  }

  if (isPending) {
    return <CampaignListSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-dashed p-8 text-center">
        <p className="text-lg font-semibold">Unable to load campaigns</p>
        <p className="mt-2 text-sm text-muted">
          Please refresh the page and try again.
        </p>
      </Card>
    );
  }

  const campaigns = data?.items ?? [];
  const total = data?.total ?? 0;
  const showEmpty = total === 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage and track your active influencer marketing campaigns.
          </p>
        </div>
        <Link to="/campaigns/new" className={cn(buttonVariants(), "inline-flex shrink-0")}>
          <Plus className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      <Card className="overflow-visible">
        <div className="border-b border-border px-4 py-4">
          <CampaignStatusFilterTabs value={statusFilter} onChange={handleFilterChange} />
        </div>

        {showEmpty ? (
          <div className="px-4 py-12 text-center">
            {statusFilter === "all" ? (
              <>
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <WandSparkles className="h-7 w-7" />
                </div>
                <p className="mt-4 text-xl font-bold">No campaigns yet</p>
                <p className="mt-2 text-sm text-muted">
                  Create your first campaign to start receiving creator submissions.
                </p>
                <Link to="/campaigns/new" className={cn(buttonVariants(), "mt-6 inline-flex")}>
                  Create Your First Campaign
                </Link>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold">No campaigns found</p>
                <p className="mt-2 text-sm text-muted">
                  Try another status filter to see more campaigns.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={cn(isFetching && "opacity-60")}>
              <CampaignsTable campaigns={campaigns} onMenuAction={handleMenuAction} />
            </div>
            <CampaignPagination
              page={page}
              limit={data?.limit ?? PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.action.title ?? "Confirm"}
        description={pendingAction?.action.description ?? ""}
        confirmLabel={pendingAction?.action.confirmLabel}
        variant={pendingAction?.action.variant}
        loading={isConfirmLoading}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => void confirmPendingAction()}
      />
    </>
  );
}
