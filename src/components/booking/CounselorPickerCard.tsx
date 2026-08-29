import { Check, Star } from "lucide-react";
import { cn } from "../../lib/cn";
import type { Counselor } from "./types";

/* ============================================================================
   CounselorPickerCard
   ----------------------------------------------------------------------------
   Step two of booking. Deliberately thin: photo, name, and whether they are the
   one you picked. The old card carried credentials, a rating, every
   specialization badge and a three-line bio, which is why ten counselors meant
   scrolling past a wall of text before you could get to a time.

   The detail lives one tap away in the modal instead of all of it up front.
   ========================================================================= */

export interface CounselorPickerCardProps {
  counselor: Counselor;
  selected: boolean;
  onOpenDetails: (counselor: Counselor) => void;
}

export function CounselorPickerCard({
  counselor,
  selected,
  onOpenDetails,
}: CounselorPickerCardProps) {
  const initial = counselor.name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <button
      type="button"
      onClick={() => onOpenDetails(counselor)}
      className={cn(
        "group relative flex w-full flex-col items-center gap-3 rounded-3xl border bg-card p-4 text-center",
        "transition-[border-color,box-shadow,transform] duration-200 cursor-pointer",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
        "hover:-translate-y-0.5 hover:shadow-lg motion-reduce:hover:translate-y-0",
        selected
          ? "border-plum-500 shadow-md ring-2 ring-plum-200"
          : "border-ink-200/80 shadow-sm hover:border-plum-200",
      )}
    >
      {selected && (
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-plum-600 text-plum-50 shadow-sm"
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      )}

      <span className="relative block h-20 w-20 overflow-hidden rounded-full bg-plum-100 sm:h-24 sm:w-24">
        {counselor.avatarUrl ? (
          <img
            src={counselor.avatarUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-plum-700">
            {initial}
          </span>
        )}
      </span>

      <span className="block min-w-0 w-full">
        <span className="block truncate text-sm font-semibold text-ink-900">{counselor.name}</span>
        {/* The card's job is to open the details modal, so the state has to reach a
            screen reader some other way than a pressed-button role. */}
        {selected && <span className="sr-only">Selected. </span>}
        {counselor.totalReviews > 0 ? (
          <span className="mt-0.5 inline-flex items-center gap-1 text-2xs font-bold text-gold-600">
            <Star className="h-3 w-3 fill-gold-400" aria-hidden="true" />
            {counselor.averageRating}
            <span className="font-normal text-ink-500">({counselor.totalReviews})</span>
          </span>
        ) : (
          <span className="mt-0.5 block text-2xs text-ink-500">View details</span>
        )}
      </span>
    </button>
  );
}
