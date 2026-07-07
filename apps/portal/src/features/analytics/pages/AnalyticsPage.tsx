import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Eye,
  Heart,
  IndianRupee,
  Megaphone,
  MessageCircle,
  Search,
  Share2,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/ui/status-pill";
import { CreatorProfileModal } from "@/features/creators/components/CreatorProfileModal";
import { formatInr, formatViews } from "@/lib/format";
import { portalApi, type AnalyticsOverview } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

type Campaign = AnalyticsOverview["campaigns"][number];
type Creator = AnalyticsOverview["topCreators"][number];
type Tab = "campaigns" | "performers";

const PAGE_SIZE = 12;

const RANK_STYLE: Record<number, string> = {
  1: "bg-yellow-500/15 text-yellow-500 ring-1 ring-yellow-500/25",
  2: "bg-zinc-400/15 text-zinc-400 ring-1 ring-zinc-400/25",
  3: "bg-orange-500/15 text-orange-500 ring-1 ring-orange-500/25",
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "C";
}

/* ── Loading skeleton that mirrors the real layout ── */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <header>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-72" />
      </header>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-11 w-64 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[124px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/* ── Primary KPI tile ── */
function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Megaphone;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            accent ? "bg-money/10 text-money" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-bold sm:text-2xl">{value}</p>
          <p className="truncate text-xs text-muted">{label}</p>
        </div>
      </div>
    </Card>
  );
}

/* ── Secondary engagement strip ── */
function EngagementStat({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: string }) {
  return (
    <div className="flex flex-1 items-center justify-center gap-2.5 py-1">
      <Icon className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
      <div className="leading-tight">
        <p className="text-sm font-bold">{value}</p>
        <p className="text-[10px] text-muted">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof BarChart3; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-14 text-center">
      <Icon className="mb-2 h-8 w-8 text-muted/40" strokeWidth={1.5} />
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative flex h-10 flex-1 items-center">
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full rounded-xl border border-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
      />
    </label>
  );
}

function SortSelect<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-10 shrink-0 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>Sort by {opt.label}</option>
      ))}
    </select>
  );
}

/* ── Campaign card ── */
function CampaignCard({ campaign, onClick }: { campaign: Campaign; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
            {campaign.coverImageUrl ? (
              <img src={resolveMediaUrl(campaign.coverImageUrl)} alt="" className="h-full w-full object-cover" />
            ) : (
              <Megaphone className="h-5 w-5" strokeWidth={2} />
            )}
          </div>
          <p className="truncate font-semibold leading-tight">{campaign.title}</p>
        </div>
        <StatusPill status={campaign.status} className="shrink-0" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
        <div>
          <p className="text-sm font-bold leading-none tabular-nums">{campaign.clipperCount}</p>
          <p className="mt-1 text-[10px] text-muted">Clippers</p>
        </div>
        <div>
          <p className="text-sm font-semibold leading-none tabular-nums text-foreground">{formatViews(campaign.totalViews)}</p>
          <p className="mt-1 text-[10px] text-muted">Views</p>
        </div>
        <div>
          <p className="text-sm font-bold leading-none tabular-nums text-money">{formatInr(campaign.totalEarningsPaise)}</p>
          <p className="mt-1 text-[10px] text-muted">Earnings</p>
        </div>
      </div>
    </div>
  );
}

/* ── Top creator row ── */
function CreatorRow({ creator, rank, onView }: { creator: Creator; rank: number; onView: () => void }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border p-4",
        rank <= 3 ? "border-primary/15 bg-primary/[0.03]" : "border-border bg-surface",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          RANK_STYLE[rank] ?? "bg-surface-variant text-muted",
        )}
      >
        {rank}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-black text-primary">
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(creator.creatorName)
          )}
        </div>
        <div className="min-w-0">
          <button
            type="button"
            onClick={onView}
            className="block truncate text-left text-sm font-semibold hover:text-primary hover:underline"
          >
            {creator.creatorName}
          </button>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted">
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" strokeWidth={2} />{formatViews(creator.totalLikes)}</span>
            <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" strokeWidth={2} />{formatViews(creator.totalComments)}</span>
            <span className="flex items-center gap-1"><Share2 className="h-3 w-3" strokeWidth={2} />{formatViews(creator.totalShares)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 sm:gap-7">
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums">{formatViews(creator.totalViews)}</p>
          <p className="text-[10px] text-muted">Views</p>
        </div>
        <div className="w-20 text-right">
          <p className="text-sm font-bold tabular-nums text-money">{formatInr(creator.totalEarningsPaise)}</p>
          <p className="text-[10px] text-muted">Earned</p>
        </div>
      </div>
    </div>
  );
}

