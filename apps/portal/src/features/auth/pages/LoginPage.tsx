import { ArrowRight, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { AuthDivider } from "@/components/auth/auth-divider";
import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { PortalToggle } from "@/components/auth/portal-toggle";
import {
  authFooterLinkClass,
  authFormClass,
  authMutedFooterClass,
} from "@/components/auth/auth-styles";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  AuthMobileBrandMark,
  AuthPageHeader,
  AuthSplitLayout,
  AuthTrustBadges,
} from "@/components/layout/auth-split-layout";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";
import { ApiError } from "@/lib/api";
import type { Portal } from "@/lib/portal";
import { parsePortal } from "@/lib/portal";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { useAuth } from "@/providers/auth-provider";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("next"));
  const initialPortal = parsePortal(searchParams.get("portal"));
  const { login } = useAuth();
  const { toast } = useToast();
  const [portal, setPortal] = useState<Portal>(initialPortal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password, portal, redirectTo);
      toast("Welcome back!");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Login failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  function onGoogleSignIn() {
    toast("Google sign-in is coming soon.", "error");
  }

  const isAgency = portal === "agency";

  return (
    <AuthSplitLayout heroVariant="login" footer={<AuthTrustBadges />}>
      <AuthMobileBrandMark />

      <AuthPageHeader
        title="Welcome Back"
        description={
          isAgency
            ? "Log in to manage client brand workspaces and campaigns."
            : "Log in to manage your creator campaigns and performance metrics."
        }
      />

      <PortalToggle value={portal} onChange={setPortal} className="mb-4" />

      <form onSubmit={onSubmit} className={authFormClass}>
        <AuthTextField
          id="email"
          label="Work Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="name@company.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <Label htmlFor="password">Password</Label>
            <Link
              to={`/forgot-password?portal=${portal}`}
              className="text-xs font-semibold text-primary hover:underline sm:text-sm"
            >
              Forgot password?
            </Link>
          </div>
          <AuthPasswordField
            id="password"
            label="Password"
            hideLabel
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
          />
        </div>

        <AuthPrimaryButton
          loading={loading}
          loadingText="Signing in…"
          className="mt-1"
          trailingIcon={<ArrowRight className="size-4" />}
        >
          {isAgency ? "Log in to Agency Portal" : "Log in to Brand Portal"}
        </AuthPrimaryButton>
      </form>

      <AuthDivider />

      <GoogleSignInButton onClick={onGoogleSignIn} />

      <p className={authMutedFooterClass}>
        {isAgency ? "New agency partner? " : "New brand partner? "}
        <Link
          to={`/signup?portal=${portal}`}
          className={authFooterLinkClass}
        >
          Sign up
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
