import { Star } from "lucide-react";
import { Sheet, Button } from "../ui";
import type { Counselor } from "./types";

/* ============================================================================
   CounselorBioModal
   ----------------------------------------------------------------------------
   Everything the thin picker card leaves out. This is where a student actually
   decides, so the choose action lives here rather than on the card.
   ========================================================================= */

export interface CounselorBioModalProps {
  counselor: Counselor | null;
  /** True when this is already the chosen counselor. */
  selected: boolean;
  onClose: () => void;
  onSelect: (counselor: Counselor) => void;
}

export function CounselorBioModal({
  counselor,
  selected,
  onClose,
  onSelect,
}: CounselorBioModalProps) {
  return (
    <Sheet
      open={counselor !== null}
      onClose={onClose}
      title={counselor?.name ?? ""}
      description={counselor?.credentials}
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Back to list
          </Button>
          <Button
            onClick={() => {
              if (counselor) onSelect(counselor);
              onClose();
            }}
            data-autofocus
          >
            {selected ? "Keep this counselor" : "Choose this counselor"}
          </Button>
        </div>
      }
    >
      {counselor && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-plum-100">
              {counselor.avatarUrl ? (
                <img src={counselor.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-2xl font-semibold text-plum-700">
                  {counselor.name.trim()[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </span>
            <div className="min-w-0">
              {counselor.totalReviews > 0 ? (
                <p className="flex items-center gap-1 text-xs font-bold text-gold-600">
                  <Star className="h-3.5 w-3.5 fill-gold-400" aria-hidden="true" />
                  <span>{counselor.averageRating}</span>
                  <span className="font-normal text-ink-500">
                    ({counselor.totalReviews} {counselor.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                </p>
              ) : (
                <p className="text-xs font-medium text-ink-500">No reviews yet</p>
              )}
              {selected && (
                <p className="mt-1 text-2xs font-bold uppercase tracking-wide text-plum-700">
                  Currently selected
                </p>
              )}
            </div>
          </div>

          {counselor.bio && (
            <section className="space-y-2">
              <h3 className="text-2xs font-bold uppercase tracking-wide text-ink-500">About</h3>
              <p className="whitespace-pre-line rounded-2xl border border-ink-100 bg-paper p-4 text-sm leading-relaxed text-ink-700">
                {counselor.bio}
              </p>
            </section>
          )}

          {counselor.specializations.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-2xs font-bold uppercase tracking-wide text-ink-500">
                Areas of expertise
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {counselor.specializations.map((spec) => (
                  <li
                    key={spec}
                    className="rounded-lg border border-plum-100 bg-plum-50 px-3 py-1 text-xs font-semibold text-plum-700"
                  >
                    {spec}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Sheet>
  );
}
