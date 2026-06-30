import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useCampaign } from "@/features/campaigns/hooks/use-campaigns";
import { getWizardEditPath } from "@/features/campaigns/lib/wizard-paths";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { portalApi, type DeliverableListItem } from "@/lib/api";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

type Tab = "overview" | "working" | "reviews" | "proof" | "approved" | "analytics";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",  label: "Overview" },
  { id: "working",   label: "Working Clippers" },
  { id: "reviews",   label: "Work Reviews" },
  { id: "proof",     label: "Proof of Work" },
  { id: "approved",  label: "Approved Clippers" },
  { id: "analytics", label: "Analytics" },
];

const STATUS_COLOR: Record<string, string> = {
  draft_pending:      "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  under_review:       "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  draft_rejected:     "bg-red-500/15 text-red-400 border-red-500/25",
  draft_approved:     "bg-blue-500/15 text-blue-400 border-blue-500/25",
  live_submitted:     "bg-orange-500/15 text-orange-400 border-orange-500/25",
  proof_under_review: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  proof_approved:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  proof_rejected:     "bg-red-500/15 text-red-400 border-red-500/25",
};

const CAMPAIGN_STATUS_STYLE: Record<string, string> = {
  live:   "bg-emerald-500 text-white",
  draft:  "bg-zinc-600 text-white",
  paused: "bg-orange-500 text-white",
  closed: "bg-red-600 text-white",
};


