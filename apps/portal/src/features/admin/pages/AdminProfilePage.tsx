import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { useToast } from "@/components/ui/toaster";
import { adminApi, type StaffMember, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

/* ── helpers ── */
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

/* ── Create Team Member Modal ── */
function CreateMemberModal({ onClose }: { onClose: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => adminApi.createTeamMember(getToken()!, { name: name.trim(), email: email.trim(), password }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] });
      toast("Team member created — login details emailed", "success");
      onClose();
    },
    onError: (err) => toast(err instanceof ApiError ? err.message : "Failed to create team member", "error"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-lg">Add Team Member</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-6">
          <Field label="Full Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rahul@company.com" />
          </Field>
          <Field label="Password" required>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" />
          </Field>
          <p className="text-xs text-muted">Login details will be sent to the member's email automatically.</p>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !name.trim() || !email.trim() || password.length < 8}
            >
              {mutation.isPending ? "Saving…" : "Save Team Member"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Assign Brand Modal ── */
function AssignBrandModal({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => adminApi.brands(getToken()!),
    enabled: Boolean(getToken()),
  });

  const assignedIds = new Set(member.assignedBrands.map((b) => b.id));

  const assign = useMutation({
    mutationFn: (brandId: string) => adminApi.assignBrand(getToken()!, member.id, brandId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] }),
    onError: () => toast("Failed to assign brand", "error"),
  });

  const remove = useMutation({
    mutationFn: (brandId: string) => adminApi.removeBrand(getToken()!, member.id, brandId),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-team-members"] }),
    onError: () => toast("Failed to remove brand", "error"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-bold text-lg">Assign Brands</h2>
            <p className="text-xs text-muted mt-0.5">{member.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
          {brands.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-muted">No brands yet.</p>
          )}
          {brands.map((brand) => {
            const isAssigned = assignedIds.has(brand.id);
            const isPending = assign.isPending || remove.isPending;
            return (
              <div key={brand.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">
                  {brand.logoUrl
                    ? <img src={brand.logoUrl} className="h-9 w-9 rounded-full object-cover" alt="" />
                    : initials(brand.companyName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{brand.companyName}</p>
                  <p className="truncate text-xs text-muted">{brand.email ?? ""}</p>
                </div>
                <button
                  disabled={isPending}
                  onClick={() => isAssigned ? remove.mutate(brand.id) : assign.mutate(brand.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                    isAssigned
                      ? "bg-emerald-500/15 text-emerald-500 hover:bg-red-500/15 hover:text-red-400"
                      : "bg-surface-variant text-muted hover:bg-primary/15 hover:text-primary"
                  }`}
                >
                  {isAssigned ? "Assigned ✓" : "Assign"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border px-5 py-3">
          <Button variant="outline" className="w-full" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

/* ── Member Card ── */
function MemberCard({ member }: { member: StaffMember }) {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <>
      {showAssign && <AssignBrandModal member={member} onClose={() => setShowAssign(false)} />}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-black text-primary">
            {initials(member.name || member.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{member.name}</p>
            <p className="text-xs text-muted truncate">{member.email}</p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => setShowAssign(true)}>
            Assign Brand
          </Button>
        </div>

        {/* Assigned brands */}
        {member.assignedBrands.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.assignedBrands.map((b) => (
              <span key={b.id} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {b.companyName}
              </span>
            ))}
          </div>
        )}
        {member.assignedBrands.length === 0 && (
          <p className="mt-2 text-xs text-muted/60 italic">No brands assigned yet</p>
        )}
      </div>
    </>
  );
}

/* ── Admin Profile Page ── */
export function AdminProfilePage() {
  const { auth } = useAuth();
  const { getToken } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  const { data: members = [], isPending } = useQuery({
    queryKey: ["admin-team-members"],
    queryFn: () => adminApi.listTeamMembers(getToken()!),
    enabled: Boolean(getToken()),
  });

  const profileInitials = (auth?.user.displayName ?? auth?.user.email ?? "A")
    .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      {showCreate && <CreateMemberModal onClose={() => setShowCreate(false)} />}

      <div className="space-y-6">
        {/* Admin info */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-black text-primary">
              {profileInitials}
            </div>
            <div>
              <h1 className="text-xl font-bold">{auth?.user.displayName ?? "Admin"}</h1>
              <p className="text-sm text-muted">{auth?.user.email}</p>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Team Members</h2>
              <p className="text-sm text-muted">{members.length} member{members.length !== 1 ? "s" : ""}</p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Member
            </Button>
          </div>

          {isPending ? (
            <PortalShellSkeleton />
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
              <svg className="h-10 w-10 text-muted/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <p className="font-medium">No team members yet</p>
              <p className="mt-1 text-sm text-muted">Add members and assign them to brands.</p>
              <Button className="mt-4 gap-2" onClick={() => setShowCreate(true)}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add First Member
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {members.map((m) => <MemberCard key={m.id} member={m} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
