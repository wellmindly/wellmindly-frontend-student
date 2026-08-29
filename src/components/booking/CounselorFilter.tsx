import { useMemo, useState } from "react";
import { Check, ChevronDown, Users, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { useClickOutside } from "../../lib/a11y";
import type { Counselor } from "./types";

/* ============================================================================
   CounselorFilter
   ----------------------------------------------------------------------------
   Replaces the old free-text search box and the six regex-matched category
   chips. Those filtered a *list of people* the student had to scroll before
   they could reach a time; this narrows the *times* instead.

   Nothing selected means "anyone" - the honest default, because most students
   have no opinion about which counselor they see, only about when.
   ========================================================================= */

export interface CounselorFilterProps {
  counselors: Counselor[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading?: boolean;
}

export function CounselorFilter({
  counselors,
  selectedIds,
  onChange,
  loading = false,
}: CounselorFilterProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  // A search field inside the panel only earns its space once the list is long
  // enough to scroll; with four counselors it is pure clutter.
  const showSearch = counselors.length > 6;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return counselors;
    return counselors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.credentials.toLowerCase().includes(q) ||
        c.specializations.some((s) => s.toLowerCase().includes(q)),
    );
  }, [counselors, query]);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const selected = counselors.filter((c) => selectedIds.includes(c.id));
  const triggerLabel =
    selected.length === 0
      ? "Any counselor"
      : selected.length === 1
        ? selected[0].name
        : `${selected.length} counselors`;

  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-ink-700" id="counselor-filter-label">
        Counselor
      </span>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          disabled={loading || counselors.length === 0}
          aria-expanded={open}
          aria-labelledby="counselor-filter-label"
          className={cn(
            "flex min-h-11 w-full items-center gap-2 rounded-xl border bg-card px-3.5 text-left",
            "text-sm font-medium text-ink-800 transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
            "disabled:cursor-not-allowed disabled:text-ink-400",
            open ? "border-plum-300" : "border-ink-200 hover:border-ink-300",
          )}
        >
          <Users className="h-4 w-4 shrink-0 text-plum-600" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">
            {loading ? "Loading counselors…" : triggerLabel}
          </span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 text-ink-400 transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>

        {open && (
          <div
            className={cn(
              "absolute inset-x-0 top-[calc(100%+0.375rem)] z-[var(--z-sticky)]",
              "rounded-2xl border border-ink-200 bg-card p-2 shadow-xl",
            )}
          >
            {showSearch && (
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a counselor"
                aria-label="Find a counselor"
                className={cn(
                  "mb-2 min-h-11 w-full rounded-xl border border-ink-200 bg-paper px-3 text-sm text-ink-800",
                  "placeholder:text-ink-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                )}
              />
            )}

            <div className="max-h-64 overflow-y-auto">
              {visible.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-ink-500">
                  Nobody matches “{query.trim()}”.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {visible.map((c) => {
                    const checked = selectedIds.includes(c.id);
                    return (
                      <li key={c.id}>
                        <label
                          className={cn(
                            "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5",
                            "text-sm text-ink-800 transition-colors hover:bg-paper",
                            checked && "bg-plum-50",
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(c.id)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                              checked
                                ? "border-plum-600 bg-plum-600 text-plum-50"
                                : "border-ink-300 bg-card",
                            )}
                          >
                            {checked && <Check className="h-3.5 w-3.5" />}
                          </span>
                          <span className="min-w-0 flex-1 py-2">
                            <span className="block truncate font-semibold">{c.name}</span>
                            <span className="block truncate text-2xs text-ink-500">
                              {c.credentials}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink-100 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange([]);
                  setQuery("");
                }}
                disabled={selectedIds.length === 0}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-xs font-bold",
                  "text-ink-600 transition-colors hover:bg-paper disabled:text-ink-300",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                  "cursor-pointer border-none bg-transparent disabled:cursor-not-allowed",
                )}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Anyone
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-xl bg-ink-900 px-4 text-xs font-bold text-ink-50",
                  "transition-colors hover:bg-ink-800 cursor-pointer border-none",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                )}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* The chips are the only place the choice stays visible once the panel is
          shut, and each one is also how you undo it. */}
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-label={`Stop filtering by ${c.name}`}
                className={cn(
                  "inline-flex min-h-11 items-center gap-1.5 rounded-full border border-plum-200 bg-plum-50 px-3",
                  "text-2xs font-bold text-plum-700 transition-colors hover:bg-plum-100",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                  "cursor-pointer",
                )}
              >
                <span className="max-w-[9rem] truncate">{c.name}</span>
                <X className="h-3 w-3 shrink-0" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
