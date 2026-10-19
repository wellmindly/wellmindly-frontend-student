import { useRef } from "react";
import { Sparkles } from "lucide-react";
import type { CoachItem } from "./types";
import { Sheet, Button, Badge } from "../../ui";

export interface CoachBookingModalProps {
  selectedCoach: CoachItem | null;
  selectedSlot: number | null;
  bookingSlots: string[];
  onSelectSlot: (slotIndex: number) => void;
  onClose: () => void;
  onConfirm: () => void;
  onOpenEligibility?: () => void;
}

export function CoachBookingModal({
  selectedCoach,
  selectedSlot,
  bookingSlots,
  onSelectSlot,
  onClose,
  onConfirm,
  onOpenEligibility,
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
      {/* Eligibility Notice */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-plum-200 bg-plum-50/90 p-3 mb-4 text-xs">
        <Sparkles className="h-4 w-4 shrink-0 text-plum-600 mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <p className="font-bold text-plum-900">University students only for now</p>
          <p className="text-2xs text-plum-700 leading-relaxed mt-0.5">
            1-on-1 human coaching is currently open to university students. Not in uni?{" "}
            {onOpenEligibility && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEligibility();
                }}
                className="font-bold text-plum-900 underline hover:text-plum-700 cursor-pointer bg-transparent border-none p-0 inline"
              >
                Sign up for updates &rarr;
              </button>
            )}
          </p>
        </div>
      </div>

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
        These are example times. Sign in as a university student to book your session.
      </p>

      <Button
        variant="primary"
        size="lg"
        className="w-full justify-center min-h-12 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={selectedSlot === null}
        onClick={onConfirm}
      >
        Book a session
      </Button>
    </Sheet>
  );
}
