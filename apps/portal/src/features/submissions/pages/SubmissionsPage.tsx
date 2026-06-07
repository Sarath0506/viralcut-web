import { Link } from "react-router-dom";

import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { useSubmissions } from "@/features/submissions/hooks/use-submissions";
import { formatInr } from "@/lib/format";

export function SubmissionsPage() {
  const { data: submissions, isPending } = useSubmissions();

  const pending = submissions?.filter((s) =>
    ["draft_submitted", "under_review"].includes(s.status),
  );

  if (isPending) {
    return <TableSkeleton />;
  }

  return (
    <>
      {submissions?.length === 0 && (
        <Card className="text-center">
          <p className="font-semibold">No submissions yet</p>
          <p className="mt-2 text-sm text-muted">
            When creators submit work, they appear here for review.
          </p>
        </Card>
      )}

      {pending && pending.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Needs review ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((s) => (
              <Link
                key={s.id}
                to={`/submissions/${s.id}`}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition hover:border-primary/30"
              >
                <div>
                  <p className="font-semibold">{s.campaignTitle}</p>
                  <p className="text-sm text-muted">{s.creatorName}</p>
                </div>
                <StatusPill status={s.status} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {submissions && submissions.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            All submissions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Creator</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Est. payout</th>
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
                        to={`/submissions/${s.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {s.campaignTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{s.creatorName}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={s.status} />
                    </td>
                    <td className="px-4 py-3">
                      {formatInr(s.estimatedPaise)}
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