const CAMPAIGN_SORTS = {
  views: (a: Campaign, b: Campaign) => b.totalViews - a.totalViews,
  earnings: (a: Campaign, b: Campaign) => b.totalEarningsPaise - a.totalEarningsPaise,
  clippers: (a: Campaign, b: Campaign) => b.clipperCount - a.clipperCount,
} as const;

const CREATOR_SORTS = {
  views: (a: Creator, b: Creator) => b.totalViews - a.totalViews,
  earnings: (a: Creator, b: Creator) => b.totalEarningsPaise - a.totalEarningsPaise,
  likes: (a: Creator, b: Creator) => b.totalLikes - a.totalLikes,
  comments: (a: Creator, b: Creator) => b.totalComments - a.totalComments,
  shares: (a: Creator, b: Creator) => b.totalShares - a.totalShares,
} as const;

export function AnalyticsPage() {
  const { getToken } = useAuth();
  const role = usePortalRole();
  const navigate = useNavigate();
  const campaignBase = role === "admin" ? "/admin/campaigns" : "/campaigns";
  const [viewCreatorId, setViewCreatorId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("campaigns");

  const [campaignQuery, setCampaignQuery] = useState("");
  const [campaignStatus, setCampaignStatus] = useState("all");
  const [campaignSort, setCampaignSort] = useState<keyof typeof CAMPAIGN_SORTS>("views");
  const [campaignLimit, setCampaignLimit] = useState(PAGE_SIZE);

  const [creatorQuery, setCreatorQuery] = useState("");
  const [creatorSort, setCreatorSort] = useState<keyof typeof CREATOR_SORTS>("views");
  const [creatorLimit, setCreatorLimit] = useState(PAGE_SIZE);

  const { data, isPending } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: () => portalApi.submissions.analyticsOverview(getToken()!),
    enabled: Boolean(getToken()),
  });

  const campaignStatuses = useMemo(
    () => Array.from(new Set((data?.campaigns ?? []).map((c) => c.status))),
    [data],
  );

  const filteredCampaigns = useMemo(() => {
    if (!data) return [];
    const q = campaignQuery.trim().toLowerCase();
    return data.campaigns
      .filter((c) => (!q || c.title.toLowerCase().includes(q)) && (campaignStatus === "all" || c.status === campaignStatus))
      .sort(CAMPAIGN_SORTS[campaignSort]);
  }, [data, campaignQuery, campaignStatus, campaignSort]);

  const filteredCreators = useMemo(() => {
    if (!data) return [];
    const q = creatorQuery.trim().toLowerCase();
    return data.topCreators
      .filter((c) => !q || c.creatorName.toLowerCase().includes(q))
      .sort(CREATOR_SORTS[creatorSort]);
  }, [data, creatorQuery, creatorSort]);

  if (isPending || !data) {
    return <AnalyticsSkeleton />;
  }

  const { totals } = data;
  const visibleCampaigns = filteredCampaigns.slice(0, campaignLimit);
  const visibleCreators = filteredCreators.slice(0, creatorLimit);

  return (
    <div className="space-y-6">
      {viewCreatorId && <CreatorProfileModal creatorId={viewCreatorId} onClose={() => setViewCreatorId(null)} />}

      <header>
        <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-muted sm:text-base">
          Performance and earnings across all your campaigns.
        </p>
      </header>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Megaphone} label="Campaigns" value={String(totals.totalCampaigns)} />
        <StatTile icon={Users} label="Clippers" value={String(totals.totalClippers)} />
        <StatTile icon={Eye} label="Total Views" value={formatViews(totals.totalViews)} />
        <StatTile icon={IndianRupee} label="Total Earnings" value={formatInr(totals.totalEarningsPaise)} accent />
      </div>

      {/* Secondary engagement strip */}
      <Card className="flex divide-x divide-border p-3">
        <EngagementStat icon={Heart} label="Total Likes" value={formatViews(totals.totalLikes)} />
        <EngagementStat icon={MessageCircle} label="Total Comments" value={formatViews(totals.totalComments)} />
        <EngagementStat icon={Share2} label="Total Shares" value={formatViews(totals.totalShares)} />
      </Card>

      {/* Tabs — keeps Top Performers one click away no matter how long the campaign list is */}
      <div className="flex border-b border-border">
        {([
          { key: "campaigns" as const, label: "Campaigns", count: data.campaigns.length },
          { key: "performers" as const, label: "Top Performers", count: data.topCreators.length },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors",
              tab === key ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {label}
            <span className="rounded-full bg-surface-variant px-1.5 py-0.5 text-[10px] font-bold text-muted">{count}</span>
            {tab === key && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>

      {tab === "campaigns" ? (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={campaignQuery} onChange={(v) => { setCampaignQuery(v); setCampaignLimit(PAGE_SIZE); }} placeholder="Search campaigns…" />
            {campaignStatuses.length > 1 && (
              <select
                value={campaignStatus}
                onChange={(e) => { setCampaignStatus(e.target.value); setCampaignLimit(PAGE_SIZE); }}
                className="h-10 shrink-0 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                <option value="all">All statuses</option>
                {campaignStatuses.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                ))}
              </select>
            )}
            <SortSelect
              value={campaignSort}
              onChange={setCampaignSort}
              options={[
                { value: "views", label: "views" },
                { value: "earnings", label: "earnings" },
                { value: "clippers", label: "clippers" },
              ]}
            />
          </div>

          {filteredCampaigns.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              message={data.campaigns.length === 0 ? "No campaign performance data yet." : "No campaigns match your search."}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleCampaigns.map((c) => (
                  <CampaignCard key={c.id} campaign={c} onClick={() => navigate(`${campaignBase}/${c.id}`)} />
                ))}
              </div>
              {visibleCampaigns.length < filteredCampaigns.length && (
                <div className="flex justify-center pt-1">
                  <Button variant="outline" size="sm" onClick={() => setCampaignLimit((n) => n + PAGE_SIZE)}>
                    Show more ({filteredCampaigns.length - visibleCampaigns.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={creatorQuery} onChange={(v) => { setCreatorQuery(v); setCreatorLimit(PAGE_SIZE); }} placeholder="Search creators…" />
            <SortSelect
              value={creatorSort}
              onChange={setCreatorSort}
              options={[
                { value: "views", label: "views" },
                { value: "earnings", label: "earnings" },
                { value: "likes", label: "likes" },
                { value: "comments", label: "comments" },
                { value: "shares", label: "shares" },
              ]}
            />
          </div>

          {filteredCreators.length === 0 ? (
            <EmptyState
              icon={Trophy}
              message={data.topCreators.length === 0 ? "No performance data yet." : "No creators match your search."}
            />
          ) : (
            <>
              <div className="space-y-2.5">
                {visibleCreators.map((c, i) => (
                  <CreatorRow
                    key={c.creatorId}
                    creator={c}
                    rank={i + 1}
                    onView={() => setViewCreatorId(c.creatorId)}
                  />
                ))}
              </div>
              {visibleCreators.length < filteredCreators.length && (
                <div className="flex justify-center pt-1">
                  <Button variant="outline" size="sm" onClick={() => setCreatorLimit((n) => n + PAGE_SIZE)}>
                    Show more ({filteredCreators.length - visibleCreators.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
