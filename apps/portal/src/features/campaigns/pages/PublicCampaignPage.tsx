import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { StatusPill } from "@/components/ui/status-pill";
import {
  ClipperProfileGrid,
  ClipperProfileModal,
  Leaderboard,
  MediaPreview,
  StatusBoard,
  SubmissionGrid,
} from "@/features/campaigns/components/campaign-board-widgets";
import {
  buildClipperProfiles,
  buildCreatorPerformance,
  formatCount,
  formatDate,
  type ClipperProfile,
} from "@/features/campaigns/lib/campaign-board-data";
import { formatPlatformLabel } from "@/features/campaigns/lib/platform-labels";
import { parseRulePoints } from "@/features/campaigns/lib/rule-points";
import { formatInr } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media-url";
import { publicApi, type PublicDeliverableListItem } from "@/lib/api";

type Tab = "overview" | "clippers" | "board" | "submissions" | "proof" | "analytics";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",    label: "Overview" },
  { id: "clippers",    label: "Working Clippers" },
  { id: "board",       label: "Status Board" },
  { id: "submissions", label: "Work Submissions" },
  { id: "proof",       label: "Proof of Work" },
  { id: "analytics",   label: "Analytics" },
];

const STATUS_STYLE: Record<string, string> = {
  live:   "bg-emerald-500 text-white",
  draft:  "bg-zinc-600 text-white",
  paused: "bg-orange-500 text-white",
  closed: "bg-red-600 text-white",
};

