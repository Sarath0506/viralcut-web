import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { useToast } from "@/components/ui/toaster";
import { adminApi, ApiError, portalApi } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

export function AdminCampaignInvitePage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");

  const { data: campaign, isPending } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => portalApi.campaigns.get(getToken()!, id!),
    enabled: Boolean(getToken() && id),
  });

  const { data: invites } = useQuery({
    queryKey: ["campaign-invites", id],
    queryFn: () => adminApi.listInvites(getToken()!, id!),
    enabled: Boolean(getToken() && id),
  });

  const sendInvite = useMutation({
    mutationFn: (inviteEmail: string) =>
      adminApi.sendInvite(getToken()!, id!, inviteEmail),
    onSuccess: () => {
      toast("Invite sent.", "success");
      setEmail("");
      void queryClient.invalidateQueries({ queryKey: ["campaign-invites", id] });
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (error) => {
      toast(
        error instanceof ApiError ? error.message : "Could not send invite.",
        "error",
      );
    },
  });

  const revokeInvite = useMutation({
    mutationFn: (inviteId: string) =>
      adminApi.revokeInvite(getToken()!, id!, inviteId),
    onSuccess: () => {
      toast("Invite revoked.", "success");
      void queryClient.invalidateQueries({ queryKey: ["campaign-invites", id] });
    },
  });

  if (isPending || !campaign) return <PortalShellSkeleton />;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          to={`/admin/campaigns/${id}/edit/review`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to campaign
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold">Invite brand</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite a brand to collaborate on &quot;{campaign.title}&quot;. They must
          accept before the campaign can be published.
        </p>
      </div>

      <Card className="space-y-4 p-5">
        <div>
          <label htmlFor="invite-email" className="text-sm font-medium">
            Brand email
          </label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="brand@company.com"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={!email.trim() || sendInvite.isPending}
          className={buttonVariants()}
          onClick={() => sendInvite.mutate(email.trim())}
        >
          Send invite
        </button>
      </Card>

      {(invites?.length ?? 0) > 0 ? (
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Invites</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {invites?.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-3 border-b border-border/60 py-2 last:border-0"
              >
                <div>
                  <p>{invite.email}</p>
                  <p className="text-xs text-muted-foreground">{invite.status}</p>
                </div>
                {invite.status === "pending" ? (
                  <button
                    type="button"
                    className="text-xs text-rose-600 hover:underline"
                    onClick={() => revokeInvite.mutate(invite.id)}
                  >
                    Revoke
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
