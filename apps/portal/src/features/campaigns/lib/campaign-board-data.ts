/** Minimal shape shared by both the authenticated deliverable list and the public read-only one. */
export type DeliverableForBoard = {
  id: string;
  platform: string;
  status: string;
  draftSubmittedAt: string | null;
  participationId: string;
  joinedAt: string;
  creatorName: string;
  priorRejectionCount: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  estimatedPaise: number;
};

export type BoardColumn = {
  id: string;
  label: string;
  dot: string;
  statuses: string[];
};

// Read-only pipeline stages — status board shows where clippers stand, no actions here.
export const BOARD_COLUMNS: BoardColumn[] = [
  { id: "work_review",   label: "Work Review",   dot: "bg-yellow-400",  statuses: ["under_review", "draft_rejected"] },
  { id: "proof_pending", label: "Proof Pending", dot: "bg-blue-400",    statuses: ["draft_approved"] },
  { id: "proof_review",  label: "Proof Review",  dot: "bg-orange-400",  statuses: ["live_submitted", "proof_under_review", "proof_rejected"] },
  { id: "completed",     label: "Completed",     dot: "bg-emerald-400", statuses: ["proof_approved"] },
];

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export const RANK_STYLE: Record<number, string> = {
  1: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  2: "bg-zinc-400/15 text-zinc-300 border-zinc-400/25",
  3: "bg-orange-500/15 text-orange-400 border-orange-500/25",
};

export type ClipperProfile = {
  participationId: string;
  creatorName: string;
  platforms: string[];
  joinedAt: string;
  deliverables: Array<{ id: string; platform: string; status: string }>;
};

export function buildClipperProfiles(deliverables: DeliverableForBoard[]): ClipperProfile[] {
  const byParticipation = new Map<string, ClipperProfile>();
  for (const d of deliverables) {
    let entry = byParticipation.get(d.participationId);
    if (!entry) {
      entry = {
        participationId: d.participationId,
        creatorName: d.creatorName,
        platforms: [],
        joinedAt: d.joinedAt,
        deliverables: [],
      };
      byParticipation.set(d.participationId, entry);
    }
    if (!entry.platforms.includes(d.platform)) entry.platforms.push(d.platform);
    entry.deliverables.push({ id: d.id, platform: d.platform, status: d.status });
  }
  return Array.from(byParticipation.values()).sort(
    (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
  );
}

export type CreatorPerformance = {
  participationId: string;
  creatorName: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalEarningsPaise: number;
};

export function buildCreatorPerformance(deliverables: DeliverableForBoard[]): CreatorPerformance[] {
  const byParticipation = new Map<string, CreatorPerformance>();
  for (const d of deliverables) {
    let entry = byParticipation.get(d.participationId);
    if (!entry) {
      entry = {
        participationId: d.participationId,
        creatorName: d.creatorName,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalEarningsPaise: 0,
      };
      byParticipation.set(d.participationId, entry);
    }
    entry.totalViews += d.viewCount;
    entry.totalLikes += d.likeCount;
    entry.totalComments += d.commentCount;
    entry.totalShares += d.shareCount;
    entry.totalEarningsPaise += d.estimatedPaise;
  }
  return Array.from(byParticipation.values()).sort((a, b) => b.totalViews - a.totalViews);
}
