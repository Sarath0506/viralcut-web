import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { agencyApi, ApiError, brandApi } from "@/lib/api";
import { useAuth, usePortalRole } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

function BrandAccountSettings() {
  const { auth, getToken } = useAuth();
  const { companyName } = useSelectedBrand();
  const token = getToken();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me", "brand"],
    queryFn: () => brandApi.me(token!),
    enabled: Boolean(token),
  });

  const agencyConnections = me?.agencyConnections ?? [];

  const revokeMutation = useMutation({
    mutationFn: (managedBrandProfileId: string) =>
      brandApi.agency.revoke(token!, managedBrandProfileId),
    onSuccess: () => {
      toast("Agency disconnected.", "success");
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => {
      toast(
        err instanceof ApiError ? err.message : "Could not disconnect agency",
        "error",
      );
    },
  });

  return (
    <>
      <Card className="mb-4 max-w-lg">
        <CardTitle>Account</CardTitle>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Company</dt>
            <dd className="font-semibold">
              {companyName ??
                me?.brandProfile?.companyName ??
                me?.companyName ??
                "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold">{me?.email ?? auth?.user.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Display name</dt>
            <dd className="font-semibold">{me?.displayName ?? "—"}</dd>
          </div>
        </dl>
      </Card>

      <Card className="max-w-lg">
        <CardTitle>Agency access</CardTitle>
        <p className="mt-2 text-sm text-muted">
          Agencies you approved can run campaigns on your workspace. Disconnect
          any agency that should no longer manage your brand.
        </p>
        {agencyConnections.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No agency is linked.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {agencyConnections.map((connection) => (
              <li
                key={connection.brandProfileId}
                className="rounded-lg border border-border p-4 text-sm"
              >
                <p>
                  <span className="text-muted">Workspace </span>
                  <span className="font-semibold">
                    {connection.companyName}
                  </span>
                </p>
                <p className="mt-1">
                  <span className="text-muted">Managed by </span>
                  <span className="font-semibold">
                    {connection.agency.companyName}
                  </span>
                </p>
                <Button
                  className="mt-3"
                  variant="outline"
                  size="sm"
                  disabled={revokeMutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Disconnect ${connection.agency.companyName}? They will lose access to ${connection.companyName} immediately.`,
                      )
                    ) {
                      revokeMutation.mutate(connection.brandProfileId);
                    }
                  }}
                >
                  Disconnect agency
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

function AgencyAccountSettings() {
  const { auth, getToken } = useAuth();
  const token = getToken();

  const { data: me } = useQuery({
    queryKey: ["me", "agency"],
    queryFn: () => agencyApi.me(token!),
    enabled: Boolean(token),
  });

  return (
    <Card className="max-w-lg">
      <CardTitle>Account</CardTitle>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-muted">Company</dt>
          <dd className="font-semibold">{me?.agency?.companyName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Email</dt>
          <dd className="font-semibold">{me?.email ?? auth?.user.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Display name</dt>
          <dd className="font-semibold">{me?.displayName ?? "—"}</dd>
        </div>
      </dl>
    </Card>
  );
}

export function BrandSettingsPage() {
  const role = usePortalRole();
  const isAgency = role === "agency";

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Settings
        </h2>
        <p className="mt-1 text-sm text-muted">
          {isAgency
            ? "Agency account preferences."
            : "Brand profile and account preferences."}
        </p>
      </div>
      {isAgency ? <AgencyAccountSettings /> : <BrandAccountSettings />}
    </>
  );
}
