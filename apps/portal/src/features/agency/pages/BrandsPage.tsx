import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Mail, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toaster";
import { agencyApi, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useSelectedBrand } from "@/providers/selected-brand-provider";

export function BrandsPage() {
  const { getToken } = useAuth();
  const { setBrand } = useSelectedBrand();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const token = getToken();

  const { data: brands, isLoading } = useQuery({
    queryKey: ["agency-brands"],
    queryFn: () => agencyApi.brands.list(token!),
    enabled: Boolean(token),
  });

  const inviteMutation = useMutation({
    mutationFn: async ({
      brandProfileId,
      email,
    }: {
      brandProfileId: string;
      email: string;
    }) => agencyApi.brands.invite(token!, brandProfileId, email),
    onSuccess: () => {
      toast("Invite sent.", "success");
      void queryClient.invalidateQueries({ queryKey: ["agency-brands"] });
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Invite failed", "error");
    },
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Brand workspaces
          </h2>
          <p className="mt-1 text-sm text-muted">
            Create and manage brands you run campaigns for.
          </p>
        </div>
        <Link
          to="/brands/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" />
          New workspace
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : !brands?.length ? (
        <Card>
          <CardTitle>No brands yet</CardTitle>
          <p className="mt-2 text-sm text-muted">
            Create a brand workspace to start running campaigns on their behalf.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {brands.map((brand) => (
            <li key={brand.brandProfileId}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 size-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <CardTitle>{brand.companyName}</CardTitle>
                    <p className="mt-1 text-sm text-muted">
                      {brand.campaignCount} campaign
                      {brand.campaignCount === 1 ? "" : "s"}
                      {brand.hasOwner ? " · Owner linked" : " · No owner yet"}
                    </p>
                    {brand.pendingInvite ? (
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                        <Mail className="size-3.5" />
                        Invite pending: {brand.pendingInvite.email}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setBrand(brand.brandProfileId, brand.companyName)
                    }
                  >
                    Select for campaigns
                  </Button>
                  {!brand.hasOwner && !brand.pendingInvite ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const email = window.prompt(
                          "Brand owner email to invite:",
                        );
                        if (email?.trim()) {
                          inviteMutation.mutate({
                            brandProfileId: brand.brandProfileId,
                            email: email.trim(),
                          });
                        }
                      }}
                    >
                      Invite owner
                    </Button>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
