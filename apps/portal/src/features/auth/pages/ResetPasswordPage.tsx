import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { PortalToggle } from "@/components/auth/portal-toggle";
import {
  authFooterLinkClass,
  authFormClass,
  authMutedFooterClass,
  authPrimaryButtonClass,
} from "@/components/auth/auth-styles";
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
import { cn } from "@/lib/utils";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPortal = parsePortal(searchParams.get("portal"));
  const { toast } = useToast();
  const token = searchParams.get("token") ?? "";
  const [portal, setPortal] = useState<Portal>(initialPortal);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const isAgency = portal === "agency";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      toast("Reset link is invalid or missing.", "error");
      return;
    }
    if (password !== confirm) {
      toast("Passwords do not match.", "error");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(portal, { token, password });
      toast("Password updated. You can log in now.");
      navigate(`/login?portal=${portal}`, { replace: true });
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Reset failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout heroVariant="login" footer={<AuthTrustBadges />}>
      {!token ? (
        <>
          <AuthMobileBrandMark />

          <AuthPageHeader
            title="Invalid reset link"
            description="This link may have expired. Request a new password reset email."
          />

          <Link
            to={`/forgot-password?portal=${portal}`}
            className={cn(
              authPrimaryButtonClass,
              "inline-flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90",
            )}
          >
            Request reset link
          </Link>

          <p className={authMutedFooterClass}>
            <Link
              to={`/login?portal=${portal}`}
              className={`inline-flex items-center justify-center gap-1.5 ${authFooterLinkClass}`}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to sign in
            </Link>
          </p>
        </>
      ) : (
        <>
          <AuthMobileBrandMark />

          <AuthPageHeader
            title="Set new password"
            description={
              isAgency
                ? "Choose a new password for your agency account."
                : "Choose a new password for your brand account."
            }
          />

          <PortalToggle value={portal} onChange={setPortal} className="mb-4" />

          <form onSubmit={onSubmit} className={authFormClass}>
            <AuthPasswordField
              id="password"
              label="New password"
              autoComplete="new-password"
              value={password}
              onChange={setPassword}
            />

            <AuthPasswordField
              id="confirm"
              label="Confirm password"
              autoComplete="new-password"
              value={confirm}
              onChange={setConfirm}
            />

            <AuthPrimaryButton loading={loading} loadingText="Saving…">
              Update password
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
        </>
      )}
    </AuthSplitLayout>
  );
}
