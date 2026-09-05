import { Clock, Sunrise, Sun, Sunset } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Skeleton } from "../ui";
import type { SlotOption } from "./types";

/* ============================================================================
   SlotGrid
   ----------------------------------------------------------------------------
   Step one of booking: the shape of one day. Times the student cannot have are
   still rendered, greyed and struck through, because a gap tells you more than
   a missing row does.

   The previous version repeated the same 50-line block three times, once per
   part of day, so a fix to a slot button had to be made in three places.
   ========================================================================= */

export interface SlotGridProps {
  loading: boolean;
  slots: SlotOption[];
  selectedSlot: SlotOption | null;
  onSelectSlot: (slot: SlotOption) => void;
  formatSlotTimeRange: (startTimeIso: string, endTimeIso: string) => string;
  /** Which clock the times are shown on - drives the morning/afternoon split. */
  timezoneMode: "utc" | "local";
  localTzAbbr: string;
  /** True when the student narrowed the list, so "any counselor" copy is wrong. */
  filtered: boolean;
}

const PARTS: Array<{ id: string; label: string; icon: LucideIcon; iconClass: string }> = [
  { id: "morning", label: "Morning", icon: Sunrise, iconClass: "text-gold-500" },
  { id: "afternoon", label: "Afternoon", icon: Sun, iconClass: "text-gold-500" },
  { id: "evening", label: "Evening", icon: Sunset, iconClass: "text-plum-400" },
];

export function SlotGrid({
  loading,
  slots,
  selectedSlot,
  onSelectSlot,
  formatSlotTimeRange,
  timezoneMode,
  localTzAbbr,
  filtered,
}: SlotGridProps) {
  const openCount = slots.filter((s) => s.counselorIds.length > 0).length;

  const groups: Record<string, SlotOption[]> = { morning: [], afternoon: [], evening: [] };
  for (const slot of slots) {
    const d = new Date(slot.startTime);
    const hour = timezoneMode === "utc" ? d.getUTCHours() : d.getHours();
    if (hour < 12) groups.morning.push(slot);
    else if (hour < 17) groups.afternoon.push(slot);
    else groups.evening.push(slot);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-xs font-semibold text-ink-700">
          {loading ? "Checking times…" : `${openCount} ${openCount === 1 ? "time" : "times"} open`}
        </span>
        <span className="text-2xs text-ink-500">
          Shown in {timezoneMode === "utc" ? "UTC" : localTzAbbr}
        </span>
      </div>

      {loading ? (
        <div className="space-y-2" aria-live="polite" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded-xl" />
          ))}
        </div>
      ) : slots.length === 0 || openCount === 0 ? (
        <div className="space-y-1 rounded-2xl border border-ink-200/80 bg-paper p-6 text-center">
          <Clock className="mx-auto h-6 w-6 text-ink-400" aria-hidden="true" />
          <p className="text-xs font-semibold text-ink-700">Nothing free on this date</p>
          <p className="text-2xs text-ink-500">
            {filtered
              ? "Try another date, or widen the counselor filter above."
              : "Pick another date from the row above."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {PARTS.map((part) => {
            const list = groups[part.id];
            if (list.length === 0) return null;
            const Icon = part.icon;

            return (
              <div key={part.id} className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-ink-500">
                  <Icon className={cn("h-3.5 w-3.5", part.iconClass)} aria-hidden="true" />
                  {part.label}
                </h4>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {list.map((slot) => {
                    const timeStr = formatSlotTimeRange(slot.startTime, slot.endTime);
                    const count = slot.counselorIds.length;
                    const isOpen = count > 0;
                    const isSelected = selectedSlot?.startTime === slot.startTime;
                    // Every closed row used to read "fully booked". On today's
                    // date most of them are simply hours that have gone by, and
                    // telling a student the service is full when it is not is
                    // both untrue and discouraging. The server distinguishes the
                    // three cases; so does this.
                    const closedLabel =
                      slot.unavailableReason === "SLOT_IN_THE_PAST"
                        ? "already passed"
                        : slot.unavailableReason === "BLOCKED_BY_COUNSELOR"
                          ? "not offered"
                          : "fully booked";

                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        disabled={!isOpen}
                        onClick={() => onSelectSlot(slot)}
                        aria-pressed={isSelected}
                        aria-label={
                          isOpen
                            ? `${timeStr}, ${count} ${count === 1 ? "counselor" : "counselors"} free`
                            : `${timeStr}, ${closedLabel}`
                        }
                        className={cn(
                          "flex min-h-12 items-center justify-between gap-2 rounded-xl border px-3.5 text-left",
                          "text-sm font-semibold transition-colors",
                          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                          !isOpen
                            ? "cursor-not-allowed border-ink-200 bg-ink-50 text-ink-400"
                            : isSelected
                              ? "cursor-pointer border-plum-600 bg-plum-600 text-plum-50 shadow-sm"
                              : "cursor-pointer border-ink-200/80 bg-card text-ink-800 hover:border-plum-300 hover:bg-plum-50",
                        )}
                      >
                        {/* The strike belongs to the time, not to the row: it
                            used to be set on the button, which struck through
                            the reason label too. */}
                        <span className={cn("min-w-0 truncate", !isOpen && "line-through")}>
                          {timeStr}
                        </span>
                        {isOpen ? (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "shrink-0 rounded-md px-1.5 py-0.5 text-2xs font-bold",
                              isSelected ? "bg-plum-500 text-plum-50" : "bg-plum-50 text-plum-700",
                            )}
                          >
                            {count}
                          </span>
                        ) : (
                          <span
                            aria-hidden="true"
                            className="shrink-0 text-2xs font-bold text-ink-400"
                          >
                            {closedLabel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
