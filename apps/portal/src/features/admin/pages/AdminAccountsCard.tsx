import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/providers/auth-provider";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
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

/* ── Add Admin Modal ── */
function AddAdminModal({ onClose }: { onClose: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminRoleId, setAdminRoleId] = useState("");

  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => adminApi.roles(getToken()!),
    enabled: Boolean(getToken()),
  });

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createAdmin(getToken()!, {
        name: name.trim(),
        email: email.trim(),
        password,
        adminRoleId: adminRoleId || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-accounts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast("Admin account created — login details emailed", "success");
      onClose();
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Failed to create admin account", "error"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-lg">Add Admin</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-6">
          <Field label="Full Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Nair" />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@company.com" />
          </Field>
          <Field label="Password" required>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
          </Field>
          <Field label="Role">
            <select
              value={adminRoleId}
              onChange={(e) => setAdminRoleId(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <option value="">Super Admin — full access</option>
              {rolesData?.roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>
          <p className="text-xs text-muted">Login details will be sent to their email automatically.</p>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !name.trim() || !email.trim() || password.length < 8}
            >
              {mutation.isPending ? "Saving…" : "Save Admin"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Admin Accounts Card ── */
export function AdminAccountsCard() {
  const { getToken } = useAuth();
  const [showAdd, setShowAdd] = useState(false);

  const { data: admins, isLoading, isError } = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: () => adminApi.adminAccounts(getToken()!),
    enabled: Boolean(getToken()),
    retry: false,
  });

  // Non-super-admins get a 403 here — quietly hide the section rather than
  // showing an error, since they have no business seeing other admins' roles.
  if (isError) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {showAdd && <AddAdminModal onClose={() => setShowAdd(false)} />}

      <div className="flex items-center gap-2 border-b border-border bg-surface-variant/40 px-5 py-3">
        <ShieldCheck className="h-4 w-4 text-muted" strokeWidth={2} />
        <h2 className="text-sm font-semibold">Admin Roles</h2>
        <span className="text-xs text-muted">— controls what each admin can see and do</span>
        <Button size="sm" variant="outline" className="ml-auto gap-1.5" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Add Admin
        </Button>
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
              {admins?.map((a) => (
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
