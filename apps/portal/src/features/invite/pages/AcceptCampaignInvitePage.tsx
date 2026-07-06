import { Building2, Mail, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { AuthPasswordField } from "@/components/auth/auth-password-field";
import { AuthPrimaryButton } from "@/components/auth/auth-primary-button";
import { authFooterLinkClass, authFormClass } from "@/components/auth/auth-styles";
import { AuthTextField } from "@/components/auth/auth-text-field";
import { AuthPageHeader, AuthSplitLayout } from "@/components/layout/auth-split-layout";
import { useToast } from "@/components/ui/toaster";
import { ApiError, authApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

function emailsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function AcceptCampaignInvitePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { setSession, auth, logout } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState<Awaited<
    ReturnType<typeof authApi.previewCampaignInvite>
  > | null>(null);
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const inviteReturnPath = useMemo(
    () =>
      `/invite/campaign?token=${encodeURIComponent(token)}`,
    [token],
  );
  const loginUrl = `/login?next=${encodeURIComponent(inviteReturnPath)}`;

  useEffect(() => {
    if (!token) return;
    void authApi.previewCampaignInvite(token).then(setPreview).catch(() => {
      setPreview({
        valid: false,
        expired: true,
        alreadyAccepted: false,
        campaignId: null,
        campaignTitle: null,
        email: null,
        needsSignup: false,
        hasBrandAccount: false,
      });
    });
  }, [token]);

  async function onAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      const result = await authApi.acceptCampaignInvite({
        token,
        ...(preview?.needsSignup
          ? { password, companyName, displayName }
          : {}),
      });
      if ("needsSignup" in result && result.needsSignup) {
        setPreview((p) => (p ? { ...p, needsSignup: true } : p));
        return;
      }
      if ("tokens" in result && "campaign" in result) {
        setSession(result);
        toast("Invite accepted! Opening your campaign.", "success");
        navigate(`/campaigns/${result.campaign.id}`, { replace: true });
      }
    } catch (err) {
      toast(
        err instanceof ApiError ? err.message : "Could not accept invite.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthSplitLayout heroVariant="login">
        <p className="text-sm text-rose-700">Invalid invite link.</p>
      </AuthSplitLayout>
    );
  }

  if (!preview) {
    return (
      <AuthSplitLayout heroVariant="login">
        <p className="text-sm text-muted-foreground">Loading invite…</p>
      </AuthSplitLayout>
    );
  }

  if (preview.alreadyAccepted && preview.campaignId) {
    return (
      <AuthSplitLayout heroVariant="login">
        <AuthPageHeader
          title="Invite already accepted"
          description={`You're already on the campaign "${preview.campaignTitle ?? ""}".`}
        />
        <Link
          to={`/campaigns/${preview.campaignId}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Open campaign
        </Link>
        {!auth ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <Link to={loginUrl} className={authFooterLinkClass}>
              Sign in
            </Link>{" "}
            to manage it.
          </p>
        ) : null}
      </AuthSplitLayout>
    );
  }

  if (!preview.valid) {
    return (
      <AuthSplitLayout heroVariant="login">
        <AuthPageHeader
          title="Invite unavailable"
          description={
            preview.expired
              ? "This invite has expired."
              : "This invite link is no longer valid."
          }
        />
        <Link to="/login" className="text-sm text-primary hover:underline">
          Go to brand login
        </Link>
      </AuthSplitLayout>
    );
  }

  const wrongAccount =
    auth?.user.email &&
    preview.email &&
    !emailsMatch(auth.user.email, preview.email);

  const signedInReady =
    auth &&
    preview.email &&
    emailsMatch(auth.user.email, preview.email) &&
    auth.user.role === "brand";

  return (
    <AuthSplitLayout heroVariant="login">
      <AuthPageHeader
        title="Campaign collaboration invite"
        description={`You've been invited to work on "${preview.campaignTitle}".`}
      />

      {preview.email ? (
        <p className="mb-4 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Invite sent to{" "}
          <span className="font-semibold text-foreground">{preview.email}</span>
        </p>
      ) : null}

      {wrongAccount ? (
        <div className="mb-4 space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm">
          <p>
            You're signed in as{" "}
            <span className="font-semibold">{auth?.user.email}</span>, but this
            invite is for{" "}
            <span className="font-semibold">{preview.email}</span>.
          </p>
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
            onClick={() => logout(loginUrl)}
          >
            Sign out and continue
          </button>
        </div>
      ) : null}

      {!wrongAccount ? (
        <form onSubmit={onAccept} className={authFormClass}>
          {preview.needsSignup ? (
            <>
              <AuthTextField
                id="invite-email"
                label="Email"
                type="email"
                icon={Mail}
                value={preview.email ?? ""}
                readOnly
                disabled
              />
              <AuthTextField
                id="company"
                label="Company name"
                icon={Building2}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <AuthTextField
                id="displayName"
                label="Your name"
                icon={User}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <AuthPasswordField
                id="password"
                label="Create password"
                value={password}
                onChange={setPassword}
                required
              />
            </>
          ) : signedInReady ? (
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-semibold text-foreground">
                {auth.user.email}
              </span>
              . Accept to link this campaign to your brand account.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              You already have a Halchal brand account for this email. Accept
              the invite to open the campaign, or sign in first if you prefer.
            </p>
          )}

          <AuthPrimaryButton loading={loading}>
            {preview.needsSignup ? "Create account & accept" : "Accept invite"}
          </AuthPrimaryButton>

          {!preview.needsSignup && !signedInReady ? (
            <p className="text-center text-sm text-muted-foreground">
              Prefer to sign in first?{" "}
              <Link to={loginUrl} className={authFooterLinkClass}>
                Log in with {preview.email}
              </Link>
            </p>
          ) : null}
        </form>
      ) : null}
    </AuthSplitLayout>
  );
}
