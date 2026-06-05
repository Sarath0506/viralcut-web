import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toaster";
import { useSubmission } from "@/features/submissions/hooks/use-submissions";
import { ApiError, brandApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function SubmissionReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState("");

  const { data: submission, isPending } = useSubmission(id);

  const reviewMutation = useMutation({
    mutationFn: (body: { action: "approve" | "reject"; rejectionReason?: string }) =>
      brandApi.submissions.review(token!, id!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["submissions"] });
      toast("Submission updated");
      navigate("/submissions");
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Review failed", "error");
    },
  });

  if (isPending || !submission) {
    return <DetailPageSkeleton />;
  }

  const s = submission as Record<string, unknown>;
  const canReview =
    s.status === "draft_submitted" || s.status === "under_review";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardTitle>Creative</CardTitle>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <StatusPill status={String(s.status)} />
            <span className="text-muted">
              {(s.campaign as { title?: string })?.title}
            </span>
          </div>
          <p>
            <span className="text-muted">Creator: </span>
            {(s.creator as { displayName?: string })?.displayName ?? "—"}
          </p>
          {Boolean(s.draftDriveUrl) && (
            <a
              href={String(s.draftDriveUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open draft (Drive)
            </a>
          )}
          {Boolean(s.liveReelUrl) && (
            <a
              href={String(s.liveReelUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View live reel
            </a>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Decision</CardTitle>
        <p className="mt-2 text-sm text-muted">
          Approve draft so creator can post and submit live reel link.
        </p>
        {canReview ? (
          <div className="mt-4 space-y-4">
            <Button
              className="w-full"
              onClick={() => reviewMutation.mutate({ action: "approve" })}
              disabled={reviewMutation.isPending}
            >
              Approve creative
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
              Reject
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            This submission is not in a reviewable state.
          </p>
        )}
      </Card>
    </div>
  );
}
