import { useQuery } from "@tanstack/react-query";

import { portalApi, type DeliverableDetail } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const AUTO_REVIEW_POLL_MS = 20_000;

// The catch-up sweep retries a needs_review result roughly every 5 minutes,
// up to autoReviewMaxRetries times, before giving up — polling every 20s
// while a stage is still within that budget is what makes the "AI is
// actively checking this" state in AutoReviewPanel actually live instead of
// a one-time snapshot. Stops polling once every stage present has either a
// real decision or has exhausted its retries, so an already-settled
// submission doesn't keep polling forever just because the modal is open.
function isAutoReviewActivelyRetrying(data: DeliverableDetail | undefined): boolean {
  if (!data) return false;
  const latestByStage = new Map<string, DeliverableDetail["autoReview"][number]>();
  for (const r of data.autoReview) {
    if (!latestByStage.has(r.stage)) latestByStage.set(r.stage, r);
  }
  for (const [stage, latest] of latestByStage) {
    if (latest.decision !== "needs_review") continue;
    const attempts = data.autoReview.filter((r) => r.stage === stage).length;
    if (attempts < data.autoReviewMaxRetries) return true;
  }
  return false;
}

export function useSubmission(id: string | undefined) {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submission", "deliverable", id],
    queryFn: () => portalApi.submissions.get(token!, id!),
    enabled: Boolean(auth && token && id),
    refetchInterval: (query) =>
      isAutoReviewActivelyRetrying(query.state.data) ? AUTO_REVIEW_POLL_MS : false,
  });
}
