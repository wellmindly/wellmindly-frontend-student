import { Sheet } from '../ui/Sheet';
import { Chip } from '../ui/Badge';
import type { BookedSession } from './types';

export interface SessionFeedbackModalProps {
  activeFeedbackSession: BookedSession | null;
  rating: number | null;
  setRating: (rating: number | null) => void;
  comments: string;
  setComments: (comments: string) => void;
  feedbackError: string | null;
  setFeedbackError: (error: string | null) => void;
  submittingFeedback: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function SessionFeedbackModal({
  activeFeedbackSession,
  rating,
  setRating,
  comments,
  setComments,
  feedbackError,
  setFeedbackError,
  submittingFeedback,
  onClose,
  onSubmit,
}: SessionFeedbackModalProps) {
  const ratingId = "session-feedback-rating";

  return (
    <Sheet
      open={activeFeedbackSession !== null}
      onClose={onClose}
      title="Session Feedback"
      description="Help us maintain care standards for your peers."
      size="md"
    >
      {activeFeedbackSession && (
        <div className="space-y-5 pt-2">
          <div className="space-y-2.5">
            <h3 id={ratingId} className="text-sm font-semibold text-ink-800">
              How was this session for you?
            </h3>
            <div role="group" aria-labelledby={ratingId} className="flex flex-wrap gap-2">
              {[
                { value: 1, label: "Not helpful" },
                { value: 2, label: "A little" },
                { value: 3, label: "Somewhat" },
                { value: 4, label: "Quite helpful" },
                { value: 5, label: "Very helpful" },
              ].map((opt) => (
                <Chip
                  key={opt.value}
                  selected={rating === opt.value}
                  onClick={() => {
                    setRating(opt.value);
                    setFeedbackError(null);
                  }}
                >
                  {opt.label}
                </Chip>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Tell us about your session experience..."
            className="w-full px-4 py-3 rounded-2xl border border-ink-200 text-xs focus:outline-none focus:ring-2 focus:ring-plum-500 resize-none bg-paper"
          />

          <p role="status" aria-live="polite" className="min-h-5 text-center text-xs font-medium text-danger">
            {feedbackError}
          </p>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-ink-500 hover:text-ink-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={rating === null || submittingFeedback}
              className="px-6 py-2.5 bg-plum-600 text-plum-50 rounded-2xl text-xs font-bold shadow-md hover:bg-plum-700 disabled:opacity-50"
            >
              {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
