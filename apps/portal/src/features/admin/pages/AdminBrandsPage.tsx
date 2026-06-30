import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortalShellSkeleton } from "@/components/ui/page-skeletons";
import { useToast } from "@/components/ui/toaster";
import { adminApi, ApiError } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

const ACCENTS = [
  { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", stat: "text-violet-400" },
  { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20",   stat: "text-blue-400"   },
  { bg: "bg-emerald-500/10",text: "text-emerald-400",border: "border-emerald-500/20",stat: "text-emerald-400"},
  { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", stat: "text-orange-400" },
  { bg: "bg-pink-500/10",   text: "text-pink-400",   border: "border-pink-500/20",   stat: "text-pink-400"   },
  { bg: "bg-cyan-500/10",   text: "text-cyan-400",   border: "border-cyan-500/20",   stat: "text-cyan-400"   },
];

function accentFor(name: string) {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Create Brand Modal ── */
function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted uppercase tracking-wide">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function CreateBrandModal({ onClose }: { onClose: () => void }) {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [pocName, setPocName] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [created, setCreated] = useState<{ companyName: string; companyEmail: string; tempPassword: string } | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createBrand(getToken()!, {
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim(),
        pocName: pocName.trim() || undefined,
        pocPhone: pocPhone.trim() || undefined,
        pocEmail: pocEmail.trim() || undefined,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      setCreated({ companyName: data.companyName, companyEmail: data.companyEmail ?? data.email ?? "", tempPassword: data.tempPassword });
    },
    onError: (err) => {
      toast(err instanceof ApiError ? err.message : "Failed to create brand", "error");
    },
  });

  const canSubmit = companyName.trim().length > 0 && companyEmail.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-bold text-lg">{created ? "Brand Created!" : "Create Brand"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface-variant hover:text-foreground">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {created ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                <svg className="h-5 w-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm font-medium text-emerald-400">Brand created successfully</p>
              </div>

              <div className="rounded-xl border border-border bg-surface-variant p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Company</span>
                  <span className="font-semibold">{created.companyName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Login email</span>
                  <span className="font-semibold">{created.companyEmail}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Temp password</span>
                  <span className="font-mono font-semibold text-primary">{created.tempPassword}</span>
                </div>
              </div>

              <p className="text-xs text-muted">Share these login credentials with the brand.</p>
              <Button className="w-full" onClick={onClose}>Done</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Company info */}
              <div className="rounded-xl border border-border bg-surface-variant/50 p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Company</p>
                <Field label="Company Name" required>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Acme Corp" />
                </Field>
                <Field label="Company Email" required>
                  <Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="hello@acme.com" />
                </Field>
              </div>

              {/* POC info */}
              <div className="rounded-xl border border-border bg-surface-variant/50 p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Point of Contact</p>
                <Field label="POC Name">
                  <Input value={pocName} onChange={(e) => setPocName(e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="POC Phone">
                  <Input type="tel" value={pocPhone} onChange={(e) => setPocPhone(e.target.value)} placeholder="+91 9876543210" />
                </Field>
                <Field label="POC Email">
                  <Input type="email" value={pocEmail} onChange={(e) => setPocEmail(e.target.value)} placeholder="poc@acme.com" />
                </Field>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending || !canSubmit}>
                  {mutation.isPending ? "Creating…" : "Create Brand"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Brands Page ── */
export function AdminBrandsPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => adminApi.brands(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending) return <PortalShellSkeleton />;

  const brands = data ?? [];

  return (
    <>
      {showCreate && <CreateBrandModal onClose={() => setShowCreate(false)} />}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Brands</h1>
            <p className="mt-1 text-sm text-muted">
              {brands.length} registered brand{brands.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Brand
          </Button>
        </div>

        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
            <p className="font-medium">No brands yet</p>
            <p className="mt-1 text-sm text-muted">Create the first brand to get started.</p>
            <Button className="mt-4 gap-2" onClick={() => setShowCreate(true)}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Brand
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {brands.map((brand) => {
              const accent = accentFor(brand.companyName);
              return (
                <div
                  key={brand.id}
                  onClick={() => navigate(`/admin/brands/${brand.id}`)}
                  className={`group cursor-pointer overflow-hidden rounded-2xl border bg-surface transition-all hover:shadow-lg ${accent.border}`}
                >
                  <div className={`flex h-28 items-center justify-center ${accent.bg}`}>
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.companyName} className="h-full w-full object-cover" />
                    ) : (
                      <span className={`text-5xl font-black tracking-tight ${accent.text}`}>
                        {initials(brand.companyName)}
                      </span>
                    )}
                  </div>

                  <div className="px-4 py-3">
                    <p className="truncate font-semibold leading-tight">{brand.companyName}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{brand.email ?? "—"}</p>
                  </div>

                  <div className={`flex divide-x border-t ${accent.border} divide-border/50`}>
                    <div className="flex flex-1 flex-col items-center py-2.5">
                      <span className={`text-base font-bold ${accent.stat}`}>{brand.campaignCount}</span>
                      <span className="text-[10px] text-muted">Campaigns</span>
                    </div>
                    <div className="flex flex-1 flex-col items-center py-2.5">
                      <span className="text-sm font-semibold">
                        {new Date(brand.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                      <span className="text-[10px] text-muted">Joined</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
