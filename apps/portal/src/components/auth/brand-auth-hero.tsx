import { ShieldCheck, TrendingUp, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AuthHeroShell } from "@/components/auth/auth-hero-shell";
import {
  AUTH_HERO_BODY_BLOCK_CLASS,
  AUTH_HERO_SECTION_GAP_CLASS,
  authHeroBodyClass,
  authHeroFeatureBodyClass,
  authHeroFeatureTitleClass,
  authHeroFooterClass,
  authHeroTitleClass,
} from "@/components/auth/auth-hero-panel";

const SIGNUP_FEATURES: {
  icon: LucideIcon;
  title: string;
  description: string;
}[] = [
  {
    icon: Wallet,
    title: "Performance-Driven CPV",
    description:
      "Pay only for views that matter. Our Cost-Per-View model ensures your marketing budget is spent with maximum efficiency.",
  },
  {
    icon: ShieldCheck,
    title: "Seamless Review Workflow",
    description:
      "Full control over every creative asset. Approve, request edits, or reject submissions through a unified brand dashboard.",
  },
  {
    icon: Users,
    title: "10k+ Verified Indian Creators",
    description:
      "Access an elite network of storytellers across niche categories, from tech enthusiasts to lifestyle influencers.",
  },
];

const AVATAR_COLORS = [
  "bg-violet-400",
  "bg-emerald-400",
  "bg-amber-400",
] as const;

export type BrandAuthHeroVariant = "login" | "signup";

function HeroCopyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className={AUTH_HERO_BODY_BLOCK_CLASS}>{children}</div>
  );
}

export function BrandAuthHero({ variant }: { variant: BrandAuthHeroVariant }) {
  if (variant === "signup") {
    return (
      <AuthHeroShell
        footer={
          <p className={authHeroFooterClass}>
            Trusted by 500+ Indian Enterprise Brands
          </p>
        }
      >
        <HeroCopyBlock>
          <h1 className={authHeroTitleClass}>
            Scale your brand with India&apos;s top creators.
          </h1>
          <ul className={`${AUTH_HERO_SECTION_GAP_CLASS} space-y-5 xl:space-y-6`}>
            {SIGNUP_FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur-sm">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className={authHeroFeatureTitleClass}>{title}</p>
                  <p className={authHeroFeatureBodyClass}>{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </HeroCopyBlock>
      </AuthHeroShell>
    );
  }

  return (
    <AuthHeroShell
      footer={
        <p className={authHeroFooterClass}>
          Trusted by 500+ Indian Enterprise Brands
        </p>
      }
    >
      <HeroCopyBlock>
        <div className="shrink-0">
          <h1 className={authHeroTitleClass}>
            Run campaigns.
            <br />
            <span className="text-violet-200">Get authentic clips.</span>
          </h1>
          <p className={authHeroBodyClass}>
            Scale your creator marketing across India with performance-based
            orchestration. Connect with verified influencers and track every
            conversion in real-time.
          </p>
        </div>

        <div className="mt-auto mb-5 w-full pt-6 pb-2 lg:mb-7 lg:pt-8">
          <div className="brand-login-glass w-full rounded-xl p-3.5 shadow-2xl xl:p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex -space-x-2">
                {AVATAR_COLORS.map((color) => (
                  <div
                    key={color}
                    className={`size-7 rounded-full border-2 border-white ${color}`}
                    aria-hidden
                  />
                ))}
              </div>
              <div className="flex items-center gap-0.5 rounded-full bg-emerald-300 px-2 py-0.5 text-[9px] font-bold text-emerald-950">
                <TrendingUp className="size-2.5" aria-hidden />
                +124%
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/40">
                <div className="h-full w-[75%] rounded-full bg-primary" />
              </div>
              <div className="flex justify-between gap-2 text-[10px] font-semibold leading-tight text-slate-600">
                <span>Campaign Fulfillment</span>
                <span className="text-right">75.4L / 1Cr</span>
              </div>
            </div>
          </div>
        </div>
      </HeroCopyBlock>
    </AuthHeroShell>
  );
}
