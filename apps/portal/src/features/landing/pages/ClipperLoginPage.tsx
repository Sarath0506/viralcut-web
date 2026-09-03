import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Grid3x3,
  Instagram,
  LogOut,
  MessageCircle,
  Send,
  UserCircle,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Instagram,
    title: "Login with Instagram",
    description:
      "Connect your Instagram Business or Creator account through Meta's official login — Halchal never sees or stores your password.",
  },
  {
    number: "02",
    icon: UserCircle,
    title: "Profile",
    description:
      "Your username, follower count, and account details sync in automatically, so your Halchal profile always matches your real Instagram stats.",
  },
  {
    number: "03",
    icon: Grid3x3,
    title: "Feed",
    description:
      "Your recent posts and reels are pulled in, ready to submit as campaign clips without re-uploading anything.",
  },
  {
    number: "04",
    icon: MessageCircle,
    title: "Quick Reply",
    description:
      "Reply to comments and messages on your connected posts directly, without switching apps.",
  },
  {
    number: "05",
    icon: Send,
    title: "Post",
    description:
      "Publish new content straight to your Instagram account from inside Halchal.",
  },
  {
    number: "06",
    icon: BarChart3,
    title: "Insights",
    description:
      "See reach, impressions, and profile views for your connected account, so payouts are always backed by verified numbers.",
  },
  {
    number: "07",
    icon: LogOut,
    title: "Logout",
    description:
      "Disconnect your Instagram account at any time — Halchal stops accessing it immediately.",
  },
];

export function ClipperLoginPage() {
  return (
    <div className="min-h-screen bg-[#07091A]">
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <Instagram className="h-3.5 w-3.5" />
          Clipper Login
        </div>
        <h1 className="font-display mb-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
          Connect Instagram, step by step
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-white/50">
          Here's exactly what happens when a clipper logs in with Instagram on Halchal —
          and what each permission is used for.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-20">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`flex gap-6 p-8 ${
                i !== steps.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              <div className="shrink-0">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs font-bold tabular-nums text-white/30">
                    {step.number}
                  </span>
                  <h2 className="text-base font-bold text-white">{step.title}</h2>
                </div>
                <p className="text-sm leading-relaxed text-white/50">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/signup"
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Get started as a clipper
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Mutiny Talent Pvt. Ltd. · All rights reserved
        </p>
      </div>
    </div>
  );
}
