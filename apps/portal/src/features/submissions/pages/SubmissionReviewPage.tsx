import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toaster";
import { formatPlatformLabel } from "@/features/campaigns/lib/platform-labels";
import { useSubmission } from "@/features/submissions/hooks/use-submissions";
import { isDuplicateRejectionReason } from "@/features/submissions/lib/rejection-reason";
import { submissionsListPath } from "@/features/submissions/lib/submissions-paths";
import { ApiError, portalApi } from "@/lib/api";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

function formatRejectedAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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

  const priorReasons = useMemo(
    () => deliverable?.rejectionHistory.map((e) => e.rejectionReason) ?? [],
    [deliverable?.rejectionHistory],
  );

  const isDuplicateReason =
    rejectReason.trim().length > 0 &&
    isDuplicateRejectionReason(rejectReason, priorReasons);

  if (isPending || !deliverable) {
    return <DetailPageSkeleton />;
  }

  const canReview = deliverable.status === "under_review";
  const history = deliverable.rejectionHistory;

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

        {history.length > 0 && (
          <Card>
            <CardTitle>Rejected before ({history.length})</CardTitle>
            {canReview && (
              <p className="mt-2 rounded-lg border border-border bg-surface-variant/40 px-3 py-2 text-sm text-muted">
                Creator resubmitted. Check if prior issues were fixed before
                reusing the same feedback.
              </p>
            )}
            <ul className="mt-4 space-y-3 text-sm">
              {history.map((event) => (
                <li
                  key={event.id}
                  className="rounded-lg border border-border px-3 py-3"
                >
                  <p className="text-xs text-muted">
                    {formatRejectedAt(event.rejectedAt)}
                    {event.reviewedByDisplayName
                      ? ` · ${event.reviewedByDisplayName}`
                      : ""}
                  </p>
                  <p className="mt-1">{event.rejectionReason}</p>
                  <a
                    href={event.draftDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-primary hover:underline"
                  >
                    View rejected draft
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card>
          <CardTitle>Decision</CardTitle>
          <p className="mt-2 text-sm text-muted">
            Approve this format only. Creator can then post and submit live proof.
          </p>
          {canReview ? (
            <div className="mt-4 space-y-4">
              {history.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {history.map((event) => (
                    <span
                      key={event.id}
                      className="rounded-full bg-surface-variant px-2.5 py-1 text-xs text-muted"
                      title={event.rejectionReason}
                    >
                      {event.rejectionReason.length > 48
                        ? `${event.rejectionReason.slice(0, 48)}…`
                        : event.rejectionReason}
                    </span>
                  ))}
                </div>
              )}
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
              {isDuplicateReason && (
                <p className="text-sm text-destructive">
                  This rejection reason was already used for this format. Update
                  your feedback or approve if the issue is resolved.
                </p>
              )}
              <Button
                variant="destructive"
                className="w-full"
                onClick={() =>
                  reviewMutation.mutate({
                    action: "reject",
                    rejectionReason: rejectReason,
                  })
                }
                disabled={
                  reviewMutation.isPending ||
                  !rejectReason.trim() ||
                  isDuplicateReason
                }
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
