import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { CoachItem } from "./types";
import { buttonClasses } from "../../ui";

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
  return (
    <AnimatePresence>
      {selectedCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-paper border border-ink-200 rounded-3xl max-w-md w-full p-8 shadow-2xl relative"
          >
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ink-100/60 hover:bg-ink-200/80 transition-colors flex items-center justify-center text-ink-600 hover:text-ink-900 cursor-pointer border-none"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-2xl font-medium mb-1 text-ink-900">
              Book with {selectedCoach.name.split(" ")[0]}
            </h3>
            <p className="text-xs text-ink-600 mb-6">
              {selectedCoach.role} &middot; Your free university session
            </p>

            <div className="text-xs font-bold text-ink-900 uppercase tracking-wider mb-2.5">
              Available slots
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {bookingSlots.map((slot, idx) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => onSelectSlot(idx)}
                  className={`px-3 py-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    selectedSlot === idx 
                      ? "bg-plum-600 border-plum-600 text-white"
                      : "bg-white border-ink-200 text-ink-600 hover:border-ink-400 hover:text-ink-900"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            <p className="text-2xs text-ink-500 text-center mb-3">
              Sign in to confirm — we'll bring your choice with you.
            </p>

            <button
              type="button"
              onClick={onConfirm}
              disabled={selectedSlot === null}
              className={buttonClasses("primary", "lg", "w-full justify-center min-h-12 disabled:opacity-40 disabled:cursor-not-allowed")}
            >
              Sign in to book
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
