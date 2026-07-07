import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Clock,
  Database,
  HelpCircle,
  ShieldCheck,
  UserMinus,
  Mail,
} from "lucide-react";

const LAST_UPDATED = "July 7, 2026";

const sections = [
  {
    icon: UserMinus,
    title: "1. How to Delete Your Account",
    body: "You can request account deletion directly from the Halchal app: go to Profile → Settings → Delete Account, and confirm your request. Alternatively, you may email us at support@halchal.in with the subject line 'Account Deletion Request' from your registered email address. We will process your request within 7 business days.",
  },
  {
    icon: Trash2,
    title: "2. What Gets Deleted",
    body: "Upon account deletion, we permanently remove your profile information, linked social media handles, submitted content, campaign history, and all personal preferences stored on our platform. Your login credentials are also erased and cannot be recovered after deletion is complete.",
  },
  {
    icon: Database,
    title: "3. Data We Retain",
    body: "Certain data may be retained after deletion to comply with legal and regulatory obligations. This includes transaction records and payment history (retained for 7 years as required under Indian financial regulations), anonymised analytics that cannot be linked back to you, and records necessary to resolve disputes or enforce our Terms and Conditions.",
  },
  {
    icon: Clock,
    title: "4. Deletion Timeline",
    body: "Once you confirm your deletion request, your account is deactivated immediately and will no longer be visible to brands or other users. Permanent deletion of all personal data from our systems and backups is completed within 30 days of the confirmed request.",
  },
  {
    icon: AlertTriangle,
    title: "5. Before You Delete — Important Notices",
    body: "Ensure any pending campaign deliverables are resolved and all outstanding payments have been settled before requesting deletion. Active campaign participations will be cancelled upon deletion. Any unpaid earnings will be forfeited if the deletion is confirmed before payment is processed. This action is irreversible.",
  },
  {
    icon: ShieldCheck,
    title: "6. Third-Party Data",
    body: "If you connected third-party social media accounts to Halchal for analytics, deleting your Halchal account will revoke our access to those accounts. However, data already shared with brand partners as part of active campaigns may remain in their possession per the agreed campaign terms.",
  },
  {
    icon: HelpCircle,
    title: "7. Account Recovery",
    body: "Account deletion is permanent and cannot be undone. If you change your mind, you must create a new account. Past campaign history, earnings records, and ratings will not be restored to the new account. We strongly recommend deactivating your account temporarily if you are unsure.",
  },
  {
    icon: Mail,
    title: "8. Contact Us",
    body: "If you have trouble deleting your account or want to understand what data we hold before proceeding, please contact us at support@halchal.in or write to us at: Mutiny Talent Pvt. Ltd., Bengaluru, Karnataka, India. We are committed to honouring your data rights promptly.",
  },
];

export function DeleteAccountPage() {
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
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
          <Trash2 className="h-3.5 w-3.5" />
          Account Management
        </div>
        <h1 className="mb-2 text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Delete Account
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
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                  <section.icon className="h-5 w-5 text-red-500" />
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
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-700 transition-colors"
        aria-label="Scroll to top"
      >
        <ArrowLeft className="h-4 w-4 rotate-90" />
      </button>
    </div>
  );
}
