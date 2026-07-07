import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Lock, Share2, Shield } from "lucide-react";

const LAST_UPDATED = "July 7, 2026";

const sections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    body: "We collect information you provide directly to us, such as when you create an account, update your profile, participate in campaigns, or request support. This includes your name, email, business details, payment info, and linked social media metrics required for campaign analytics.",
  },
  {
    icon: Share2,
    title: "2. How We Use Your Information",
    body: "We use the information we collect to operate and improve our platform, process your transactions, manage escrow payments, accurately connect brands with creators, and communicate with you about platform updates, negotiated rates, and active campaigns.",
  },
  {
    icon: Shield,
    title: "3. Sharing of Information",
    body: "Your public profile information (such as engagement rates and past work) may be shared with potential brand partners on the platform. We never sell your personal data to third parties. Information is only shared with trusted service providers who assist us in operating our platform securely.",
  },
  {
    icon: Lock,
    title: "4. Data Security",
    body: "We implement commercially reasonable technical, administrative, and physical security measures designed to protect your information from loss, theft, misuse, and unauthorized access. All payment data is tokenized and encrypted through our PCI-compliant payment partners.",
  },
  {
    icon: Eye,
    title: "5. Cookies & Tracking",
    body: "We use cookies and similar tracking technologies to collect and track information about your usage of our services, to improve your experience, and to understand how our platform is used. You may control cookie settings through your browser, but disabling cookies may limit certain features.",
  },
  {
    icon: Shield,
    title: "6. Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time. You may also request a copy of the data we hold about you or restrict how we process it. To exercise these rights, please contact us at privacy@halchal.in. We will respond within 30 days.",
  },
  {
    icon: Share2,
    title: "7. Data Retention",
    body: "We retain your personal data for as long as your account is active or as needed to provide our services. If you close your account, we will retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.",
  },
  {
    icon: Lock,
    title: "8. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the 'Last updated' date. We encourage you to review this policy periodically to stay informed about how we protect your information.",
  },
  {
    icon: Eye,
    title: "9. Contact Us",
    body: "If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@halchal.in or write to us at: Mutiny Talent Pvt. Ltd., Bengaluru, Karnataka, India.",
  },
];

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F0EFE9]">
      {/* Back link */}
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="mx-auto max-w-3xl px-6 pb-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          <Shield className="h-3.5 w-3.5" />
          Data Protection
        </div>
        <h1 className="mb-2 text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500">
          Last updated: <span className="font-semibold text-gray-700">{LAST_UPDATED}</span>
        </p>
      </div>

      {/* Card */}
      <div className="mx-auto max-w-3xl px-6 pb-20">
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {sections.map((section, i) => (
            <div
              key={section.title}
              className={`flex gap-6 p-8 ${
                i !== sections.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                  <section.icon className="h-5 w-5 text-amber-600" />
                </div>
              </div>

              {/* Content */}
              <div>
                <h2 className="mb-3 text-base font-bold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-sm leading-relaxed text-gray-600">
                  {section.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Mutiny Talent Pvt. Ltd. · All rights reserved
        </p>
      </div>

      {/* Scroll to top */}
      <ScrollTopButton />
    </div>
  );
}

function ScrollTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700 transition-colors"
      aria-label="Scroll to top"
    >
      <ArrowLeft className="h-4 w-4 rotate-90" />
    </button>
  );
}
