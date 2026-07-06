import { useQuery } from "@tanstack/react-query";

import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/features/campaigns/lib/campaign-board-data";
import { creatorApi, type CreatorCampaignSummary } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function CampaignList({ title, items, emptyMessage }: { title: string; items: CreatorCampaignSummary[]; emptyMessage: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted/60 italic">{emptyMessage}</p>
      ) : (
        items.map((c) => (
          <div key={c.campaignId} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
            <span className="truncate">{c.title}</span>
            <StatusPill status={c.status} className="shrink-0 ml-2" />
          </div>
        ))
      )}
    </div>
  );
}

export function CreatorProfileModal({ creatorId, onClose }: { creatorId: string; onClose: () => void }) {
  const { getToken } = useAuth();
  const token = getToken()!;

  const { data: creator, isPending, isError } = useQuery({
    queryKey: ["creator", creatorId],
    queryFn: () => creatorApi.get(token, creatorId),
    enabled: Boolean(token),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-lg">Creator Profile</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {isPending ? (
            <div className="h-64 animate-pulse rounded-xl bg-surface-variant/50" />
          ) : isError || !creator ? (
            <p className="py-10 text-center text-sm text-muted">Failed to load creator profile.</p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xl font-bold text-primary">
                  {creator.avatarUrl ? (
                    <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(creator.displayName ?? creator.username ?? "C")
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{creator.displayName ?? "Creator"}</p>
                  {creator.username && <p className="truncate text-xs text-muted">@{creator.username}</p>}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Email</span>
                  <span className="font-medium">{creator.email ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Phone</span>
                  <span className="font-medium">{creator.phone ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Joined</span>
                  <span className="font-medium">{formatDate(creator.createdAt)}</span>
                </div>
              </div>

              {creator.bio && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Bio</p>
                  <p className="text-sm text-foreground">{creator.bio}</p>
                </div>
              )}

              {creator.socialLinks && Object.values(creator.socialLinks).some((v) => v?.trim()) && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Social Accounts</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(creator.socialLinks)
                      .filter(([, url]) => url?.trim())
                      .map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/15"
                        >
                          {platform}
                        </a>
                      ))}
                  </div>
                </div>
              )}

              {creator.linkedProfiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Linked Accounts</p>
                  <div className="space-y-1.5">
                    {creator.linkedProfiles.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <span className="font-medium capitalize">{p.platform}</span>
                          <span className="ml-1.5 truncate text-muted">@{p.handle}</span>
                          {p.label && <span className="ml-1.5 text-xs text-muted/70">({p.label})</span>}
                        </div>
                        {p.isDefault && (
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">Default</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <CampaignList title="Running Campaigns" items={creator.runningCampaigns} emptyMessage="No running campaigns." />
              <CampaignList title="Past Campaigns" items={creator.pastCampaigns} emptyMessage="No past campaigns." />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
