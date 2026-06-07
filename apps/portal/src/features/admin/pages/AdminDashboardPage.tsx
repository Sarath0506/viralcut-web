import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function AdminDashboardPage() {
  const { getToken } = useAuth();
  const { data, isPending } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.dashboard(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending) return <PortalShellSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Admin dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of all brands and campaigns.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Registered brands</p>
          <p className="mt-2 text-3xl font-bold">{data?.brandCount ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Total campaigns</p>
          <p className="mt-2 text-3xl font-bold">{data?.campaignCount ?? 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Pending invites</p>
          <p className="mt-2 text-3xl font-bold">{data?.pendingInvites ?? 0}</p>
        </Card>
      </div>
    </div>
  );
}
