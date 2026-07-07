import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  IndianRupee,
  Instagram,
  Menu,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Video,
  X,
  Youtube,
  Zap,
} from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { dashboardPathForRole } from "@/lib/portal";

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#07091A]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm select-none">
            H
          </span>
          <span className="font-display text-lg font-bold text-white">
            Halchal
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
            How it works
          </a>
          <a href="#for-creators" className="text-sm text-white/60 hover:text-white transition-colors">
            For creators
          </a>
          <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">
            Pricing
          </a>
        </nav>

        {/* CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {auth ? (
            <Link
              to={dashboardPathForRole(auth.user.role)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Get started free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-[#07091A] px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white" onClick={() => setOpen(false)}>
              How it works
            </a>
            <a href="#for-creators" className="text-sm text-white/60 hover:text-white" onClick={() => setOpen(false)}>
              For creators
            </a>
            <a href="#pricing" className="text-sm text-white/60 hover:text-white" onClick={() => setOpen(false)}>
              Pricing
            </a>
            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
              {auth ? (
                <Link
                  to={dashboardPathForRole(auth.user.role)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-center text-sm text-white/70">Sign in</Link>
                  <Link
                    to="/signup"
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Get started free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#07091A] px-6 pt-24 pb-16 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-0 top-0 h-75 w-75 rounded-full bg-violet-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-62.5 w-75 rounded-full bg-purple-600/10 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          India's creator monetisation platform
        </div>

        {/* Headline */}
        <h1 className="font-display mb-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Turn real creators into{" "}
          <span className="bg-linear-to-r from-primary via-violet-400 to-purple-300 bg-clip-text text-transparent">
            your growth engine
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-base text-white/60 sm:text-lg leading-relaxed">
          Halchal connects brands with Indian content creators. Launch performance campaigns, pay only for verified views, and scale your brand across Instagram, YouTube and beyond.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/signup"
            className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(99,14,212,0.5)] transition hover:bg-primary/90 hover:shadow-[0_0_60px_rgba(99,14,212,0.6)]"
          >
            Start your first campaign
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
          >
            <Play className="h-4 w-4" />
            See how it works
          </a>
        </div>

        {/* Social proof strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary" />
            No monthly fees
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary" />
            Pay only for verified views
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-primary" />
            Real creators, real audiences
          </span>
        </div>
      </div>

      {/* Scroll indicator */}
      <a href="#stats" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors animate-bounce">
        <ChevronDown className="h-6 w-6" />
      </a>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const stats = [
  { value: "10K+", label: "Active creators" },
  { value: "500+", label: "Campaigns launched" },
  { value: "₹2Cr+", label: "Paid to creators" },
  { value: "50M+", label: "Views delivered" },
];

