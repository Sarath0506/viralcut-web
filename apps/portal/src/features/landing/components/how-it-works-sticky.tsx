import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Check, IndianRupee, MapPinned, Play, X } from "lucide-react";

import { easeOut } from "./motion-primitives";

const steps = [
  {
    number: "01",
    title: "Brief it, region by region",
    description:
      "Target pan-India or drill into specific states and languages. Set your rate per 1,000 views, budget, and per-creator cap.",
  },
  {
    number: "02",
    title: "Review before it's live",
    description:
      "Clippers submit a draft first. You approve or reject it before anything goes public — full control, every time.",
  },
  {
    number: "03",
    title: "Pay for verified views only",
    description:
      "Once it's live, we independently scrape the real view count. You're billed per 1,000 verified views, up to your cap — never more.",
  },
];

function BriefMock() {
  const rows = [
    { icon: Play, label: "Platform", value: "Instagram Reel" },
    { icon: IndianRupee, label: "Rate", value: "₹28 / 1,000 views" },
    { icon: MapPinned, label: "Target", value: "Maharashtra · Marathi" },
  ];
  return (
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        New campaign brief
      </p>
      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/3 p-3.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <row.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] text-white/40">{row.label}</p>
              <p className="text-sm font-semibold text-white">{row.value}</p>
            </div>
            <Check className="ml-auto h-4 w-4 text-emerald-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewMock() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Draft submission
      </p>
      <div className="mb-4 flex h-36 items-center justify-center rounded-2xl bg-linear-to-br from-primary/30 via-violet-500/20 to-purple-600/20">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm">
          <Play className="h-4 w-4" fill="currentColor" />
        </span>
      </div>
      <p className="mb-4 text-sm text-white/60">
        Submitted by <span className="font-semibold text-white">@priya.creates</span>
      </p>
      <div className="flex gap-3">
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-xs font-semibold text-white/50">
          <X className="h-3.5 w-3.5" /> Reject
        </span>
        <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white">
          <Check className="h-3.5 w-3.5" /> Approve
        </span>
      </div>
    </div>
  );
}

function PayoutMock() {
  return (
    <div className="w-full max-w-sm rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 backdrop-blur-xl">
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Verified &amp; paid
      </p>
      <p className="mb-1 text-[11px] text-white/40">Views independently verified</p>
      <p className="font-display mb-5 text-4xl font-black tabular-nums text-white">
        312,480
      </p>
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
        <div>
          <p className="text-sm font-bold text-emerald-300">₹8,750 credited</p>
          <p className="text-xs text-white/40">To clipper wallet</p>
        </div>
      </div>
    </div>
  );
}

const mocks = [BriefMock, ReviewMock, PayoutMock];

export function HowItWorksSticky() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(steps.length - 1, Math.floor(v * steps.length));
    setActive(idx);
  });

  const ActiveMock = mocks[active];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="relative bg-[#0A0E1F]"
      style={{ height: `${steps.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center px-6 py-24">
        <div className="mx-auto grid w-full max-w-5xl gap-16 sm:grid-cols-2 sm:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
              Simple process
            </p>
            <h2 className="font-display mb-10 text-3xl font-black text-white sm:text-4xl">
              Launch a campaign in minutes
            </h2>

            <div className="space-y-3">
              {steps.map((step, i) => (
                <div
                  key={step.number}
                  className={`rounded-2xl border p-5 transition-all duration-500 ${
                    i === active
                      ? "border-primary/30 bg-primary/8 opacity-100"
                      : "border-transparent opacity-35"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        i === active
                          ? "bg-primary text-white"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {step.number}
                    </span>
                    <h3 className="text-base font-bold text-white">{step.title}</h3>
                  </div>
                  {i === active && (
                    <p className="ml-11 text-sm leading-relaxed text-white/50">
                      {step.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden h-96 items-center justify-center sm:flex">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.4, ease: easeOut }}
              >
                <ActiveMock />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* mobile fallback: static mock under the active step */}
          <div className="sm:hidden">
            <ActiveMock />
          </div>
        </div>
      </div>
    </section>
  );
}
