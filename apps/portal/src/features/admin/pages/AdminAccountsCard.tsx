import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";

import { adminApi, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/providers/auth-provider";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function RoleSelect({ userId, adminRoleId }: { userId: string; adminRoleId: string | null }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminApi.roles(getToken()!),
    enabled: Boolean(getToken()),
  });

  const assign = useMutation({
    mutationFn: (nextRoleId: string | null) => adminApi.assignAdminRole(getToken()!, userId, nextRoleId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-my-permissions"] });
      toast("Role updated", "success");
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Failed to update role", "error"),
  });

  return (
    <select
      value={adminRoleId ?? ""}
      onChange={(e) => assign.mutate(e.target.value === "" ? null : e.target.value)}
      disabled={assign.isPending}
      className="h-9 min-w-[160px] rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
    >
      <option value="">Super Admin</option>
      {rolesData?.roles.map((r) => (
        <option key={r.id} value={r.id}>{r.name}</option>
      ))}
    </select>
  );
}

/* ── Admin Accounts Card ── */
export function AdminAccountsCard() {
  const { getToken } = useAuth();

  const { data: admins, isLoading, isError } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => adminApi.adminAccounts(getToken()!),
    enabled: Boolean(getToken()),
    retry: false,
  });

  // Non-super-admins get a 403 here — quietly hide the section rather than
  // showing an error, since they have no business seeing other admins' roles.
  if (isError || (!isLoading && !admins?.length)) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <div className="flex items-center gap-2 border-b border-border bg-surface-variant/40 px-5 py-3">
        <ShieldCheck className="h-4 w-4 text-muted" strokeWidth={2} />
        <h2 className="text-sm font-semibold">Admin Roles</h2>
        <span className="text-xs text-muted">— controls what each admin can see and do</span>
      </div>

      {isLoading ? (
        <div className="p-5 text-sm text-muted">Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Admin</th>
                <th className="px-5 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {admins!.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                        {initials(a.name)}
                      </div>
                      <div>
                        <p className="font-medium">{a.name}</p>
                        {a.email && <p className="text-xs text-muted">{a.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <RoleSelect userId={a.id} adminRoleId={a.adminRoleId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="border-t border-border bg-surface-variant/20 px-5 py-3 text-xs text-muted">
        Changes apply on the affected admin's next request — they do not need to log out.
      </p>
    </div>
  );
}
