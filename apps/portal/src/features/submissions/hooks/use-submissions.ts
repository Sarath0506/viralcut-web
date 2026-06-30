import { useQuery } from "@tanstack/react-query";

import { portalApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function useSubmissions(status?: string) {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submissions", "deliverables", status ?? "under_review"],
    queryFn: () =>
      portalApi.submissions.list(token!, {
        status: status ?? "under_review",
      }),
    enabled: Boolean(auth && token),
  });
}

export function useAllDeliverables() {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submissions", "deliverables", "all"],
    queryFn: async () => {
      const statuses = [
        "under_review",
        "draft_approved",
        "draft_rejected",
        "live_submitted",
        "draft_pending",
        "proof_under_review",
        "proof_approved",
        "proof_rejected",
      ] as const;
      const batches = await Promise.all(
        statuses.map((status) =>
          portalApi.submissions.list(token!, { status }),
        ),
      );
      return batches.flat();
    },
    enabled: Boolean(auth && token),
  });
}

export function useProofReviewQueue() {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submissions", "deliverables", "proof_queue"],
    queryFn: async () => {
      const [proofUnderReview, liveSubmitted] = await Promise.all([
        portalApi.submissions.list(token!, { status: "proof_under_review" }),
        portalApi.submissions.list(token!, { status: "live_submitted" }),
      ]);
      return [...proofUnderReview, ...liveSubmitted];
    },
    enabled: Boolean(auth && token),
    refetchInterval: 30_000,
  });
}

export function useSubmission(id: string | undefined) {
  const { auth, getToken } = useAuth();
  const token = getToken();

  return useQuery({
    queryKey: ["submission", "deliverable", id],
    queryFn: () => portalApi.submissions.get(token!, id!),
    enabled: Boolean(auth && token && id),
  });
}
