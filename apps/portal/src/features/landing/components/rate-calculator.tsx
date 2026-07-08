import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";

export function RateCalculator() {
  const [rate, setRate] = useState(25);
  const [views, setViews] = useState(250000);

  const creatorPayout = Math.round((views / 1000) * rate);
  const platformFee = Math.round(creatorPayout * 0.15);
  const totalCost = creatorPayout + platformFee;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <Calculator className="h-4 w-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Try it yourself</span>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-white/60">Your rate</span>
          <span className="font-bold text-white">
            ₹{rate} <span className="font-normal text-white/40">/ 1,000 views</span>
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={50}
          step={1}
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="range-input w-full"
        />
      </div>

      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-white/60">Verified views delivered</span>
          <span className="font-bold text-white">{Math.round(views / 1000)}K</span>
        </div>
        <input
          type="range"
          min={10000}
          max={1000000}
          step={10000}
          value={views}
          onChange={(e) => setViews(Number(e.target.value))}
          className="range-input w-full"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Clipper payout</span>
          <motion.span
            key={creatorPayout}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-bold text-white"
          >
            ₹{creatorPayout.toLocaleString("en-IN")}
          </motion.span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Platform fee (15%)</span>
          <span className="text-white/70">₹{platformFee.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm">
          <span className="font-semibold text-white">Total you pay</span>
          <motion.span
            key={totalCost}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-xl font-black text-primary"
          >
            ₹{totalCost.toLocaleString("en-IN")}
          </motion.span>
        </div>
      </div>
      <p className="mt-4 text-xs text-white/30">
        Illustrative. You set your exact rate, cap and budget per campaign.
      </p>
    </div>
  );
}
