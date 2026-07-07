import { useEffect, useState } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import { CreatorProfileModal } from "@/features/creators/components/CreatorProfileModal";
import {
  BOARD_COLUMNS,
  RANK_STYLE,
  formatCount,
  formatDate,
  type ClipperProfile,
  type CreatorPerformance,
  type CreatorProfileSnippet,
  type DeliverableForBoard,
} from "@/features/campaigns/lib/campaign-board-data";
import { formatPlatformLabel } from "@/features/campaigns/lib/platform-labels";
import { formatInr } from "@/lib/format";

const PROFILE_PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  twitter: "Twitter",
  tiktok: "TikTok",
};

function ProfileBadge({ profile }: { profile: CreatorProfileSnippet }) {
  const platformLabel = PROFILE_PLATFORM_LABELS[profile.platform] ?? profile.platform;
  const displayLabel = profile.label ?? `@${profile.handle}`;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      {platformLabel} · {displayLabel}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-border bg-surface py-14">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

/* ── Status Board (read-only pipeline stages) ── */

function BoardStageCard({ d, onViewProfile }: { d: DeliverableForBoard; onViewProfile: (creatorId: string) => void }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-black text-primary">
          {d.creatorName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          {d.creatorId ? (
            <button
              type="button"
              onClick={() => onViewProfile(d.creatorId!)}
              className="truncate text-sm font-semibold hover:text-primary hover:underline"
            >
              {d.creatorName}
            </button>
          ) : (
            <p className="truncate text-sm font-semibold">{d.creatorName}</p>
          )}
          {d.creatorProfile ? (
            <p className="truncate text-[11px] text-muted">@{d.creatorProfile.handle} · {formatPlatformLabel(d.platform)}</p>
          ) : (
            <p className="truncate text-[11px] text-muted">{formatPlatformLabel(d.platform)}</p>
          )}
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <StatusPill status={d.status} />
        {d.priorRejectionCount > 0 && (
          <span className="shrink-0 text-[10px] font-semibold text-red-400">
            {d.priorRejectionCount} rejection{d.priorRejectionCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-variant text-xs font-bold text-muted">0</span>
      <p className="text-xs text-muted">No creators in this stage</p>
    </div>
  );
}

export function StatusBoard({ deliverables }: { deliverables: DeliverableForBoard[] }) {
  const [viewCreatorId, setViewCreatorId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-4" style={{ height: "calc(100vh - 260px)" }}>
      {viewCreatorId && <CreatorProfileModal creatorId={viewCreatorId} onClose={() => setViewCreatorId(null)} />}
      <div className="flex h-full gap-4">
        {BOARD_COLUMNS.map((col) => {
          const items = deliverables.filter((d) => col.statuses.includes(d.status));
          return (
            <div key={col.id} className="flex w-72 shrink-0 flex-col rounded-xl bg-surface-variant/30">
              <div className="flex items-center gap-2 px-3 py-3">
                <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                <span className="text-sm font-semibold">{col.label}</span>
                <span className="ml-auto rounded-full bg-surface-variant px-2 py-0.5 text-[10px] font-bold text-muted">
                  {items.length}
                </span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
                {items.length === 0
                  ? <EmptyColumn />
                  : items.map((d) => <BoardStageCard key={d.id} d={d} onViewProfile={setViewCreatorId} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Working Clippers (profile roster, read-only) ── */

export function ClipperProfileCard({ clipper, onOpen }: { clipper: ClipperProfile; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="cursor-pointer rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-black text-primary">
          {clipper.creatorName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{clipper.creatorName}</p>
          {clipper.creatorProfile ? (
            <p className="truncate text-[11px] text-muted">
              @{clipper.creatorProfile.handle} · {PROFILE_PLATFORM_LABELS[clipper.creatorProfile.platform] ?? clipper.creatorProfile.platform}
            </p>
          ) : (
            <p className="truncate text-[11px] text-muted">
              {clipper.platforms.map(formatPlatformLabel).join(", ")}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted">Joined</span>
        <span className="font-medium">{formatDate(clipper.joinedAt)}</span>
      </div>
    </div>
  );
}

export function ClipperProfileGrid({ items, onSelect }: { items: ClipperProfile[]; onSelect: (c: ClipperProfile) => void }) {
  if (items.length === 0) return <EmptyState message="No clippers have joined yet." />;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((c) => (
        <ClipperProfileCard key={c.participationId} clipper={c} onOpen={() => onSelect(c)} />
      ))}
    </div>
  );
}

export function ClipperProfileModal({ clipper, onClose }: { clipper: ClipperProfile; onClose: () => void }) {
  const [showFullProfile, setShowFullProfile] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {showFullProfile && clipper.creatorId && (
        <CreatorProfileModal creatorId={clipper.creatorId} onClose={() => setShowFullProfile(false)} />
      )}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-lg">Clipper Profile</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
              {clipper.creatorName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{clipper.creatorName}</p>
              <p className="text-xs text-muted">Joined {formatDate(clipper.joinedAt)}</p>
            </div>
          </div>

          {clipper.creatorProfile && (
            <div className="rounded-xl border border-border bg-surface-variant/50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Joined as</p>
              <div className="mt-2 flex items-center gap-2">
                <ProfileBadge profile={clipper.creatorProfile} />
                <span className="text-xs text-muted">@{clipper.creatorProfile.handle}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Formats</p>
            {clipper.deliverables.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                <span>{formatPlatformLabel(d.platform)}</span>
                <StatusPill status={d.status} />
              </div>
            ))}
          </div>

          {clipper.creatorId && (
            <button
              type="button"
              onClick={() => setShowFullProfile(true)}
              className="w-full rounded-xl border border-border py-2.5 text-sm font-semibold hover:border-primary/30 hover:text-primary"
            >
              View Full Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Analytics leaderboard ── */

export function Leaderboard({ items }: { items: CreatorPerformance[] }) {
  const [viewCreatorId, setViewCreatorId] = useState<string | null>(null);

  if (items.length === 0) return <EmptyState message="No performance data yet." />;
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      {viewCreatorId && <CreatorProfileModal creatorId={viewCreatorId} onClose={() => setViewCreatorId(null)} />}
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[40px_1fr_80px_80px_90px_80px_100px] gap-2 border-b border-border bg-surface-variant/40 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted">
          <span>#</span>
          <span>Creator</span>
          <span className="text-right">Views</span>
          <span className="text-right">Likes</span>
          <span className="text-right">Comments</span>
          <span className="text-right">Shares</span>
          <span className="text-right">Earnings</span>
        </div>
        {items.map((c, i) => {
          const rank = i + 1;
          return (
            <div
              key={c.participationId}
              className="grid grid-cols-[40px_1fr_80px_80px_90px_80px_100px] items-center gap-2 border-b border-border/40 px-4 py-3 last:border-0"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${RANK_STYLE[rank] ?? "bg-surface-variant text-muted border-border"}`}>
                {rank}
              </span>
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                  {c.creatorName.charAt(0).toUpperCase()}
                </div>
                {c.creatorId ? (
                  <button
                    type="button"
                    onClick={() => setViewCreatorId(c.creatorId!)}
                    className="truncate text-sm font-semibold hover:text-primary hover:underline"
                  >
                    {c.creatorName}
                  </button>
                ) : (
                  <p className="truncate text-sm font-semibold">{c.creatorName}</p>
                )}
              </div>
              <span className="text-right text-sm font-medium">{formatCount(c.totalViews)}</span>
              <span className="text-right text-sm font-medium">{formatCount(c.totalLikes)}</span>
              <span className="text-right text-sm font-medium">{formatCount(c.totalComments)}</span>
              <span className="text-right text-sm font-medium">{formatCount(c.totalShares)}</span>
              <span className="text-right text-sm font-semibold text-primary">{formatInr(c.totalEarningsPaise)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Work Submissions / Proof of Work cards ── */

export function SubmissionCard({ d, onOpen }: { d: DeliverableForBoard; onOpen: () => void }) {
  return (
    <div
      onClick={onOpen}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex items-center gap-3 border-b border-border/50 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-base font-black text-primary">
          {d.creatorName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold group-hover:text-primary">{d.creatorName}</p>
          {d.creatorProfile ? (
            <p className="truncate text-[11px] text-muted">@{d.creatorProfile.handle} · {formatPlatformLabel(d.platform)}</p>
          ) : (
            <p className="text-[11px] text-muted">{formatPlatformLabel(d.platform)}</p>
          )}
        </div>
        <StatusPill status={d.status} />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Submitted</span>
          <span className="font-medium">{d.draftSubmittedAt ? formatDate(d.draftSubmittedAt) : "—"}</span>
        </div>
        {d.priorRejectionCount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Rejections</span>
            <span className="font-semibold text-red-400">{d.priorRejectionCount}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border/50 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-muted">Review</span>
        <svg className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export function SubmissionGrid({ items, onSelect, emptyMessage }: { items: DeliverableForBoard[]; onSelect: (id: string) => void; emptyMessage: string }) {
  if (items.length === 0) return <EmptyState message={emptyMessage} />;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((d) => (
        <SubmissionCard key={d.id} d={d} onOpen={() => onSelect(d.id)} />
      ))}
    </div>
  );
}

/* ── Media preview (draft / live post link rendering) ── */

export function LinkCard({ label, url }: { label: string; url: string }) {
  let domain = url;
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // not a fully-qualified URL — fall back to showing it as-is
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-xl border border-border bg-surface-variant/50 p-4 transition-colors hover:border-primary/30"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-muted">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-primary">{domain}</p>
      </div>
    </a>
  );
}

function detectFileKind(pathname: string): "video" | "image" | null {
  const ext = pathname.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (["mp4", "mov", "webm", "m4v"].includes(ext)) return "video";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  return null;
}

const scriptLoadPromises = new Map<string, Promise<void>>();

function loadScriptOnce(src: string): Promise<void> {
  const existing = scriptLoadPromises.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
  scriptLoadPromises.set(src, promise);
  return promise;
}

function PreviewLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      {children}
    </div>
  );
}

function IframePreview({ src }: { src: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      <iframe src={src} className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
    </div>
  );
}

function InstagramEmbed({ url }: { url: string }) {
  useEffect(() => {
    loadScriptOnce("https://www.instagram.com/embed.js").then(() => {
      (window as unknown as { instgrm?: { Embeds: { process: () => void } } }).instgrm?.Embeds.process();
    });
  }, [url]);

  return (
    <div className="flex justify-center overflow-hidden rounded-xl border border-border bg-surface-variant/30 p-1">
      <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ margin: 0, width: "100%" }} />
    </div>
  );
}

function TwitterEmbed({ url }: { url: string }) {
  useEffect(() => {
    loadScriptOnce("https://platform.twitter.com/widgets.js").then(() => {
      (window as unknown as { twttr?: { widgets: { load: () => void } } }).twttr?.widgets.load();
    });
  }, [url]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface-variant/30 p-2">
      <blockquote className="twitter-tweet">
        <a href={url}>{url}</a>
      </blockquote>
    </div>
  );
}

export function MediaPreview({ label, url }: { label: string; url: string }) {
  let parsed: URL | null = null;
  try {
    parsed = new URL(url);
  } catch {
    return <LinkCard label={label} url={url} />;
  }

  // Directly-hosted file (uploaded via the mobile app to our own storage) — render it natively.
  const fileKind = detectFileKind(parsed.pathname);
  if (fileKind === "video") {
    return <PreviewLabel label={label}><video src={url} controls className="max-h-[420px] w-full rounded-xl border border-border bg-black" /></PreviewLabel>;
  }
  if (fileKind === "image") {
    return <PreviewLabel label={label}><img src={url} alt={label} className="max-h-[420px] w-full rounded-xl border border-border bg-black object-contain" /></PreviewLabel>;
  }

  if (parsed.hostname.includes("drive.google.com")) {
    const fileId = url.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] ?? parsed.searchParams.get("id");
    if (fileId) return <PreviewLabel label={label}><IframePreview src={`https://drive.google.com/file/d/${fileId}/preview`} /></PreviewLabel>;
  }

  if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
    let videoId: string | null = null;
    if (parsed.hostname.includes("youtu.be")) videoId = parsed.pathname.slice(1);
    else if (parsed.pathname.startsWith("/shorts/")) videoId = parsed.pathname.split("/")[2];
    else videoId = parsed.searchParams.get("v");
    if (videoId) return <PreviewLabel label={label}><IframePreview src={`https://www.youtube.com/embed/${videoId}`} /></PreviewLabel>;
  }

  if (parsed.hostname.includes("instagram.com")) {
    return <PreviewLabel label={label}><InstagramEmbed url={url} /></PreviewLabel>;
  }

  if (parsed.hostname.includes("twitter.com") || parsed.hostname.includes("x.com")) {
    return <PreviewLabel label={label}><TwitterEmbed url={url} /></PreviewLabel>;
  }

  return <LinkCard label={label} url={url} />;
}
