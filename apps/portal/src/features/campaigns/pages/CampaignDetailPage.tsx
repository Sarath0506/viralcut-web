import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { BackButton } from "@/components/ui/back-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusPill } from "@/components/ui/status-pill";
import { useToast } from "@/components/ui/toaster";
import {
  ClipperProfileGrid,
  ClipperProfileModal,
  Leaderboard,
  MediaPreview,
  StatusBoard,
  SubmissionGrid,
} from "@/features/campaigns/components/campaign-board-widgets";
import { useCampaign, useUpdateCampaignStatus } from "@/features/campaigns/hooks/use-campaigns";
import {
  buildClipperProfiles,
  buildCreatorPerformance,
  formatCount,
  formatDate,
  type ClipperProfile,
} from "@/features/campaigns/lib/campaign-board-data";
import { getWizardEditPath } from "@/features/campaigns/lib/wizard-paths";
import { useSubmission } from "@/features/submissions/hooks/use-submissions";
import { resolveMediaUrl } from "@/lib/media-url";
import { formatInr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { portalApi, ApiError } from "@/lib/api";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

type Tab = "overview" | "clippers" | "board" | "submissions" | "proof" | "analytics";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",    label: "Overview" },
  { id: "clippers",    label: "Working Clippers" },
  { id: "board",       label: "Status Board" },
  { id: "submissions", label: "Work Submissions" },
  { id: "proof",       label: "Proof of Work" },
  { id: "analytics",   label: "Analytics" },
];

const CAMPAIGN_STATUS_STYLE: Record<string, string> = {
  live:   "bg-emerald-500 text-white",
  draft:  "bg-zinc-600 text-white",
  paused: "bg-orange-500 text-white",
  closed: "bg-red-600 text-white",
};

/* ── Work Submissions / Proof of Work (actionable, open review modal) ── */