function ReadOnlySubmissionModal({
  deliverable,
  section,
  onClose,
}: {
  deliverable: PublicDeliverableListItem;
  section: "submissions" | "proof";
  onClose: () => void;
}) {
  const url = section === "submissions" ? deliverable.draftDriveUrl : deliverable.livePostUrl;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-lg">{deliverable.creatorName}</h2>
            <StatusPill status={deliverable.status} />
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{formatPlatformLabel(deliverable.platform)}</span>
            <span>{deliverable.draftSubmittedAt ? `Submitted ${formatDate(deliverable.draftSubmittedAt)}` : "Not submitted yet"}</span>
          </div>

          {url ? (
            <MediaPreview label={section === "submissions" ? "Draft" : "Live post"} url={url} />
          ) : (
            <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-10 text-sm text-muted">
              Nothing submitted yet
            </div>
          )}

          {deliverable.rejectionReason && (
            <div className="rounded-xl bg-surface-variant/50 p-4">
              <p className="text-sm font-semibold">Rejection reason</p>
              <p className="mt-1.5 text-sm text-muted">{deliverable.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PublicCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedClipper, setSelectedClipper] = useState<ClipperProfile | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<{ item: PublicDeliverableListItem; section: "submissions" | "proof" } | null>(null);

  const { data: campaign, isPending, isError } = useQuery({
    queryKey: ["public-campaign", id],
    queryFn: () => publicApi.campaign(id!),
    enabled: Boolean(id),
    retry: false,
  });
  const { data: deliverables = [] } = useQuery({
    queryKey: ["public-campaign-deliverables", id],
    queryFn: () => publicApi.deliverables(id!),
    enabled: Boolean(id) && Boolean(campaign),
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-2xl bg-surface-variant" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold">This campaign link isn't available.</p>
        <p className="mt-2 text-sm text-muted">It may have been unpublished or the link is incorrect.</p>
      </div>
    );
  }

  const statusStyle = STATUS_STYLE[campaign.status] ?? STATUS_STYLE.closed;
  const doPoints = parseRulePoints(campaign.doRules ?? "");
  const avoidPoints = parseRulePoints(campaign.avoidRules ?? "");

  const clippers = buildClipperProfiles(deliverables);
  const workSubmissions = deliverables.filter((d) => d.status !== "draft_pending");
  const proofSubmissions = deliverables.filter((d) =>
    ["live_submitted", "proof_under_review", "proof_approved", "proof_rejected"].includes(d.status),
  );
  const reviews = deliverables.filter((d) => d.status === "under_review");
  const approved = deliverables.filter((d) => ["draft_approved", "proof_approved"].includes(d.status));
  const totalClippers = new Set(deliverables.map((d) => d.participationId)).size;

  const creatorPerformance = buildCreatorPerformance(deliverables);
  const totalViews = deliverables.reduce((sum, d) => sum + d.viewCount, 0);
  const totalLikes = deliverables.reduce((sum, d) => sum + d.likeCount, 0);
  const totalComments = deliverables.reduce((sum, d) => sum + d.commentCount, 0);
  const totalShares = deliverables.reduce((sum, d) => sum + d.shareCount, 0);
  const totalEarningsPaise = deliverables.reduce((sum, d) => sum + d.estimatedPaise, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-5 px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-muted">
          {campaign.brandLogoUrl ? (
            <img src={resolveMediaUrl(campaign.brandLogoUrl)} alt={campaign.brandCompanyName ?? ""} className="h-6 w-6 rounded-full object-cover" />
          ) : null}
          <span>{campaign.brandCompanyName ?? "Brand campaign"}</span>
          <span className="text-muted/50">•</span>
          <span>Read-only view</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {campaign.coverImageUrl && (
            <div className="h-56 w-full overflow-hidden bg-surface-variant">
              <img src={resolveMediaUrl(campaign.coverImageUrl)} alt={campaign.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle}`}>
                {campaign.status}
              </span>
              {campaign.platforms.map((p) => (
                <span key={p} className="rounded-full bg-surface-variant px-2 py-0.5 text-[10px] text-muted">
                  {formatPlatformLabel(p)}
                </span>
              ))}
            </div>
            <h1 className="mt-3 text-2xl font-black leading-tight">{campaign.title}</h1>
            {campaign.briefHook && <p className="mt-1 text-sm font-medium text-primary">{campaign.briefHook}</p>}

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-sm">
              <div>
                <p className="text-xs text-muted">Category</p>
                <p className="font-semibold">{campaign.category || "Not set"}</p>
              </div>
              {campaign.startDate && (
                <div>
                  <p className="text-xs text-muted">Start date</p>
                  <p className="font-semibold">{formatDate(campaign.startDate)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted">Clippers</p>
                <p className="font-semibold">{totalClippers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Overview */}
        {tab === "overview" && (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Brief</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{campaign.brief}</p>
              {campaign.productUrl && (
                <a href={campaign.productUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                  Product page →
                </a>
              )}
            </div>

            {(doPoints.length > 0 || avoidPoints.length > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {doPoints.length > 0 && (
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Do</p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {doPoints.map((point) => (
                        <li key={point.id} className="flex gap-2">
                          <span className="text-emerald-400">•</span>
                          <span>{point.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {avoidPoints.length > 0 && (
                  <div className="rounded-2xl border border-border bg-surface p-5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-400">Avoid</p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {avoidPoints.map((point) => (
                        <li key={point.id} className="flex gap-2">
                          <span className="text-red-400">•</span>
                          <span>{point.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {campaign.sourceAssets && campaign.sourceAssets.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Source Assets</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {campaign.sourceAssets.map((asset, i) => (
                    <li key={i}>
                      <span className="font-medium capitalize">{asset.type}</span>
                      {asset.label ? ` — ${asset.label}` : ""}:{" "}
                      <a href={asset.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {asset.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {campaign.referenceAssets && campaign.referenceAssets.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Reference Assets</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {campaign.referenceAssets.map((asset, i) => (
                    <a
                      key={i}
                      href={resolveMediaUrl(asset.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="overflow-hidden rounded-xl border border-border bg-surface-variant"
                    >
                      {asset.type === "image" ? (
                        <img src={resolveMediaUrl(asset.url)} alt={asset.label ?? "Reference"} className="h-24 w-full object-cover" />
                      ) : (
                        <video src={resolveMediaUrl(asset.url)} className="h-24 w-full object-cover" muted />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Working Clippers */}
        {tab === "clippers" && <ClipperProfileGrid items={clippers} onSelect={setSelectedClipper} />}

        {/* Status Board */}
        {tab === "board" && <StatusBoard deliverables={deliverables} />}

        {/* Work Submissions */}
        {tab === "submissions" && (
          <SubmissionGrid
            items={workSubmissions}
            onSelect={(id) => {
              const item = deliverables.find((d) => d.id === id);
              if (item) setSelectedSubmission({ item, section: "submissions" });
            }}
            emptyMessage="No work submissions yet."
          />
        )}

        {/* Proof of Work */}
        {tab === "proof" && (
          <SubmissionGrid
            items={proofSubmissions}
            onSelect={(id) => {
              const item = deliverables.find((d) => d.id === id);
              if (item) setSelectedSubmission({ item, section: "proof" });
            }}
            emptyMessage="No proof submissions yet."
          />
        )}

        {/* Analytics */}
        {tab === "analytics" && (
          <div className="space-y-5">
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

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Top Performers</p>
              <Leaderboard items={creatorPerformance} />
            </div>

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
                { label: "Draft Pending",      count: deliverables.filter((d) => d.status === "draft_pending").length,      color: "bg-zinc-400" },
                { label: "Under Review",       count: deliverables.filter((d) => d.status === "under_review").length,       color: "bg-yellow-400" },
                { label: "Draft Approved",     count: deliverables.filter((d) => d.status === "draft_approved").length,     color: "bg-blue-400" },
                { label: "Live Submitted",     count: deliverables.filter((d) => d.status === "live_submitted").length,     color: "bg-orange-400" },
                { label: "Proof Under Review", count: deliverables.filter((d) => d.status === "proof_under_review").length, color: "bg-orange-400" },
                { label: "Proof Approved",     count: deliverables.filter((d) => d.status === "proof_approved").length,     color: "bg-emerald-400" },
                { label: "Rejected",           count: deliverables.filter((d) => ["draft_rejected", "proof_rejected"].includes(d.status)).length, color: "bg-red-400" },
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

      {selectedClipper && (
        <ClipperProfileModal clipper={selectedClipper} onClose={() => setSelectedClipper(null)} />
      )}

      {selectedSubmission && (
        <ReadOnlySubmissionModal
          deliverable={selectedSubmission.item}
          section={selectedSubmission.section}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
