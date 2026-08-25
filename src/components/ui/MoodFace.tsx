import type { MoodRating } from "../../lib/mood";
import { cn } from "../../lib/cn";

/**
 * The five check-in faces. Line-art rather than emoji so they inherit
 * currentColor, stay crisp at any size, and read as part of the product's own
 * visual language - the same reason the rest of the app uses lucide icons.
 *
 * Geometry is carried over from the original popup, which was the one part of
 * that component genuinely worth keeping: the mouth curve changes monotonically
 * across the scale, so the set reads as a progression rather than five
 * unrelated drawings.
 */

const MOUTHS: Record<MoodRating, string> = {
  1: "M8.5 16.2c.9-1.1 2.1-1.7 3.5-1.7s2.6.6 3.5 1.7",
  2: "M9 15.4a3.4 3.4 0 0 1 6 0",
  3: "M8.6 15.2h6.8",
  4: "M8.2 13.9s1.5 2.1 3.8 2.1 3.8-2.1 3.8-2.1",
  5: "M8 13.2s1.5 3.6 4 3.6 4-3.6 4-3.6",
};

/** Rating 5 gets slightly larger eyes - a bit more life at the top of the scale. */
const EYE_R: Record<MoodRating, number> = { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1.35 };
const EYE_Y: Record<MoodRating, number> = { 1: 9, 2: 9.5, 3: 9, 4: 9, 5: 9 };

export function MoodFace({
  rating,
  className,
}: {
  rating: MoodRating;
  className?: string;
}) {
  const eyeY = EYE_Y[rating];
  const eyeR = EYE_R[rating];
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
      focusable="false"
      className={cn("h-8 w-8", className)}
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d={MOUTHS[rating]} strokeLinecap="round" />
      <circle cx="9" cy={eyeY} r={eyeR} fill="currentColor" stroke="none" />
      <circle cx="15" cy={eyeY} r={eyeR} fill="currentColor" stroke="none" />
    </svg>
  );
}
