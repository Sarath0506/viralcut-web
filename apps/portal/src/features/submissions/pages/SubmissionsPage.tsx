import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { formatPlatformLabel } from "@/features/campaigns/lib/platform-labels";
import { useAllDeliverables, useProofReviewQueue, useSubmissions } from "@/features/submissions/hooks/use-submissions";
import { submissionDetailPath } from "@/features/submissions/lib/submissions-paths";
import { usePortalRole } from "@/providers/auth-provider";

export function SubmissionsPage() {
  const role = usePortalRole();
  const { data: pending, isPending: pendingLoading } = useSubmissions("under_review");
  const { data: proofQueue, isPending: proofLoading } = useProofReviewQueue();
  const { data: allDeliverables, isPending: allLoading } = useAllDeliverables();

  const isPending = pendingLoading || allLoading || proofLoading;

  if (isPending) {
    return <TableSkeleton />;
  }

  const submissions = allDeliverables ?? [];

  return (
    <>
      {submissions.length === 0 && (
        <Card className="text-center">
          <p className="font-semibold">No submissions yet</p>
          <p className="mt-2 text-sm text-muted">
            When creators submit work, deliverables appear here for per-format review.
          </p>
        </Card>
      )}

      {proofQueue && proofQueue.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Proof of work — needs approval ({proofQueue.length})
          </h2>
          <div className="space-y-2">
            {proofQueue.map((s) => (
              <Link
                key={s.id}
                to={submissionDetailPath(role, s.id)}
                className="flex items-center justify-between rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 transition hover:border-primary/70"
              >
                <div>
                  <p className="font-semibold">{s.campaignTitle}</p>
                  <p className="text-sm text-muted">
                    {s.creatorName} · {formatPlatformLabel(s.platform)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Review proof
                  </span>
                  <StatusPill status={s.status} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {pending && pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Draft needs review ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((s) => (
              <Link
                key={s.id}
                to={submissionDetailPath(role, s.id)}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-primary/30"
              >
                <div>
                  <p className="font-semibold">{s.campaignTitle}</p>
                  <p className="text-sm text-muted">
                    {s.creatorName} · {formatPlatformLabel(s.platform)}
                    {s.priorRejectionCount > 0 && (
                      <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                        Resubmission
                      </span>
                    )}
                  </p>
                </div>
                <StatusPill status={s.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {submissions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            All deliverables
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3">Platform</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/70 hover:bg-surface-variant/30"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={submissionDetailPath(role, s.id)}
                        className="font-medium hover:text-primary"
                      >
                        {s.campaignTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{s.creatorName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-surface-variant px-2 py-0.5 text-[11px] font-semibold">
                        {formatPlatformLabel(s.platform)}
                      </span>
                      {s.priorRejectionCount > 0 && (
                        <span className="ml-2 rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-warning">
                          Resubmission
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={s.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
