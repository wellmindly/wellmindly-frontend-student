import { useRef } from "react";
import type { CoachItem } from "./types";
import { Sheet, Button, Badge } from "../../ui";

export interface CoachBookingModalProps {
  selectedCoach: CoachItem | null;
  selectedSlot: number | null;
  bookingSlots: string[];
  onSelectSlot: (slotIndex: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function CoachBookingModal({
  selectedCoach,
  selectedSlot,
  bookingSlots,
  onSelectSlot,
  onClose,
  onConfirm,
}: CoachBookingModalProps) {
  const lastCoachRef = useRef<CoachItem | null>(null);
  if (selectedCoach) {
    lastCoachRef.current = selectedCoach;
  }
  const coach = selectedCoach ?? lastCoachRef.current;

  return (
    <Sheet
      open={selectedCoach !== null}
      onClose={onClose}
      title={coach ? `Book with ${coach.name.split(" ")[0]}` : "Book Session"}
      description={coach?.role}
      size="sm"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-bold text-ink-900 uppercase tracking-wider">
          Example slots
        </span>
        <Badge tone="primary" size="sm">
          Preview
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {bookingSlots.map((slot, idx) => (
          <button
            type="button"
            key={slot}
            onClick={() => onSelectSlot(idx)}
            className={`px-3 py-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer min-h-11 ${
              selectedSlot === idx
                ? "bg-plum-600 border-plum-600 text-plum-50"
                : "bg-card border-ink-200 text-ink-600 hover:border-ink-400 hover:text-ink-900"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      <p className="text-2xs text-ink-500 text-center mb-3">
        These are example times — sign in to see when this coach is actually free.
      </p>

      <Button
        variant="primary"
        size="lg"
        className="w-full justify-center min-h-12 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={selectedSlot === null}
        onClick={onConfirm}
      >
        Sign in to book
      </Button>
    </Sheet>
  );
}
