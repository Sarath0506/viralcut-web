import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  Clock,
  ExternalLink,
  Globe,
  ImageIcon,
  Instagram,
  Linkedin,
  ReceiptText,
  Smartphone,
  TrendingUp,
  Twitter,
  Wallet,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { BackButton } from "@/components/ui/back-button";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { StatusPill } from "@/components/ui/status-pill";
import { formatDate } from "@/features/campaigns/lib/campaign-board-data";
import { adminApi, type AdminCreatorCampaignEntry, type KycStatus } from "@/lib/api";
import { formatInr, formatViews } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "C";
}

const PLATFORM_ICON: Record<string, LucideIcon> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  website: Globe,
};

function platformIcon(platform: string): LucideIcon {
  return PLATFORM_ICON[platform.toLowerCase()] ?? Globe;
}

const KYC_STYLE: Record<KycStatus, string> = {
  verified: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-warning/15 text-warning",
  not_started: "bg-surface-variant text-muted",
};

const KYC_LABEL: Record<KycStatus, string> = {
  verified: "KYC Verified",
  pending: "KYC Pending",
  not_started: "No KYC",
};

const WITHDRAWAL_STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-warning/15 text-warning",
  processing: "bg-primary/15 text-primary",
  failed: "bg-destructive/15 text-destructive",
};

/* ── Campaign card ── */
function CampaignCard({ entry }: { entry: AdminCreatorCampaignEntry }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-variant">
            {entry.coverImageUrl ? (
              <img src={resolveMediaUrl(entry.coverImageUrl)} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted" />
            )}
          </div>
          <p className="truncate font-semibold leading-tight">{entry.title}</p>
        </div>
        <StatusPill status={entry.status} className="shrink-0" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-center">
        <div>
          <p className="text-sm font-semibold leading-none tabular-nums text-foreground">{formatViews(entry.viewCount)}</p>
          <p className="mt-1 text-[10px] text-muted">Views</p>
        </div>
        <div>
          <p className="text-sm font-bold leading-none tabular-nums text-money">{formatInr(entry.earnedPaise)}</p>
          <p className="mt-1 text-[10px] text-muted">Earned</p>
        </div>
      </div>
    </div>
  );
}

function CampaignCardGrid({ entries, emptyMessage }: { entries: AdminCreatorCampaignEntry[]; emptyMessage: string }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted/60 italic">{emptyMessage}</p>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <CampaignCard key={entry.campaignId} entry={entry} />
      ))}
    </div>
  );
}

