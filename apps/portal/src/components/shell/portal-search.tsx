import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { StatusPill } from "@/components/ui/status-pill";
import { adminApi, portalApi, type AdminCreatorSummary } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

function matchesCreator(c: AdminCreatorSummary, q: string): boolean {
  return (
    (c.displayName ?? "").toLowerCase().includes(q) ||
    (c.username ?? "").toLowerCase().includes(q) ||
    (c.email ?? "").toLowerCase().includes(q) ||
    (c.phone ?? "").toLowerCase().includes(q) ||
    (c.verifiedCreatorId ?? "").includes(q.replace(/^#/, ""))
  );
}

export function PortalSearch({
  className,
  placeholder = "Search campaigns or clippers…",
}: {
  className?: string;
  placeholder?: string;
}) {
  const { getToken } = useAuth();
  const role = usePortalRole();
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const token = getToken();
  const campaignBase = isAdmin ? "/admin/campaigns" : "/campaigns";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const trimmed = debouncedQuery;
  const searchActive = Boolean(token) && trimmed.length >= MIN_QUERY_LENGTH;

  const { data: campaignData, isFetching: campaignsFetching } = useQuery({
    queryKey: ["campaign-search", trimmed],
    queryFn: () => portalApi.campaigns.list(token!, { search: trimmed, limit: 8 }),
    enabled: searchActive,
  });

  // Same query key AdminClippersPage uses, so this shares its cache instead
  // of re-fetching — the creators list is small (a few dozen), so filtering
  // client-side here (like that page already does) beats adding a new
  // paginated backend search endpoint just for this dropdown.
  const { data: creatorData, isFetching: creatorsFetching } = useQuery({
    queryKey: ["admin-creators"],
    queryFn: () => adminApi.creators(token!),
    enabled: isAdmin && searchActive,
  });

  const campaignResults = campaignData?.items ?? [];
  const q = trimmed.toLowerCase();
  const creatorResults = isAdmin
    ? (creatorData ?? []).filter((c) => matchesCreator(c, q)).slice(0, 8)
    : [];
  const isFetching = campaignsFetching || (isAdmin && creatorsFetching);
  const hasResults = campaignResults.length > 0 || creatorResults.length > 0;
  const showDropdown = open && query.trim().length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        (document.activeElement as HTMLElement | null)?.blur();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function goTo(path: string) {
    setOpen(false);
    setQuery("");
    navigate(path);
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <label className="relative flex h-10 w-full items-center">
        <Search
          className="pointer-events-none absolute left-3 size-4 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="h-full w-full rounded-xl border border-border bg-surface-variant/80 py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-muted focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </label>

      {showDropdown && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-50 w-full min-w-[280px] overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="max-h-96 overflow-y-auto">
            {isFetching ? (
              <p className="px-3 py-6 text-center text-sm text-muted">Searching…</p>
            ) : !hasResults ? (
              <p className="px-3 py-6 text-center text-sm text-muted">No results found.</p>
            ) : (
              <>
                {campaignResults.length > 0 && (
                  <div className="divide-y divide-border/50">
                    <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-wider text-muted uppercase">
                      Campaigns
                    </p>
                    {campaignResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => goTo(`${campaignBase}/${c.id}`)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-variant"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                          {c.brandCompanyName && (
                            <p className="truncate text-xs text-muted">{c.brandCompanyName}</p>
                          )}
                        </div>
                        <StatusPill status={c.status} className="shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {creatorResults.length > 0 && (
                  <div className="divide-y divide-border/50">
                    <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold tracking-wider text-muted uppercase">
                      Clippers
                    </p>
                    {creatorResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => goTo(`/admin/clippers/${c.id}`)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-surface-variant"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {c.displayName ?? c.username ?? "Creator"}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {c.verifiedCreatorId ? `#${c.verifiedCreatorId}` : (c.email ?? c.phone ?? "")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
