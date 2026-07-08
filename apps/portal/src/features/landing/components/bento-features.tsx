import { motion } from "framer-motion";
import { IndianRupee, MapPinned, ShieldCheck, Video, Wallet } from "lucide-react";

import { Reveal, StaggerGroup, StaggerItem } from "./motion-primitives";

const barHeights = [0.35, 0.55, 0.4, 0.75, 0.6, 0.9, 0.7, 1];

function VerifiedViewsTile() {
  return (
    <StaggerItem className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-7 transition hover:border-primary/30 hover:bg-white/5 lg:col-span-2 lg:row-span-2">
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-white">
          Independently verified views
        </h3>
        <p className="max-w-xs text-sm leading-relaxed text-white/50">
          View counts are pulled directly from the platform, not self-reported by
          creators. No inflated numbers, no guesswork.
        </p>
      </div>

      <div className="mt-8 flex h-24 items-end gap-2">
        {barHeights.map((h, i) => (
          <motion.span
            key={i}
            className="w-full origin-bottom rounded-t-md bg-linear-to-t from-primary/70 to-violet-400/40"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: h }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "100%" }}
          />
        ))}
      </div>
    </StaggerItem>
  );
}

const smallFeatures = [
  {
    icon: Video,
    title: "Draft review, every time",
    description: "Nothing goes live until you approve it.",
  },
  {
    icon: IndianRupee,
    title: "You set the rate",
    description: "No fixed plans — set your own rate and cap per campaign.",
  },
  {
    icon: MapPinned,
    title: "State & language targeting",
    description: "Go pan-India or target specific states and languages.",
  },
  {
    icon: Wallet,
    title: "Direct wallet payouts",
    description: "Earnings cash out straight to UPI or bank.",
  },
];

export function BentoFeatures() {
  return (
    <section className="bg-[#07091A] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
            Everything you need
          </p>
          <h2 className="font-display text-3xl font-black text-white sm:text-4xl">
            Built for brands that want results
          </h2>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[11rem]">
          <VerifiedViewsTile />
          {smallFeatures.map((f) => (
            <StaggerItem
              key={f.title}
              className="group flex flex-col justify-center rounded-3xl border border-white/10 bg-white/3 p-6 transition hover:border-primary/30 hover:bg-white/5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary transition group-hover:bg-primary/20">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="mb-1.5 text-sm font-bold text-white">{f.title}</h3>
              <p className="text-xs leading-relaxed text-white/50">{f.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
