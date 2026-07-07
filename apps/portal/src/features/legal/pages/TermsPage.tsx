import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CreditCard,
  FileText,
  Scale,
  UserCog,
  AlertTriangle,
  Ban,
  RefreshCw,
  Mail,
} from "lucide-react";

const LAST_UPDATED = "July 7, 2026";

const sections = [
  {
    icon: FileText,
    title: "1. Acceptance of Terms",
    body: "By accessing and using Halchal and the Halchal creator app, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services. These terms establish a legally binding agreement between you and Mutiny Talent Pvt. Ltd.",
  },
  {
    icon: Briefcase,
    title: "2. Description of Service",
    body: "Mutiny Talent Pvt. Ltd. provides a B2B SaaS platform (Halchal) connecting brands with creators, and a creator-facing mobile app for managing campaigns, content submissions, and payments. We act as the technical intermediary to facilitate these connections securely.",
  },
  {
    icon: UserCog,
    title: "3. User Accounts",
    body: "You are responsible for safeguarding your account credentials. You must notify us immediately of any unauthorized use of your account. Brands and creators are subject to platform verification, and we reserve the right to suspend accounts that violate our community standards.",
  },
  {
    icon: CreditCard,
    title: "4. Payments and Escrow",
    body: "All campaign payments are processed through our secure performance-based payment system. Funds are calculated based on verified views and released to creators upon satisfactory completion of agreed-upon deliverables, as approved by the brand. Halchal charges a platform fee on each successful transaction.",
  },
  {
    icon: Scale,
    title: "5. Intellectual Property",
    body: "Content created during campaigns is subject to the usage rights negotiated within the platform's campaign agreement. Halchal retains all rights to the platform infrastructure, code, algorithms, and design. Creators retain ownership of their original content unless otherwise agreed in writing with the brand.",
  },
  {
    icon: AlertTriangle,
    title: "6. Prohibited Activities",
    body: "You may not use our platform to engage in fraudulent activity, manipulate view counts, submit plagiarised content, impersonate other users, or violate any applicable Indian laws. Any such violation will result in immediate account suspension and may be reported to relevant authorities.",
  },
  {
    icon: Ban,
    title: "7. Limitation of Liability",
    body: "Mutiny Talent Pvt. Ltd. shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform. Our total liability to you for any claims arising under these terms shall not exceed the amount you paid to us in the three months preceding the claim.",
  },
  {
    icon: RefreshCw,
    title: "8. Termination",
    body: "We may suspend or terminate your account at our sole discretion if you breach these terms or engage in conduct that we determine is harmful to the platform or its users. Upon termination, your right to use the platform ceases immediately. Any outstanding payments due to creators will be settled within 30 days.",
  },
  {
    icon: FileText,
    title: "9. Governing Law",
    body: "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.",
  },
  {
    icon: Mail,
    title: "10. Contact Us",
    body: "If you have any questions about these Terms and Conditions, please contact us at legal@halchal.in or write to us at: Mutiny Talent Pvt. Ltd., Bengaluru, Karnataka, India.",
  },
];

export function TermsPage() {
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
          <Scale className="h-3.5 w-3.5" />
          Legal Documentation
        </div>
        <h1 className="mb-2 text-5xl font-black text-gray-900 tracking-tight leading-tight">
          Terms and Conditions
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
