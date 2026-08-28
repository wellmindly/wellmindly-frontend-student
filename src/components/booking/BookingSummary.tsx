import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import type { Slot, Counselor } from './types';

export interface BookingSummaryProps {
  selectedSlot: Slot | null;
  selectedCounselor: Counselor | null;
  counselors: Counselor[];
  bookingError: string | null;
  confirmingBooking: boolean;
  onBookSession: () => void;
  formatSessionDateTime: (isoString: string) => string;
}

export function BookingSummary({
  selectedSlot,
  selectedCounselor,
  counselors,
  bookingError,
  confirmingBooking,
  onBookSession,
  formatSessionDateTime,
}: BookingSummaryProps) {
  return (
    <>
      {/* Selection Summary Box */}
      {selectedSlot && (
        <div className="bg-plum-50/80 border border-plum-200/80 p-4 rounded-2xl space-y-2 text-xs">
          <div className="font-bold text-plum-900 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-plum-600 shrink-0" />
            <span>Booking Summary</span>
          </div>
          <div className="space-y-1 text-plum-900 font-medium">
            <p>
              Counselor:{' '}
              <strong>
                {selectedCounselor
                  ? selectedCounselor.name
                  : selectedSlot.counselorName || counselors.find((c) => c.id === selectedSlot.counselorId)?.name}
              </strong>
            </p>
            <p>
              Time: <strong>{formatSessionDateTime(selectedSlot.startTime)}</strong>
            </p>
          </div>
        </div>
      )}

      {bookingError && (
        <div className="p-3.5 rounded-2xl bg-coral-50 border border-coral-200 text-coral-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-coral-600" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* Main Booking CTA */}
      <button
        disabled={!selectedSlot || confirmingBooking}
        onClick={onBookSession}
        className="w-full py-4 bg-ink-900 hover:bg-ink-800 text-ink-50 font-bold text-sm rounded-2xl shadow-xl transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center space-x-2"
      >
        <span>{confirmingBooking ? 'Booking Session...' : 'Confirm & Book Session'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </>
  );
}
