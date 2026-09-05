import { CheckCircle2 } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import type { Counselor } from './types';

export interface BookingSuccessModalProps {
  bookingSuccess: any | null;
  counselors: Counselor[];
  selectedCounselor: Counselor | null;
  onClose: () => void;
  formatSessionDateTime: (isoString: string) => string;
}

export function BookingSuccessModal({
  bookingSuccess,
  counselors,
  selectedCounselor,
  onClose,
  formatSessionDateTime,
}: BookingSuccessModalProps) {
  return (
    <Sheet
      open={bookingSuccess !== null}
      onClose={onClose}
      title="Session Confirmed!"
      description="Your private consultation has been booked. A confirmation email with meeting details has been sent to your inbox."
      size="sm"
    >
      {bookingSuccess && (
        <div className="text-center space-y-6 pt-2">
          <div className="w-16 h-16 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="bg-paper p-4 rounded-2xl border border-ink-200/80 text-left text-xs space-y-2">
            <p>
              <strong>Counselor:</strong>{' '}
              {counselors.find((c) => c.id === bookingSuccess.counselorId)?.name || selectedCounselor?.name}
            </p>
            <p><strong>Scheduled Time:</strong> {formatSessionDateTime(bookingSuccess.startTime)}</p>
            {/* `truncate` cut the link off mid-UUID ("...d994dc86-e45b-4055…"),
                which on the one screen that hands the student their video room
                is the wrong place to save a line. It wraps instead. */}
            <p className="break-all">
              <strong>Meeting Link:</strong>{' '}
              <a href={bookingSuccess.meetingLink} target="_blank" rel="noreferrer" className="text-plum-600 underline">
                {bookingSuccess.meetingLink}
              </a>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-ink-900 hover:bg-ink-800 text-ink-50 font-bold rounded-2xl shadow-lg text-xs"
          >
            Go to My Sessions
          </button>
        </div>
      )}
    </Sheet>
  );
}
