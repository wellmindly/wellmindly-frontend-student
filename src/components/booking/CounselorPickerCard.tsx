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
  const apiOrigin = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.wellmindly.com' : 'http://localhost:5000')).replace(/\/api\/?$/, '');
  const resolvedAvatar = counselor.avatarUrl && counselor.avatarUrl.startsWith('/api/')
    ? `${apiOrigin}${counselor.avatarUrl}`
    : counselor.avatarUrl;

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
        {resolvedAvatar ? (
          <img
            src={resolvedAvatar}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <span className={cn("absolute inset-0 flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-plum-700", resolvedAvatar && "-z-10")}>
          {initial}
        </span>
      </span>

      <span className="block min-w-0 w-full">
        <span className="block truncate text-sm font-semibold text-ink-900">{counselor.name}</span>
        {/* The card's job is to open the details modal, so the state has to reach a
            screen reader some other way than a pressed-button role. */}
        {selected && <span className="sr-only">Selected. </span>}
        <span className="mt-0.5 inline-flex items-center gap-1 text-2xs font-bold text-amber-600">
          <Star className="h-3 w-3 fill-amber-400 text-amber-500" aria-hidden="true" />
          {counselor.averageRating ? counselor.averageRating.toFixed(1) : "5.0"}
          <span className="font-normal text-ink-500">
            {counselor.totalReviews > 0 ? `(${counselor.totalReviews})` : "(Verified)"}
          </span>
        </span>
      </span>
    </button>
  );
}
