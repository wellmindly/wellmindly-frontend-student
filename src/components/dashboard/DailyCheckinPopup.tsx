import { motion } from "framer-motion";
import { MOODS } from "../../lib/mood";
import { cn } from "../../lib/cn";
import { spring } from "../../lib/motion";
import { MoodFace } from "../ui/MoodFace";
import { Sheet } from "../ui";

interface DailyCheckinPopupProps {
  show: boolean;
  onClose: () => void;
  onSelect: (rating: number) => void;
}

/**
 * The day's first interaction, so it has to be the fastest one in the product:
 * one tap, no scrolling, no reading.
 *
 * Rebuilt on `Sheet`, which fixes the things the hand-rolled overlay got wrong -
 * it had no focus trap, no Escape handler, no dialog role, and a close button
 * with no accessible name. On mobile it is now a bottom sheet, which puts all
 * five targets inside thumb reach instead of floating them mid-screen.
 *
 * Each face carries its mood colour permanently rather than revealing it on
 * hover: hover doesn't exist on a phone, and showing the colours up front is
 * what teaches the scale used by the mood mosaic in the dashboard.
 */
export function DailyCheckinPopup({ show, onClose, onSelect }: DailyCheckinPopupProps) {
  return (
    <Sheet
      open={show}
      onClose={onClose}
      title="How are you feeling today?"
      description="Take a brief self-reflection moment to check in with your mind."
      size="sm"
    >
      <div className="grid grid-cols-5 gap-1.5 pt-1 pb-2 sm:gap-2.5">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.rating}
            type="button"
            onClick={() => {
              onSelect(mood.rating);
              onClose();
            }}
            aria-label={`${mood.label} - ${mood.summary.toLowerCase()}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.94 }}
            transition={spring.snappy}
            className={cn(
              "flex min-h-[5.25rem] cursor-pointer flex-col items-center justify-center gap-1.5",
              "rounded-2xl border bg-card px-0.5 py-2.5 transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
              mood.border,
              "hover:border-plum-300",
            )}
          >
            <span
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl",
                mood.soft,
                mood.text,
              )}
            >
              <MoodFace rating={mood.rating} className="h-7 w-7" />
            </span>
            <span className="text-2xs font-bold tracking-wide text-ink-600">{mood.label}</span>
          </motion.button>
        ))}
      </div>
    </Sheet>
  );
}
