import { useState } from "react";
import { Check, Search, X } from "lucide-react";

import { INDIA_STATES } from "@/features/campaigns/lib/india-states";
import { cn } from "@/lib/utils";

/** An always-visible, searchable multi-select grid for Indian states — no dropdown to open. */
export function StateMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (states: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = new Set(selected);

  const toggle = (state: string) => {
    onChange(selectedSet.has(state) ? selected.filter((s) => s !== state) : [...selected, state]);
  };

  const filtered = INDIA_STATES.filter((s) => s.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-2.5">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((state) => (
            <span
              key={state}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {state}
              <button
                type="button"
                onClick={() => toggle(state)}
                aria-label={`Remove ${state}`}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search states…"
          className="h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="grid max-h-52 grid-cols-2 gap-1.5 overflow-y-auto rounded-xl border border-border p-2 sm:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full py-3 text-center text-xs text-muted">No states found.</p>
        ) : (
          filtered.map((state) => {
            const isSelected = selectedSet.has(state);
            return (
              <button
                key={state}
                type="button"
                onClick={() => toggle(state)}
                className={cn(
                  "flex items-center justify-between gap-1 truncate rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                  isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-variant",
                )}
                title={state}
              >
                <span className="truncate">{state}</span>
                {isSelected && <Check className="h-3 w-3 shrink-0" strokeWidth={3} />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
