import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { StatusPill } from "@/components/ui/status-pill";
import { portalApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth, usePortalRole } from "@/providers/auth-provider";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export function PortalSearch({
  className,
  placeholder = "Search campaigns…",
}: {
  className?: string;
  placeholder?: string;
}) {
  const { getToken } = useAuth();
  const role = usePortalRole();
  const navigate = useNavigate();
  const token = getToken();
  const base = role === "admin" ? "/admin/campaigns" : "/campaigns";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const trimmed = debouncedQuery;
  const { data, isFetching } = useQuery({
    queryKey: ["campaign-search", trimmed],
    queryFn: () => portalApi.campaigns.list(token!, { search: trimmed, limit: 8 }),
    enabled: Boolean(token) && trimmed.length >= MIN_QUERY_LENGTH,
  });

  const results = data?.items ?? [];
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

  function handleSelect(campaignId: string) {
    setOpen(false);
    setQuery("");
    navigate(`${base}/${campaignId}`);
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
          <div className="max-h-80 overflow-y-auto">
            {isFetching ? (
              <p className="px-3 py-6 text-center text-sm text-muted">Searching…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted">No campaigns found.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
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
          </div>
        </div>
      )}
    </div>
  );
}
