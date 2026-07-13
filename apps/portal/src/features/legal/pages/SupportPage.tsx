import { Link } from "react-router-dom";
import { ArrowLeft, HelpCircle, Mail, MessageCircle, FileText, AlertCircle, Users } from "lucide-react";

const LAST_UPDATED = "July 13, 2026";

const sections = [
  {
    icon: MessageCircle,
    title: "Contact Support",
    body: "For any questions, issues, or feedback, reach us at Support@halchalapp.com. Our team typically responds within 24–48 hours on business days. Please include as much detail as possible about your issue so we can help you faster.",
  },
  {
    icon: Users,
    title: "For Creators (Clippers)",
    body: "If you're having trouble with your account, payouts, campaign submissions, or video approvals, email us at Support@halchalapp.com with your registered email address and a description of the issue. We're here to make sure you get paid on time and have a smooth experience.",
  },
  {
    icon: FileText,
    title: "For Brands",
    body: "Having trouble creating a campaign, managing your billing, or understanding analytics? Reach out to Support@halchalapp.com. For urgent campaign issues, mention 'URGENT' in the subject line and we'll prioritize your request.",
  },
  {
    icon: AlertCircle,
    title: "Report a Bug or Issue",
    body: "If you've found a bug or something isn't working as expected in the app or portal, please email Support@halchalapp.com with the steps to reproduce the issue, your device/browser details, and any screenshots. Your reports help us improve the platform for everyone.",
  },
  {
    icon: HelpCircle,
    title: "Account & Billing",
    body: "For account-related help such as resetting your password, updating your profile, or resolving billing discrepancies, contact Support@halchalapp.com. Include your account email and a brief description of what you need help with.",
  },
  {
    icon: Mail,
    title: "General Enquiries",
    body: "For partnership opportunities, press enquiries, or general questions about Halchal, you can reach us at Support@halchalapp.com. We look forward to hearing from you. You can also write to us at: Mutiny Talent Pvt. Ltd., Hyderabad, Telangana, India.",
  },
];

export function SupportPage() {
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
          <HelpCircle className="h-3.5 w-3.5" />
          Help & Support
        </div>
        <h1 className="mb-2 text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Support
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
              <div className="shrink-0 mt-0.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100">
                  <section.icon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
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

        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Mutiny Talent Pvt. Ltd. · All rights reserved
        </p>
      </div>

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
