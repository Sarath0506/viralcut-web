import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Plus, Search } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toaster";
import { adminApi, ApiError, type AdminBrand } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";

type SortKey = "newest" | "name" | "campaigns";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "name", label: "Name (A–Z)" },
  { value: "campaigns", label: "Most campaigns" },
];

function sortBrands(brands: AdminBrand[], sort: SortKey): AdminBrand[] {
  const copy = [...brands];
  if (sort === "name") return copy.sort((a, b) => a.companyName.localeCompare(b.companyName));
  if (sort === "campaigns") return copy.sort((a, b) => b.campaignCount - a.campaignCount);
  return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const ACCENTS = [
  { bg: "bg-violet-500/10",  text: "text-violet-400"  },
  { bg: "bg-blue-500/10",    text: "text-blue-400"    },
  { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  { bg: "bg-orange-500/10",  text: "text-orange-400"  },
  { bg: "bg-pink-500/10",    text: "text-pink-400"    },
  { bg: "bg-cyan-500/10",    text: "text-cyan-400"    },
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [pocName, setPocName] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [created, setCreated] = useState<{ companyName: string; companyEmail: string; tempPassword: string } | null>(null);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  const mutation = useMutation({
    mutationFn: async () => {
      let logoUrl: string | undefined;
      if (logoFile) {
        const res = await adminApi.uploadBrandLogo(getToken()!, logoFile);
        logoUrl = res.url;
      }
      return adminApi.createBrand(getToken()!, {
        companyName: companyName.trim(),
        companyEmail: companyEmail.trim(),
        pocName: pocName.trim() || undefined,
        pocPhone: pocPhone.trim() || undefined,
        pocEmail: pocEmail.trim() || undefined,
        logoUrl,
      });
    },
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
              {/* Logo */}
              <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-variant/50 p-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/30" />
                ) : companyName.trim() ? (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                    {initials(companyName)}
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                )}
                <div className="space-y-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    {logoFile ? "Change logo" : "Upload logo"}
                  </Button>
                  <p className="text-xs text-muted">PNG, JPG or WebP · Max 5 MB</p>
                </div>
              </div>

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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const { data, isPending } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => adminApi.brands(getToken()!),
    enabled: Boolean(getToken()),
  });

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[132px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const brands = data ?? [];
  const q = query.trim().toLowerCase();
  const filtered = q
    ? brands.filter((b) => b.companyName.toLowerCase().includes(q) || (b.email ?? "").toLowerCase().includes(q))
    : brands;
  const visible = sortBrands(filtered, sort);

  return (
    <>
      {showCreate && <CreateBrandModal onClose={() => setShowCreate(false)} />}

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Brands</h1>
            <p className="mt-1 text-sm text-muted">
              {brands.length} registered brand{brands.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Create Brand
          </Button>
        </div>

        {brands.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex h-10 flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="h-full w-full rounded-xl border border-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm text-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
            <p className="font-medium">No brands yet</p>
            <p className="mt-1 text-sm text-muted">Create the first brand to get started.</p>
            <Button className="mt-4 gap-2" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              Create Brand
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface py-16 text-center">
            <p className="font-medium">No brands match "{query}"</p>
            <p className="mt-1 text-sm text-muted">Try a different name or email.</p>
            <Button variant="outline" className="mt-4" onClick={() => setQuery("")}>Clear search</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((brand) => {
              const accent = accentFor(brand.companyName);
              const isActive = brand.campaignCount > 0;
              return (
                <div
                  key={brand.id}
                  onClick={() => navigate(`/admin/brands/${brand.id}`)}
                  className="group cursor-pointer rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-border/60 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-black",
                          accent.bg,
                          accent.text,
                        )}
                      >
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initials(brand.companyName)
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold leading-tight">{brand.companyName}</p>
                        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                          <Mail className="h-3 w-3 shrink-0" strokeWidth={2} />
                          {brand.email ?? "—"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "mt-1 h-2 w-2 shrink-0 rounded-full",
                        isActive ? "bg-emerald-400" : "bg-muted/40",
                      )}
                      title={isActive ? "Active" : "New"}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/60 pt-3 text-center">
                    <div>
                      <p className={cn("text-base font-bold leading-none", accent.text)}>
                        {brand.campaignCount}
                      </p>
                      <p className="mt-1 text-[10px] text-muted">Campaigns</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none text-foreground">
                        {new Date(brand.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>
                      <p className="mt-1 text-[10px] text-muted">Joined</p>
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
