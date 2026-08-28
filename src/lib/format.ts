/* ============================================================================
   Formatting helpers
   ----------------------------------------------------------------------------
   Centralised so dates and counts read the same on every surface. All of these
   use the browser's locale rather than hardcoded en-US strings.
   ========================================================================= */

/** Coerce anything the API might hand us into a Date, or null. */
function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "24 Aug" - compact, for chips and timeline rows. */
export function formatDayMonth(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** "24 August 2026" - for detail views where the year matters. */
export function formatFullDate(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

/**
 * "just now" · "12m ago" · "3h ago" · "yesterday" · "4d ago" · "24 Aug"
 * Past-facing only - used for activity feeds and note timestamps.
 */
export function formatRelative(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.round(diffMs / 60_000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;
  return formatDayMonth(d);
}

/** True when the timestamp falls on today's calendar date. */
export function isToday(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return false;
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/** Local calendar day key, "2026-08-24". Safe for grouping - not UTC-shifted. */
export function dayKey(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return "";
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