export function AdminClipperDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [tab, setTab] = useState<"campaigns" | "wallet" | "about">("campaigns");

  const { data: creator, isPending } = useQuery({
    queryKey: ["admin-creator", id],
    queryFn: () => adminApi.creator(getToken()!, id!),
    enabled: Boolean(getToken() && id),
  });

  if (isPending) return <DetailPageSkeleton />;
  if (!creator) return null;

  const name = creator.displayName ?? creator.username ?? "Creator";
  const socialEntries = creator.socialLinks
    ? Object.entries(creator.socialLinks).filter(([, url]) => url?.trim())
    : [];

  return (
    <div className="space-y-6">
      <BackButton to="/admin/clippers" label="All Clippers" />

      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="h-24 w-full bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />

        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-primary/15 text-2xl font-black text-primary ring-4 ring-surface">
              {creator.avatarUrl ? (
                <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(name)
              )}
            </div>

            <div className="flex items-end gap-3 pb-1">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center">
                <p className="text-lg font-black text-emerald-400">{formatInr(creator.wallet.lifetimePaise)}</p>
                <p className="text-[10px] text-muted">Lifetime earned</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-variant px-4 py-2 text-center">
                <p className="text-lg font-black text-primary">{formatInr(creator.wallet.availablePaise)}</p>
                <p className="text-[10px] text-muted">Available</p>
              </div>
              <div className="rounded-xl border border-border bg-surface-variant px-4 py-2 text-center">
                <p className="text-lg font-black">{creator.runningCampaigns.length + creator.pastCampaigns.length}</p>
                <p className="text-[10px] text-muted">Campaigns</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{name}</h1>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${KYC_STYLE[creator.kycStatus]}`}>
              {KYC_LABEL[creator.kycStatus]}
            </span>
            {!creator.isActive && (
              <span className="rounded-full bg-muted/20 px-2 py-0.5 text-[10px] font-bold text-muted">Inactive</span>
            )}
          </div>
          {creator.username && <p className="text-sm text-muted">@{creator.username}</p>}

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted">
            <span>{creator.email ?? "—"}</span>
            <span>{creator.phone ?? "—"}</span>
            <span>Joined {formatDate(creator.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["campaigns", "wallet", "about"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative px-5 py-3 text-sm font-medium capitalize transition-colors ${
              tab === t ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            {t === "wallet" ? "Wallet & Payouts" : t}
            {tab === t && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {/* Campaigns tab */}
      {tab === "campaigns" && (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Running Campaigns</p>
            <CampaignCardGrid entries={creator.runningCampaigns} emptyMessage="No running campaigns." />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Past Campaigns</p>
            <CampaignCardGrid entries={creator.pastCampaigns} emptyMessage="No past campaigns." />
          </div>
        </div>
      )}

      {/* Wallet & Payouts tab */}
      {tab === "wallet" && (
        <div className="space-y-4">
          {/* Balance overview — available balance leads, pending/lifetime support it */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-5 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Wallet className="h-3.5 w-3.5" />
                Available Balance
              </div>
              <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{formatInr(creator.wallet.availablePaise)}</p>
              <p className="mt-1 text-xs text-muted">Ready to withdraw</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  <Clock className="h-3.5 w-3.5" />
                  Pending
                </div>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-warning">{formatInr(creator.wallet.pendingPaise)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Lifetime
                </div>
                <p className="mt-1.5 text-lg font-bold tabular-nums text-emerald-400">{formatInr(creator.wallet.lifetimePaise)}</p>
              </div>
            </div>
          </div>

          {/* Payout methods */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">Payout Methods</p>
            </div>
            {creator.payoutMethods.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                <Building2 className="h-8 w-8 text-muted/30" />
                <p className="text-sm text-muted">No payout methods added yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {creator.payoutMethods.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant text-muted">
                      {m.type.toLowerCase() === "upi" ? (
                        <Smartphone className="h-4 w-4" />
                      ) : (
                        <Building2 className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{m.label}</p>
                      <p className="text-xs uppercase tracking-wide text-muted">{m.type} · {m.accountMasked}</p>
                    </div>
                    {m.isDefault && (
                      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawal history */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center gap-1.5 border-b border-border px-5 py-3.5">
              <ReceiptText className="h-4 w-4 text-muted" />
              <p className="text-sm font-semibold text-foreground">Withdrawal History</p>
            </div>
            {creator.withdrawals.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                <ReceiptText className="h-8 w-8 text-muted/30" />
                <p className="text-sm text-muted">No withdrawals yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {creator.withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tabular-nums text-foreground">{formatInr(w.netPaise)}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatInr(w.amountPaise)} gross · {formatInr(w.feePaise)} fee · {formatDate(w.createdAt)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          WITHDRAWAL_STATUS_STYLE[w.status] ?? "bg-surface-variant text-muted",
                        )}
                      >
                        {w.status}
                      </span>
                      {w.processedAt && (
                        <p className="mt-1 text-[11px] text-muted">Processed {formatDate(w.processedAt)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* About tab */}
      {tab === "about" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">Contact</p>
            </div>
            <div className="divide-y divide-border/50">
              {[
                { label: "Email", value: creator.email ?? "—" },
                { label: "Phone", value: creator.phone ?? "—" },
                { label: "Joined", value: formatDate(creator.createdAt) },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-muted">{label}</span>
                  <span className="text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {creator.bio && (
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-5 py-3.5">
                <p className="text-sm font-semibold text-foreground">Bio</p>
              </div>
              <p className="px-5 py-4 text-sm text-foreground">{creator.bio}</p>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">Linked Accounts</p>
            </div>
            {creator.linkedProfiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                <Globe className="h-8 w-8 text-muted/30" />
                <p className="text-sm text-muted">No linked platform accounts</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {creator.linkedProfiles.map((p) => {
                  const Icon = platformIcon(p.platform);
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-variant text-muted">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold capitalize">{p.platform}</p>
                        <p className="truncate text-xs text-muted">
                          @{p.handle}
                          {p.label ? ` · ${p.label}` : ""}
                        </p>
                      </div>
                      {p.isDefault && (
                        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">Default</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">Social Accounts</p>
            </div>
            {socialEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                <Globe className="h-8 w-8 text-muted/30" />
                <p className="text-sm text-muted">No social accounts added</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {socialEntries.map(([platform, url]) => {
                  const Icon = platformIcon(platform);
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-variant/40"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium capitalize">{platform}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