function DeliverableCard({ d, detailPath }: { d: DeliverableListItem; detailPath: string }) {
  const navigate = useNavigate();
  const statusStyle = STATUS_COLOR[d.status] ?? "bg-zinc-500/15 text-zinc-400 border-zinc-500/25";

  return (
    <div
      onClick={() => navigate(detailPath)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      {/* Card header */}
      <div className="flex items-center gap-3 border-b border-border/50 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-black text-primary">
          {d.creatorName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold group-hover:text-primary">{d.creatorName}</p>
          <p className="text-[11px] text-muted capitalize">{d.platform.replace(/_/g, " ")}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle}`}>
          {d.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Submitted</span>
          <span className="font-medium">
            {d.draftSubmittedAt
              ? new Date(d.draftSubmittedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
              : "—"}
          </span>
        </div>

        {d.priorRejectionCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Rejections</span>
            <span className="font-semibold text-red-400">{d.priorRejectionCount}</span>
          </div>
        )}

        {d.siblingDeliverables.length > 1 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Formats</span>
            <span className="font-medium">{d.siblingDeliverables.length}</span>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border/50 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-muted">View details</span>
        <svg className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-14">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

function DeliverableList({ items, basePath }: { items: DeliverableListItem[]; basePath: string }) {
  if (items.length === 0) return <EmptyState message="No clippers in this category yet." />;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((d) => (
        <DeliverableCard key={d.id} d={d} detailPath={`${basePath}/${d.id}`} />
      ))}
    </div>
  );
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const role = usePortalRole();
  const isAdmin = role === "admin";
  const submissionsBase = isAdmin ? "/admin/submissions" : "/submissions";
  const { getToken } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  const { data: campaign, isPending } = useCampaign(id);
  const { data: deliverables = [] } = useQuery({
    queryKey: ["campaign-deliverables", id],
    queryFn: () => portalApi.submissions.listByCampaign(getToken()!, id!),
    enabled: Boolean(getToken() && id),
  });

  if (isPending || !campaign) return <DetailPageSkeleton />;

  const editPath = campaign.status === "draft" && id ? getWizardEditPath(id, isAdmin) : null;

  const working  = deliverables; // all clippers who have started work
  const reviews  = deliverables.filter(d => ["draft_pending","under_review"].includes(d.status));
  const proof    = deliverables.filter(d => ["live_submitted","proof_under_review"].includes(d.status));
  const approved = deliverables.filter(d => ["draft_approved","proof_approved"].includes(d.status));
  const totalClippers = new Set(deliverables.map(d => d.participationId)).size;

  const counts: Partial<Record<Tab, number>> = {
    working:  deliverables.length,
    reviews:  reviews.length,
    proof:    proof.length,
    approved: approved.length,
  };

  const campaignStatusStyle = CAMPAIGN_STATUS_STYLE[campaign.status] ?? CAMPAIGN_STATUS_STYLE.draft;

  return (
    <div className="space-y-5">
      {/* ── Side-by-side hero ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex gap-0">
          {/* Cover image — fixed width thumbnail */}
          <div className="relative h-48 w-56 shrink-0 overflow-hidden bg-surface-variant">
            {campaign.coverImageUrl ? (
              <img
                src={resolveMediaUrl(campaign.coverImageUrl)}
                alt={campaign.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                <svg className="h-12 w-12 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.847v6.306a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className="flex flex-1 flex-col justify-between p-5 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${campaignStatusStyle}`}>
                    {campaign.status}
                  </span>
                  {campaign.platforms?.map(p => (
                    <span key={p} className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] text-muted">
                      {p}
                    </span>
                  ))}
                </div>
                <h1 className="mt-2 text-xl font-black leading-tight truncate">{campaign.title}</h1>
                <p className="mt-0.5 text-sm font-semibold text-primary">{campaign.ratePer1kDisplay}</p>
              </div>
              {editPath && (
                <Link to={editPath} className={cn(buttonVariants({ size: "sm" }), "shrink-0")}>
                  Continue editing
                </Link>
              )}
            </div>

            {/* Quick stats row */}
            <div className="mt-4 flex items-center gap-3">
              {[
                { label: "Clippers",  value: totalClippers },
                { label: "In Review", value: reviews.length },
                { label: "Approved",  value: approved.length },
                { label: "Pool",      value: `${campaign.poolPercent}%` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-border bg-surface-variant px-4 py-2 text-center">
                  <p className="text-base font-black">{value}</p>
                  <p className="text-[10px] text-muted">{label}</p>
                </div>
              ))}
              <div className="ml-auto text-right">
                <p className="text-xs text-muted">Budget</p>
                <p className="text-sm font-bold">{formatInr(campaign.budgetUsedPaise)} <span className="text-muted font-normal">/ {formatInr(campaign.budgetPaise)}</span></p>
                <ProgressBar className="mt-1 w-32" percent={campaign.poolPercent} variant={campaign.poolPercent > 80 ? "warning" : "default"} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
            {counts[t.id] !== undefined && counts[t.id]! > 0 && (
              <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {counts[t.id]}
              </span>
            )}
            {tab === t.id && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Campaign Brief</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{campaign.brief}</p>
          {campaign.productUrl && (
            <a href={campaign.productUrl} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Product page →
            </a>
          )}
        </div>
      )}

      {/* ── Working Clippers ── */}
      {tab === "working" && <DeliverableList items={working} basePath={submissionsBase} />}

      {/* ── Work Reviews ── */}
      {tab === "reviews" && <DeliverableList items={reviews} basePath={submissionsBase} />}

      {/* ── Proof of Work ── */}
      {tab === "proof" && <DeliverableList items={proof} basePath={submissionsBase} />}

      {/* ── Approved Clippers ── */}
      {tab === "approved" && <DeliverableList items={approved} basePath={submissionsBase} />}

      {/* ── Analytics ── */}
      {tab === "analytics" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Total Clippers", value: String(totalClippers) },
              { label: "In Review",      value: String(reviews.length) },
              { label: "Proof Pending",  value: String(proof.length) },
              { label: "Approved",       value: String(approved.length) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-border bg-surface p-5 text-center">
                <p className="text-3xl font-black">{value}</p>
                <p className="mt-1 text-xs text-muted">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Deliverable Breakdown</p>
            {[
              { label: "Draft Pending",       count: deliverables.filter(d => d.status === "draft_pending").length,      color: "bg-zinc-400" },
              { label: "Under Review",        count: deliverables.filter(d => d.status === "under_review").length,       color: "bg-yellow-400" },
              { label: "Draft Approved",      count: deliverables.filter(d => d.status === "draft_approved").length,     color: "bg-blue-400" },
              { label: "Live Submitted",      count: deliverables.filter(d => d.status === "live_submitted").length,     color: "bg-orange-400" },
              { label: "Proof Under Review",  count: deliverables.filter(d => d.status === "proof_under_review").length, color: "bg-orange-400" },
              { label: "Proof Approved",      count: deliverables.filter(d => d.status === "proof_approved").length,     color: "bg-emerald-400" },
              { label: "Rejected",            count: deliverables.filter(d => ["draft_rejected","proof_rejected"].includes(d.status)).length, color: "bg-red-400" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-sm">{label}</span>
                </div>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
