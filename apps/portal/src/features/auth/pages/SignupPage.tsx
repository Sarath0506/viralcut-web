import { Building2, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
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
import { ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function SignupPage() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    companyName: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast("Passwords do not match.", "error");
      return;
    }

    if (!acceptedTerms) {
      toast("Please accept the Terms of Service to continue.", "error");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        displayName: form.displayName.trim() || undefined,
        acceptTerms: true,
      });
      toast("Account created!");
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Sign up failed",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout heroVariant="signup" footer={<AuthTrustBadges />}>
      <AuthMobileBrandMark />

      <AuthPageHeader
        title="Sign up"
        description="Create your brand account to post campaigns and review creator clips."
      />

      <form onSubmit={onSubmit} className={authFormClass}>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthTextField
            id="company"
            label="Company name"
            icon={Building2}
            autoComplete="organization"
            placeholder="Your company"
            value={form.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
            required
          />

          <AuthTextField
            id="displayName"
            label="Display name"
            icon={User}
            autoComplete="name"
            placeholder="Your name"
            value={form.displayName}
            onChange={(e) => updateField("displayName", e.target.value)}
          />

          <AuthTextField
            id="email"
            label="Work email"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="name@company.in"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            wrapperClassName="sm:col-span-2"
            required
          />

          <AuthPasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            value={form.password}
            onChange={(password) => updateField("password", password)}
          />

          <AuthPasswordField
            id="confirmPassword"
            label="Confirm password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(confirmPassword) =>
              updateField("confirmPassword", confirmPassword)
            }
          />
        </div>

        <label className="flex cursor-pointer select-none items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm leading-snug text-muted">
            I agree to the{" "}
            <span className="font-semibold text-primary">Terms of Service</span>
            {" "}and Brand Guidelines.
          </span>
        </label>

        <AuthPrimaryButton loading={loading} loadingText="Creating account…">
          Create account
        </AuthPrimaryButton>
      </form>

      <p className={authMutedFooterClass}>
        Already have an account?{" "}
        <Link to="/login" className={authFooterLinkClass}>
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
