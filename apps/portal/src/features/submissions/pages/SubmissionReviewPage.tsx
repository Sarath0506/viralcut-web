import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toaster";
import { formatPlatformLabel } from "@/features/campaigns/lib/platform-labels";
import { useSubmission } from "@/features/submissions/hooks/use-submissions";
import { submissionsListPath } from "@/features/submissions/lib/submissions-paths";
import { ApiError, portalApi } from "@/lib/api";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

export function SubmissionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const role = usePortalRole();
  const token = getToken();
  const submissionsPath = submissionsListPath(role);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");

  const { data: deliverable, isPending } = useSubmission(id);

  const reviewMutation = useMutation({
    mutationFn: (body: { action: "approve" | "reject"; rejectionReason?: string }) =>
      portalApi.submissions.review(token!, id!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast("Deliverable updated");
      navigate(submissionsPath);
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Review failed", "error");
    },
  });

  if (isPending || !deliverable) {
    return <DetailPageSkeleton />;
  }

  const canReview = deliverable.status === "under_review";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardTitle>
          {formatPlatformLabel(deliverable.platform)} draft
        </CardTitle>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <StatusPill status={deliverable.status} />
            <span className="text-muted">{deliverable.campaign.title}</span>
          </div>
          <p>
            <span className="text-muted">Creator: </span>
            {deliverable.creator.displayName ?? deliverable.creator.username ?? "—"}
          </p>
          {deliverable.draftDriveUrl && (
            <a
              href={deliverable.draftDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open draft (Drive)
            </a>
          )}
          {deliverable.livePostUrl && (
            <a
              href={deliverable.livePostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View live post
            </a>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardTitle>Other formats (same creator)</CardTitle>
          <ul className="mt-4 space-y-2 text-sm">
            {deliverable.siblingDeliverables.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span>{formatPlatformLabel(s.platform)}</span>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>Decision</CardTitle>
          <p className="mt-2 text-sm text-muted">
            Approve this format only. Creator can then post and submit live proof.
          </p>
          {canReview ? (
            <div className="mt-4 space-y-4">
              <Button
                className="w-full"
                onClick={() => reviewMutation.mutate({ action: "approve" })}
                disabled={reviewMutation.isPending}
              >
                Approve {formatPlatformLabel(deliverable.platform)}
              </Button>
              <textarea
                className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                placeholder="Rejection reason (required to reject)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  reviewMutation.mutate({
                    action: "reject",
                    rejectionReason: rejectReason,
                  })
                }
                disabled={reviewMutation.isPending || !rejectReason.trim()}
              >
                Reject {formatPlatformLabel(deliverable.platform)}
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">
              This deliverable is not in a reviewable state.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
