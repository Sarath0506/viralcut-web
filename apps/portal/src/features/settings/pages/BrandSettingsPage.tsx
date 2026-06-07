import { useQuery } from "@tanstack/react-query";

import { Card, CardTitle } from "@/components/ui/card";
import { portalApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function BrandSettingsPage() {
  const { getToken } = useAuth();
  const token = getToken();

  const { data: me } = useQuery({
    queryKey: ["me", "brand"],
    queryFn: () => portalApi.me(token!),
    enabled: Boolean(token),
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your brand account details.
        </p>
      </header>
      <Card className="max-w-lg">
        <CardTitle>Account</CardTitle>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Company</dt>
            <dd className="font-semibold">
              {me?.brandProfile?.companyName ?? me?.companyName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="font-semibold">{me?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Display name</dt>
            <dd className="font-semibold">{me?.displayName ?? "—"}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