function Stats() {
  return (
    <section id="stats" className="bg-[#07091A] py-16 border-y border-white/10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-black text-white sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────

const steps = [
  {
    number: "01",
    icon: Target,
    title: "Create your campaign",
    description:
      "Set your brief, creative rules, budget, and target audience. Choose your platform — Instagram Reels, YouTube Shorts, or more.",
  },
  {
    number: "02",
    icon: Users,
    title: "Creators apply & create",
    description:
      "Verified creators discover your campaign, create authentic content, and submit drafts for your review before going live.",
  },
  {
    number: "03",
    icon: IndianRupee,
    title: "Pay for real views",
    description:
      "Once content goes live, we track verified views. You pay a flat rate per 1,000 views — no upfront commitments, no guesswork.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-[#0A0E1F] py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Simple process
          </p>
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
            Launch a campaign in minutes
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            No agency middlemen. No long negotiations. Just set your campaign up and let creators do what they do best.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-8 hidden h-px bg-linear-to-r from-transparent via-primary/30 to-transparent sm:block" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/3 p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-display text-4xl font-black text-white/6">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="mb-2 text-base font-bold text-white">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: BarChart3,
    title: "Real-time analytics",
    description: "Track views, engagement, and ROI live on your dashboard as creators go live.",
  },
  {
    icon: Zap,
    title: "Instant creator discovery",
    description: "Browse thousands of verified creators filtered by niche, platform, and follower count.",
  },
  {
    icon: TrendingUp,
    title: "Performance-based pricing",
    description: "Pay a flat rate per 1,000 verified views. Your budget always goes further.",
  },
  {
    icon: Video,
    title: "Content review & approval",
    description: "Review every piece of content before it goes live. Full control over your brand.",
  },
  {
    icon: Star,
    title: "Verified creators only",
    description: "Every creator is KYC-verified and authenticated. No bots, no fake engagement.",
  },
  {
    icon: Target,
    title: "Geo & niche targeting",
    description: "Target creators by city, state, or all of India. Reach exactly the audience you want.",
  },
];

function Features() {
  return (
    <section className="bg-[#07091A] py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Everything you need
          </p>
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
            Built for brands that want results
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-white/10 bg-white/3 p-6 transition hover:border-primary/30 hover:bg-white/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-primary/20">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-bold text-white">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── For creators ─────────────────────────────────────────────────────────────

function ForCreators() {
  return (
    <section id="for-creators" className="bg-[#0A0E1F] py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-8 sm:p-12">
          <div className="grid gap-12 sm:grid-cols-2 sm:items-center">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
                For creators
              </p>
              <h2 className="font-display mb-5 text-3xl font-black text-white sm:text-4xl">
                Get paid for content you already create
              </h2>
              <p className="mb-8 text-white/60 leading-relaxed">
                Join campaigns from top Indian brands. Submit your content, get it approved, post it live, and earn money based on the views you generate.
              </p>

              <ul className="mb-8 space-y-3">
                {[
                  "Free to join — no subscription needed",
                  "Work with verified Indian brands",
                  "Earn per 1,000 views on Instagram & YouTube",
                  "Get paid directly to your bank account",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-[#07091A] transition hover:bg-white/90"
              >
                Join as a creator <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Platform badges */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: Instagram,
                  platform: "Instagram",
                  desc: "Reels, Stories & Posts",
                  color: "from-pink-500/20 to-orange-500/20",
                  border: "border-pink-500/20",
                  iconColor: "text-pink-400",
                },
                {
                  icon: Youtube,
                  platform: "YouTube",
                  desc: "Shorts & long-form videos",
                  color: "from-red-500/20 to-red-600/20",
                  border: "border-red-500/20",
                  iconColor: "text-red-400",
                },
              ].map((p) => (
                <div
                  key={p.platform}
                  className={`flex items-center gap-4 rounded-2xl border ${p.border} bg-linear-to-r ${p.color} p-5`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ${p.iconColor}`}>
                    <p.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{p.platform}</p>
                    <p className="text-sm text-white/50">{p.desc}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                      Active
                    </span>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl border border-white/10 bg-white/3 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <IndianRupee className="h-5 w-5 text-green-400" />
                  <span className="font-bold text-white">Transparent earnings</span>
                </div>
                <p className="text-sm text-white/50">
                  See exactly how much you'll earn per view before you accept a campaign. No hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <section id="pricing" className="bg-[#07091A] py-24 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Pricing
          </p>
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
            Pay only for what works
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            No retainers. No agencies. Just a simple performance-based model — you set the rate per 1,000 views and we do the rest.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              name: "Starter",
              price: "₹30",
              unit: "per 1K views",
              desc: "Best for first-time campaigns and product launches.",
              features: ["Up to 5 creators", "1 platform", "Basic analytics", "Email support"],
              cta: "Get started",
              highlighted: false,
            },
            {
              name: "Growth",
              price: "₹20",
              unit: "per 1K views",
              desc: "For brands scaling creator content consistently.",
              features: ["Up to 50 creators", "All platforms", "Advanced analytics", "Priority support", "Content review tools"],
              cta: "Start free trial",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              unit: "volume pricing",
              desc: "For large brands running always-on creator programs.",
              features: ["Unlimited creators", "Dedicated account manager", "White-label reports", "API access", "SLA guarantee"],
              cta: "Contact us",
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                plan.highlighted
                  ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(99,14,212,0.2)]"
                  : "border-white/10 bg-white/3"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <p className="text-sm font-semibold text-white/60">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-black text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-white/40">{plan.unit}</span>
                </div>
                <p className="mt-3 text-sm text-white/50">{plan.desc}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-white/70">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition ${
                  plan.highlighted
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCta() {
  return (
    <section className="bg-[#0A0E1F] py-24 px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-linear-to-b from-primary/20 to-primary/5 p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-[80px]" />
          </div>
          <div className="relative">
            <h2 className="font-display mb-5 text-3xl font-black text-white sm:text-4xl">
              Ready to grow with creators?
            </h2>
            <p className="mb-8 text-white/60">
              Join hundreds of Indian brands already using Halchal to reach millions of potential customers through authentic creator content.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-[0_0_30px_rgba(99,14,212,0.4)] transition hover:bg-primary/90"
              >
                Create your free account
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/login"
                className="text-sm text-white/50 hover:text-white transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07091A] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs select-none">
                H
              </span>
              <span className="font-display font-bold text-white">
                Halchal
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed">
              India's performance-based creator marketing platform.
            </p>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Platform</p>
            <ul className="space-y-3">
              {[
                { label: "For brands", to: "/signup" },
                { label: "For creators", to: "/signup" },
                { label: "Pricing", to: "#pricing" },
                { label: "Sign in", to: "/login" },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Company</p>
            <ul className="space-y-3">
              {["About", "Blog", "Careers", "Contact"].map((l) => (
                <li key={l}>
                  <span className="text-sm text-white/50 cursor-not-allowed">{l}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">Legal</p>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-white/50 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-white/50 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/delete-account" className="text-sm text-white/50 hover:text-white transition-colors">
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Mutiny Talent Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2">
              Privacy Policy
            </Link>
            <span className="text-white/20 text-xs">·</span>
            <Link to="/terms" className="text-xs text-white/40 hover:text-white transition-colors underline underline-offset-2">
              Terms of Service
            </Link>
            <span className="text-white/20 text-xs">·</span>
            <p className="text-xs text-white/30">Made with ❤️ in India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <ForCreators />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}
