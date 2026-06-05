import { Link } from "react-router-dom";

import { SelectBrandPrompt } from "@/components/shell/select-brand-prompt";
import { Card } from "@/components/ui/card";
import { TableSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { useSubmissions } from "@/features/submissions/hooks/use-submissions";
import { formatInr } from "@/lib/format";
import { usePortalRole } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function SubmissionsPage() {
  const role = usePortalRole();
  const { brandProfileId } = useSelectedBrand();
  const { data: submissions, isPending } = useSubmissions();

  if (role === "agency" && !brandProfileId) {
    return <SelectBrandPrompt title="Select a brand to review submissions" />;
  }

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
        <p className="mb-4 text-sm font-medium text-warning">
          {pending.length} awaiting review
        </p>
      )}

      {(submissions?.length ?? 0) > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-variant text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Creator</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Est. earnings</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {submissions?.map((s) => (
                <tr key={s.id} className="border-t border-border bg-surface">
                  <td className="px-4 py-3 font-medium">{s.creatorName}</td>
                  <td className="px-4 py-3 text-muted">{s.campaignTitle}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={s.status} />
                  </td>
                  <td className="px-4 py-3 font-medium text-money">
                    {formatInr(s.estimatedPaise)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/submissions/${s.id}`}
                      className="font-semibold text-primary hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
