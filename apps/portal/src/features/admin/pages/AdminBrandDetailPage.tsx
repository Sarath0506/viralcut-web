import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { DetailPageSkeleton } from "@/components/ui/page-skeletons";
import { useToast } from "@/components/ui/toaster";
import { formatPlatformList } from "@/features/campaigns/lib/platform-labels";
import { adminApi, portalApi, type Campaign } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

/* ── helpers ── */
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatBudget(paise: number) {
  const rupees = paise / 100;
  if (rupees >= 100_000) return `₹${(rupees / 100_000).toFixed(1)}L`;
  if (rupees >= 1_000)   return `₹${(rupees / 1_000).toFixed(1)}K`;
  return `₹${rupees}`;
}

const STATUS_STYLE: Record<string, string> = {
  live:   "bg-emerald-500 text-white",
  draft:  "bg-zinc-600 text-white",
  paused: "bg-orange-500 text-white",
  closed: "bg-red-500 text-white",
};

/* ── Campaign card ── */
function CampaignCard({ c, onClick }: { c: Campaign & { submissionCount?: number }; onClick: () => void }) {
  const statusStyle = STATUS_STYLE[c.status] ?? STATUS_STYLE.draft;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      {/* Cover image */}
      <div className="relative h-44 w-full overflow-hidden bg-surface-variant">
        {c.coverImageUrl ? (
          <img src={c.coverImageUrl} alt={c.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
            <svg className="h-12 w-12 text-primary/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.069A1 1 0 0121 8.847v6.306a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
        )}

        {/* Top overlay */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          {/* Platform chips */}
          <div className="flex flex-wrap gap-1">
            {(c.platforms ?? []).map((p) => (
              <span key={p} className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {p}
              </span>
            ))}
          </div>
          {/* Status */}
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle}`}>
            {c.status}
          </span>
        </div>

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/70 to-transparent" />
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="truncate text-sm font-bold leading-tight">{c.title}</h3>
        <p className="mt-0.5 text-xs text-muted">{formatPlatformList(c.platforms ?? [])}</p>

        {/* Divider */}
        <div className="my-3 border-t border-border/50" />

        {/* Bottom stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{c.submissionCount ?? 0} submissions</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-primary">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            <span>{formatBudget(c.budgetPaise)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Assign Team Member Modal ── */
function AssignTeamModal({ brandId, onClose }: { brandId: string; onClose: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isPending } = useQuery({
    queryKey: ["admin-team-members"],
    queryFn: () => adminApi.listTeamMembers(getToken()!),
    enabled: Boolean(getToken()),
  });

  const assign = useMutation({
    mutationFn: (staffId: string) => adminApi.assignBrand(getToken()!, staffId, brandId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] }),
    onError: () => toast("Failed to assign member", "error"),
  });

  const remove = useMutation({
    mutationFn: (staffId: string) => adminApi.removeBrand(getToken()!, staffId, brandId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] }),
    onError: () => toast("Failed to remove member", "error"),
  });

  const isPending2 = assign.isPending || remove.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-lg">Assign Team Member</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isPending && <p className="px-6 py-8 text-center text-sm text-muted">Loading…</p>}
          {!isPending && members.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-muted">No team members yet. Create one from your profile page.</p>
          )}
          {members.map((member) => {
            const isAssigned = member.assignedBrands.some((b) => b.id === brandId);
            return (
              <div key={member.id} className="flex items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-black text-primary">
                  {(member.name || member.email).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{member.name}</p>
                  <p className="truncate text-xs text-muted">{member.email}</p>
                </div>
                <button
                  disabled={isPending2}
                  onClick={() => isAssigned ? remove.mutate(member.id) : assign.mutate(member.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    isAssigned
                      ? "bg-emerald-500/15 text-emerald-500 hover:bg-red-500/15 hover:text-red-400"
                      : "bg-surface-variant text-muted hover:bg-primary/15 hover:text-primary"
                  }`}
                >
                  {isAssigned ? "Assigned ✓" : "Assign"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border px-5 py-3">
          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export function AdminBrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"campaigns" | "about">("campaigns");
  const [showAssign, setShowAssign] = useState(false);

  const { data: brand, isPending } = useQuery({
    queryKey: ["admin-brand", id],
    queryFn: () => adminApi.brand(getToken()!, id!),
    enabled: Boolean(getToken() && id),
  });

  const createCampaign = useMutation({
    mutationFn: () =>
      portalApi.campaigns.create(getToken()!, {
        brandProfileId: id,
        title: "New Campaign",
        status: "draft",
        platforms: ["instagram_reel"],
        ratePer1kPaise: 5000,
        maxPayoutPaise: 5000000,
        budgetPaise: 10000000,
        wizardStep: "basics",
      }),
    onSuccess: (campaign) => {
      navigate(`/admin/campaigns/${campaign.id}/edit`);
    },
    onError: () => toast("Failed to create campaign", "error"),
  });

  if (isPending) return <DetailPageSkeleton />;
  if (!brand) return null;

  const brandId = id!;

  const liveCampaigns = brand.campaigns.filter((c) => c.status === "live").length;

  return (
    <div className="space-y-6">
      {showAssign && <AssignTeamModal brandId={brandId} onClose={() => setShowAssign(false)} />}

      <BackButton to="/admin/brands" label="All Brands" />

      {/* Brand hero */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {/* Banner */}
        <div className="h-24 w-full bg-linear-to-r from-primary/20 via-primary/10 to-transparent" />

        <div className="px-6 pb-6">
          {/* Avatar overlapping banner */}
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <div className="ring-4 ring-surface rounded-xl overflow-hidden">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.companyName} className="h-20 w-20 object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center bg-primary/15 text-2xl font-black text-primary">
                  {initials(brand.companyName)}
                </div>
              )}
            </div>

            {/* Stats pills + Assign button */}
            <div className="flex items-end gap-3 pb-1">
              <div className="rounded-xl border border-border bg-surface-variant px-4 py-2 text-center">
                <p className="text-xl font-black text-primary">{brand.campaigns.length}</p>
                <p className="text-[10px] text-muted">Total</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-center">
                <p className="text-xl font-black text-emerald-400">{liveCampaigns}</p>
                <p className="text-[10px] text-muted">Live</p>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowAssign(true)}>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Assign Team
              </Button>
            </div>
          </div>

          <h1 className="text-xl font-bold">{brand.companyName}</h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.75L2.25 6.75" />
              </svg>
              {brand.email ?? "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Joined {new Date(brand.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + Create button */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          {(["campaigns", "about"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-5 py-3 text-sm font-medium capitalize transition-colors ${
                tab === t ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {t}
              {tab === t && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        {tab === "campaigns" && (
          <Button
            size="sm"
            className="mb-1 gap-1.5"
            onClick={() => createCampaign.mutate()}
            disabled={createCampaign.isPending}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {createCampaign.isPending ? "Creating…" : "Create Campaign"}
          </Button>
        )}
      </div>

      {/* Campaigns tab */}
      {tab === "campaigns" && (
        brand.campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
            <p className="font-medium">No campaigns yet</p>
            <p className="mt-1 text-sm text-muted">Create the first campaign for this brand.</p>
            <Button
              className="mt-4 gap-2"
              onClick={() => createCampaign.mutate()}
              disabled={createCampaign.isPending}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {createCampaign.isPending ? "Creating…" : "Create Campaign"}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brand.campaigns.map((c) => (
              <CampaignCard
                key={c.id}
                c={c as Campaign & { submissionCount?: number }}
                onClick={() => navigate(`/admin/campaigns/${c.id}`)}
              />
            ))}
          </div>
        )
      )}

      {/* About tab */}
      {tab === "about" && (
        <div className="space-y-4">
          {/* Company details */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <p className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Company</p>
            {[
              { label: "Company name", value: brand.companyName },
              { label: "Company email", value: brand.companyEmail ?? brand.email ?? "—" },
              { label: "Joined", value: new Date(brand.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) },
              { label: "Total campaigns", value: String(brand.campaigns.length) },
              { label: "Live campaigns", value: String(liveCampaigns) },
            ].map(({ label, value }, i, arr) => (
              <div key={label} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-border/50" : "pb-4"}`}>
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>

          {/* POC details */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <p className="px-5 pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted">Point of Contact</p>
            {[
              { label: "Name", value: brand.pocName ?? "—" },
              { label: "Phone", value: brand.pocPhone ?? "—" },
              { label: "Email", value: brand.pocEmail ?? "—" },
            ].map(({ label, value }, i, arr) => (
              <div key={label} className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-border/50" : "pb-4"}`}>
                <span className="text-sm text-muted">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
