import { AlertCircle, CalendarCheck, User } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../ui";
import type { Counselor, SlotOption } from "./types";

/* ============================================================================
   BookingSummary
   ----------------------------------------------------------------------------
   The last thing standing between a student and a booked session, so it stays
   on screen: sticky above the mobile bottom nav, and it says who and when in
   full rather than making them scroll back up to check.
   ========================================================================= */

export interface BookingSummaryProps {
  counselor: Counselor | null;
  slot: SlotOption | null;
  bookingError: string | null;
  submitting: boolean;
  onSubmit: () => void;
  formatSessionDateTime: (isoString: string) => string;
}

export function BookingSummary({
  counselor,
  slot,
  bookingError,
  submitting,
  onSubmit,
  formatSessionDateTime,
}: BookingSummaryProps) {
  return (
    <div
      className={cn(
        "sticky z-[var(--z-sticky)] mt-5 rounded-2xl border border-ink-200/70 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md sm:px-5",
        // Clears the mobile bottom nav; on lg the nav is a sidebar, so it doesn't.
        "bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom)+0.5rem)] lg:bottom-4",
      )}
    >
      {bookingError && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2 rounded-2xl border border-coral-200 bg-coral-50 p-3 text-xs text-coral-800"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral-600" aria-hidden="true" />
          <span>{bookingError}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <dl className="min-w-0 space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-plum-600" aria-hidden="true" />
            <dt className="sr-only">Time</dt>
            <dd className="min-w-0 truncate font-semibold text-ink-900">
              {slot ? formatSessionDateTime(slot.startTime) : "No time picked yet"}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0 text-plum-600" aria-hidden="true" />
            <dt className="sr-only">Counselor</dt>
            <dd className="min-w-0 truncate text-ink-600">
              {counselor ? counselor.name : "Pick someone below"}
            </dd>
          </div>
        </dl>

        <Button
          onClick={onSubmit}
          disabled={!counselor || !slot}
          loading={submitting}
          loadingLabel="Booking your session"
          className="w-full sm:w-auto"
        >
          Submit and book
        </Button>
      </div>
    </div>
  );
}
