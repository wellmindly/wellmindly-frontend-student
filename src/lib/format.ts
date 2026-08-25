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

/** "Mon 24 Aug, 5:00 pm" - for sessions and bookings. */
export function formatDateTime(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "5:00 pm" */
export function formatTime(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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

/**
 * "in 2 days" · "tomorrow" · "in 3h" - future-facing, for upcoming sessions.
 * Returns "" when the date is in the past.
 */
export function formatUntil(value: string | number | Date | null | undefined) {
  const d = toDate(value);
  if (!d) return "";
  const diffMs = d.getTime() - Date.now();
  if (diffMs <= 0) return "";

  const mins = Math.round(diffMs / 60_000);
  if (mins < 60) return `in ${mins}m`;

  const hours = Math.round(mins / 60);
  if (hours < 24) return `in ${hours}h`;

  const days = Math.round(hours / 24);
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  return `on ${formatDayMonth(d)}`;
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

/** Initials from a name or a first/last pair. Always 1–2 uppercase letters. */
export function initialsOf(...parts: Array<string | null | undefined>) {
  const letters = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .flatMap((p) => p.trim().split(/\s+/))
    .map((w) => w[0]?.toUpperCase() ?? "")
    .filter(Boolean);
  return letters.slice(0, 2).join("") || "?";
}

/** Clamp to 0–100 and round. For progress bars and gauges. */
export function toPercent(value: number, max: number) {
  if (!max || !Number.isFinite(max) || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round((value / max) * 100)));
}

/** "3 notes" / "1 note" - no hardcoded plural bugs. */
export function pluralise(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}

/** Trim to a word boundary and add an ellipsis. Used in previews and cards. */
export function truncateWords(text: string, maxChars: number) {
  if (!text || text.length <= maxChars) return text ?? "";
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * Time-of-day greeting. Used by the dashboard and landing hero so they agree.
 */
export function greetingFor(date: Date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Winding down";
}
