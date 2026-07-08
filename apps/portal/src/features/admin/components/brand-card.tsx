import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Mail, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AdminBrand } from "@/lib/api";

const ACCENTS = [
  { bg: "bg-violet-500/15", banner: "from-violet-500/25", text: "text-violet-300" },
  { bg: "bg-blue-500/15", banner: "from-blue-500/25", text: "text-blue-300" },
  { bg: "bg-emerald-500/15", banner: "from-emerald-500/25", text: "text-emerald-300" },
  { bg: "bg-orange-500/15", banner: "from-orange-500/25", text: "text-orange-300" },
  { bg: "bg-pink-500/15", banner: "from-pink-500/25", text: "text-pink-300" },
  { bg: "bg-cyan-500/15", banner: "from-cyan-500/25", text: "text-cyan-300" },
];

function accentFor(name: string) {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function BrandCard({ brand }: { brand: AdminBrand }) {
  const navigate = useNavigate();
  const accent = accentFor(brand.companyName);
  const isActive = brand.campaignCount > 0;

  return (
    <div
      onClick={() => navigate(`/admin/brands/${brand.id}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-border bg-surface-variant/60 shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl"
    >
      <div className={cn("relative h-16 w-full bg-linear-to-br to-transparent", accent.banner)}>
        <div className="absolute -bottom-6 left-4">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-base font-black ring-4 ring-surface-variant",
              accent.bg,
              accent.text,
            )}
          >
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(brand.companyName)
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pt-8">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
              isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-surface-variant text-muted",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-400" : "bg-muted/50")} />
            {isActive ? "Active" : "New"}
          </span>
        </div>

        <p className="mt-2.5 truncate font-bold leading-tight">{brand.companyName}</p>
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
          <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {brand.email ?? "—"}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/60 pt-3">
          <div className="flex flex-1 items-end justify-between gap-2">
            <div>
              <p className="flex items-center gap-1 text-[10px] text-muted">
                <Zap className="h-3 w-3" />
                Campaigns
              </p>
              <p className={cn("mt-1 text-sm font-bold", accent.text)}>{brand.campaignCount}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[10px] text-muted">
                <Calendar className="h-3 w-3" />
                Joined
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {new Date(brand.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
              </p>
            </div>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
