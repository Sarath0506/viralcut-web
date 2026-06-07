import { useQuery } from "@tanstack/react-query";

import { Card } from "@/components/ui/card";
import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function AdminBrandsPage() {
  const { getToken } = useAuth();
  const { data, isPending } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => adminApi.brands(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending) return <PortalShellSkeleton />;

  const brands = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Brands</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All registered brand accounts.
        </p>
      </div>

      {brands.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No brands registered yet.
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Campaigns</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-border/70">
                  <td className="px-4 py-3 font-medium">{brand.companyName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {brand.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">{brand.campaignCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
