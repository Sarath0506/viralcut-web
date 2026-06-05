import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { PortalToggle } from "@/components/auth/portal-toggle";
import {
  authFooterLinkClass,
  authFormClass,
  authMutedFooterClass,
} from "@/components/auth/auth-styles";
import { AuthTextField } from "@/components/auth/auth-text-field";
import {
  AuthMobileBrandMark,
  AuthPageHeader,
  AuthSplitLayout,
  AuthTrustBadges,
} from "@/components/layout/auth-split-layout";
import { useToast } from "@/components/ui/toaster";
import { authApi, ApiError } from "@/lib/api";
import type { Portal } from "@/lib/portal";
import { parsePortal } from "@/lib/portal";

export function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const initialPortal = parsePortal(searchParams.get("portal"));
  const { toast } = useToast();
  const [portal, setPortal] = useState<Portal>(initialPortal);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const isAgency = portal === "agency";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(portal, email);
      toast("If that email exists, we sent reset instructions.");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Request failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout heroVariant="login" footer={<AuthTrustBadges />}>
      <AuthMobileBrandMark />

      <AuthPageHeader
        title="Forgot password?"
        description={
          isAgency
            ? "Enter your agency work email and we'll send a link to reset your password."
            : "Enter your brand work email and we'll send a link to reset your password."
        }
      />

      <PortalToggle value={portal} onChange={setPortal} className="mb-4" />

      <form onSubmit={onSubmit} className={authFormClass}>
        <AuthTextField
          id="email"
          label="Work email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="name@company.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthPrimaryButton
          loading={loading}
          loadingText="Sending…"
          trailingIcon={<Mail className="size-4" />}
        >
          Send reset link
        </AuthPrimaryButton>
      </form>

      <p className={authMutedFooterClass}>
        <Link
          to={`/login?portal=${portal}`}
          className={`inline-flex items-center justify-center gap-1.5 ${authFooterLinkClass}`}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