function SubmissionDetailModal({
  deliverableId,
  section,
  onClose,
}: {
  deliverableId: string;
  section: "submissions" | "proof";
  onClose: () => void;
}) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: d, isPending } = useSubmission(deliverableId);

  function invalidateAfterReview() {
    void queryClient.invalidateQueries({ queryKey: ["submission", "deliverable", deliverableId] });
    void queryClient.invalidateQueries({ queryKey: ["campaign-deliverables"] });
    setShowRejectForm(false);
    setRejectReason("");
  }

  const reviewMutation = useMutation({
    mutationFn: (body: { action: "approve" | "reject"; rejectionReason?: string }) =>
      portalApi.submissions.review(getToken()!, deliverableId, body),
    onSuccess: () => {
      invalidateAfterReview();
      toast("Submission updated");
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Review failed", "error"),
  });

  const approveProofMutation = useMutation({
    mutationFn: () => portalApi.submissions.approveProof(getToken()!, deliverableId),
    onSuccess: () => {
      invalidateAfterReview();
      toast("Proof approved — creator can now see their earnings");
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Approval failed", "error"),
  });

  const rejectProofMutation = useMutation({
    mutationFn: () => portalApi.submissions.rejectProof(getToken()!, deliverableId, rejectReason.trim()),
    onSuccess: () => {
      invalidateAfterReview();
      toast("Proof rejected — creator will be notified");
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Rejection failed", "error"),
  });

  const isMutating =
    reviewMutation.isPending || approveProofMutation.isPending || rejectProofMutation.isPending;

  const canReviewDraft = d?.status === "under_review";
  const canReviewProof = d?.status === "proof_under_review" || d?.status === "live_submitted";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">Work Submission Details</h2>
            {d && <StatusPill status={d.status} />}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isPending || !d ? (
          <div className="flex-1 p-10 text-center text-sm text-muted">Loading…</div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 lg:grid-cols-[260px_1fr_260px]">
            {/* LEFT — campaign + creator */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface-variant/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Campaign Details</p>
                <p className="mt-2 font-bold">{d.campaign.title}</p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Status</span>
                    <StatusPill status={d.campaign.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Rate</span>
                    <span className="font-medium">{d.campaign.ratePer1kDisplay}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Budget</span>
                    <span className="font-medium">{formatInr(d.campaign.budgetPaise)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-variant/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Creator</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                    {(d.creator.displayName ?? d.creator.username ?? "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{d.creator.displayName ?? d.creator.username ?? "Creator"}</p>
                    {d.creator.username && <p className="truncate text-xs text-muted">@{d.creator.username}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE — media + notes */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{d.draftSubmittedAt ? `Submitted ${formatDate(d.draftSubmittedAt)}` : "Not submitted yet"}</span>
                {(d.draftReviewedAt || d.proofReviewedAt) && (
                  <span>Reviewed {formatDate(d.proofReviewedAt ?? d.draftReviewedAt!)}</span>
                )}
              </div>

              <div className="space-y-3">
                {section === "submissions" ? (
                  d.draftDriveUrl ? (
                    <MediaPreview label="Draft" url={d.draftDriveUrl} />
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10 text-sm text-muted">
                      Nothing submitted yet
                    </div>
                  )
                ) : d.livePostUrl ? (
                  <MediaPreview label="Live post" url={d.livePostUrl} />
                ) : (
                  <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10 text-sm text-muted">
                    Nothing submitted yet
                  </div>
                )}
              </div>

              {d.rejectionReason && (
                <div className="rounded-xl bg-surface-variant/50 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Rejection reason
                  </p>
                  <p className="mt-1.5 text-sm text-muted">{d.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* RIGHT — actions + history */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-surface-variant/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Actions</p>
                <div className="mt-3 space-y-3">
                  {(canReviewDraft || canReviewProof) && showRejectForm ? (
                    <>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Rejection reason (required)"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setShowRejectForm(false)} disabled={isMutating}>
                          Back
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          disabled={isMutating || !rejectReason.trim()}
                          onClick={() =>
                            canReviewDraft
                              ? reviewMutation.mutate({ action: "reject", rejectionReason: rejectReason })
                              : rejectProofMutation.mutate()
                          }
                        >
                          {isMutating ? "Rejecting…" : "Confirm Reject"}
                        </Button>
                      </div>
                    </>
                  ) : canReviewDraft ? (
                    <>
                      <Button className="w-full" onClick={() => reviewMutation.mutate({ action: "approve" })} disabled={isMutating}>
                        {reviewMutation.isPending ? "Accepting…" : "Accept submission"}
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => setShowRejectForm(true)} disabled={isMutating}>
                        Reject submission
                      </Button>
                    </>
                  ) : canReviewProof ? (
                    <>
                      <Button className="w-full" onClick={() => approveProofMutation.mutate()} disabled={isMutating}>
                        {approveProofMutation.isPending ? "Accepting…" : "Accept submission"}
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => setShowRejectForm(true)} disabled={isMutating}>
                        Reject submission
                      </Button>
                    </>
                  ) : (
                    <div className="rounded-lg bg-surface-variant px-3 py-2.5 text-center text-sm text-muted">
                      {d.status === "draft_pending" ? "Nothing to review yet." : "Already reviewed."}
                    </div>
                  )}
                </div>
              </div>

              {d.rejectionHistory.length > 0 && (
                <div className="rounded-xl border border-border bg-surface-variant/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">History</p>
                  <div className="mt-3 space-y-2">
                    {d.rejectionHistory.map((event, i) => (
                      <div key={event.id} className="rounded-lg border border-border bg-surface px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">Attempt {d.rejectionHistory.length - i}</span>
                          <StatusPill status="draft_rejected" />
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          {formatDate(event.rejectedAt)}
                          {event.reviewedByDisplayName ? ` · ${event.reviewedByDisplayName}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Campaign detail page ── */

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const role = usePortalRole();
  const isAdmin = role === "admin";
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedSubmission, setSelectedSubmission] = useState<{ id: string; section: "submissions" | "proof" } | null>(null);
  const [selectedClipper, setSelectedClipper] = useState<ClipperProfile | null>(null);
  const [pendingStatus, setPendingStatus] = useState<"live" | "paused" | null>(null);

  const { data: campaign, isPending } = useCampaign(id);
  const { data: deliverables = [] } = useQuery({
    queryKey: ["campaign-deliverables", id],
    queryFn: () => portalApi.submissions.listByCampaign(getToken()!, id!),
    enabled: Boolean(getToken() && id),
  });
  const updateStatus = useUpdateCampaignStatus();

  if (isPending || !campaign) return <DetailPageSkeleton />;

  const editPath = id && campaign.status !== "closed" ? getWizardEditPath(id, isAdmin) : null;
  const editLabel = campaign.status === "draft" ? "Continue editing" : "Edit campaign";
  // Staff arrive via a specific brand's page, not a generic campaigns list — fall back to browser history for them.
  const backTo = isAdmin ? "/admin/campaigns" : role === "brand" ? "/campaigns" : undefined;

  async function confirmStatusChange() {
    if (!id || !pendingStatus) return;
    try {
      await updateStatus.mutateAsync({ id, status: pendingStatus });
      toast(pendingStatus === "paused" ? "Campaign paused" : "Campaign resumed");
      setPendingStatus(null);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not update campaign", "error");
    }
  }

  async function copyShareLink() {
    if (!id) return;
    const url = `${window.location.origin}/share/campaigns/${id}`;
    await navigator.clipboard.writeText(url);
    toast("Read-only campaign link copied");
  }

  const clippers = buildClipperProfiles(deliverables);
  // Anything that has ever had a draft submitted stays here permanently — approving
  // or progressing to the proof stage only updates the status pill, it doesn't move sections.
  const workSubmissions = deliverables.filter((d) => d.status !== "draft_pending");
  const proofSubmissions = deliverables.filter((d) => ["live_submitted", "proof_under_review", "proof_approved", "proof_rejected"].includes(d.status));
  const reviews  = deliverables.filter((d) => d.status === "under_review");
  const approved = deliverables.filter((d) => ["draft_approved", "proof_approved"].includes(d.status));
  const totalClippers = new Set(deliverables.map((d) => d.participationId)).size;

  const creatorPerformance = buildCreatorPerformance(deliverables);
  const totalViews = deliverables.reduce((sum, d) => sum + d.viewCount, 0);
  const totalLikes = deliverables.reduce((sum, d) => sum + d.likeCount, 0);
  const totalComments = deliverables.reduce((sum, d) => sum + d.commentCount, 0);
  const totalShares = deliverables.reduce((sum, d) => sum + d.shareCount, 0);
  const totalEarningsPaise = deliverables.reduce((sum, d) => sum + d.estimatedPaise, 0);

  const campaignStatusStyle = CAMPAIGN_STATUS_STYLE[campaign.status] ?? CAMPAIGN_STATUS_STYLE.draft;

  return (
    <div className="space-y-5">
      <BackButton to={backTo} label="Back to campaigns" />

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
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {editPath && (
                  <Link to={editPath} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "shrink-0")}>
                    {editLabel}
                  </Link>
                )}
                {campaign.status === "live" && (
                  <Button size="sm" variant="outline" onClick={() => setPendingStatus("paused")}>
                    Pause
                  </Button>
                )}
                {campaign.status === "paused" && (
                  <Button size="sm" onClick={() => setPendingStatus("live")}>
                    Resume
                  </Button>
                )}
                {campaign.status !== "draft" && (
                  <Button size="sm" variant="outline" onClick={() => void copyShareLink()}>
                    Share
                  </Button>
                )}
              </div>
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
      {tab === "clippers" && <ClipperProfileGrid items={clippers} onSelect={setSelectedClipper} />}

      {/* ── Status Board ── */}
      {tab === "board" && <StatusBoard deliverables={deliverables} />}

      {/* ── Work Submissions ── */}
      {tab === "submissions" && (
        <SubmissionGrid
          items={workSubmissions}
          onSelect={(id) => setSelectedSubmission({ id, section: "submissions" })}
          emptyMessage="No work submissions yet."
        />
      )}

      {/* ── Proof of Work ── */}
      {tab === "proof" && (
        <SubmissionGrid
          items={proofSubmissions}
          onSelect={(id) => setSelectedSubmission({ id, section: "proof" })}
          emptyMessage="No proof submissions yet."
        />
      )}

      {/* ── Analytics ── */}
      {tab === "analytics" && (
        <div className="space-y-5">
          {/* Overall campaign performance */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Campaign Performance</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              {[
                { label: "Total Views",    value: formatCount(totalViews) },
                { label: "Total Likes",    value: formatCount(totalLikes) },
                { label: "Total Comments", value: formatCount(totalComments) },
                { label: "Total Shares",   value: formatCount(totalShares) },
                { label: "Total Earnings", value: formatInr(totalEarningsPaise) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-border bg-surface p-5 text-center">
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top performers leaderboard */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Top Performers</p>
            <Leaderboard items={creatorPerformance} />
          </div>

          {/* Pipeline breakdown */}
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">Pipeline Breakdown</p>
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: "Total Clippers", value: String(totalClippers) },
                { label: "In Review",      value: String(reviews.length) },
                { label: "Proof Pending",  value: String(proofSubmissions.length) },
                { label: "Approved",       value: String(approved.length) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-border bg-surface-variant/30 p-4 text-center">
                  <p className="text-xl font-black">{value}</p>
                  <p className="mt-1 text-xs text-muted">{label}</p>
                </div>
              ))}
            </div>
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

      {selectedSubmission && (
        <SubmissionDetailModal
          deliverableId={selectedSubmission.id}
          section={selectedSubmission.section}
          onClose={() => setSelectedSubmission(null)}
        />
      )}

      {selectedClipper && (
        <ClipperProfileModal clipper={selectedClipper} onClose={() => setSelectedClipper(null)} />
      )}

      <ConfirmDialog
        open={pendingStatus !== null}
        title={pendingStatus === "paused" ? "Pause campaign?" : "Resume campaign?"}
        description={
          pendingStatus === "paused"
            ? "Creators will no longer see this campaign until you resume it."
            : "Make this campaign live for creators again."
        }
        confirmLabel={pendingStatus === "paused" ? "Pause" : "Resume"}
        loading={updateStatus.isPending}
        onConfirm={() => void confirmStatusChange()}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  );
}
