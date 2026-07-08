import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

import { easeOut } from "./motion-primitives";

const statuses = [
  { label: "Draft submitted", tone: "text-amber-300 bg-amber-400/10 border-amber-400/25" },
  { label: "Approved for posting", tone: "text-sky-300 bg-sky-400/10 border-sky-400/25" },
  { label: "Live — tracking views", tone: "text-primary bg-primary/10 border-primary/25" },
  { label: "Views verified · paid", tone: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25" },
];

const waveHeights = [0.4, 0.7, 1, 0.55, 0.85, 0.3, 0.6, 0.45];

export function VerificationPanel() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [views, setViews] = useState(48200);

  useEffect(() => {
    const t = setInterval(() => setStatusIndex((i) => (i + 1) % statuses.length), 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setViews((v) => v + Math.floor(80 + Math.random() * 260)), 900);
    return () => clearInterval(t);
  }, []);

  const status = statuses[statusIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: 2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
      className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_20px_80px_rgba(99,14,212,0.25)] backdrop-blur-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Live campaign
        </span>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400">
          <Instagram className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Reel · Diwali Launch</p>
          <p className="text-xs text-white/40">Mumbai · Hindi</p>
        </div>
      </div>

      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Verified views
      </p>
      <motion.p
        key={Math.floor(views / 100)}
        initial={{ opacity: 0.3, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display mb-5 text-4xl font-black tabular-nums text-white"
      >
        {views.toLocaleString("en-IN")}
      </motion.p>

      <motion.span
        key={status.label}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.tone}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status.label}
      </motion.span>

      <div className="mt-6 flex h-8 items-end gap-1">
        {waveHeights.map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 origin-bottom rounded-full bg-primary/50"
            style={{ height: `${h * 100}%` }}
            animate={{ scaleY: [1, 0.35, 1] }}
            transition={{
              duration: 1 + i * 0.12,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
