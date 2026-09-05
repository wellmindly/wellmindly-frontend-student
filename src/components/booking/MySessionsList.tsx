import { Calendar as CalendarIcon, Video, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import type { BookedSession } from './types';

export interface MySessionsListProps {
  loadingMySessions: boolean;
  mySessions: BookedSession[];
  onOpenFeedback: (session: BookedSession) => void;
  onOpenCancel: (session: BookedSession) => void;
  cancelStatusMessage: string | null;
  formatSessionDateTime: (isoString: string) => string;
}

export function MySessionsList({
  loadingMySessions,
  mySessions,
  onOpenFeedback,
  onOpenCancel,
  cancelStatusMessage,
  formatSessionDateTime,
}: MySessionsListProps) {
  return (
    <div className="bg-card rounded-3xl border border-ink-200/90 p-8 shadow-sm space-y-6">
      <div className="border-b border-ink-100 pb-4 space-y-1">
        <h2 className="text-2xl font-bold text-ink-900 font-display">My Booked Sessions</h2>
        <p className="text-ink-500 text-xs">Join your upcoming video consultations or leave feedback for completed sessions.</p>
        <p role="status" aria-live="polite" className="min-h-5 text-xs font-medium text-ink-600">
          {cancelStatusMessage}
        </p>
      </div>

      {loadingMySessions ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-plum-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ink-500 text-sm">Loading your booked sessions...</p>
        </div>
      ) : mySessions.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <CalendarIcon className="w-12 h-12 text-ink-300 mx-auto" />
          <h3 className="text-base font-bold text-ink-800">No session bookings found</h3>
          <p className="text-ink-500 text-xs max-w-sm mx-auto">
            You haven't scheduled any counselor sessions yet. Use the "Book a Counselor" tab to select a date and slot.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mySessions.map((session) => {
            const isConfirmed = session.status === 'CONFIRMED';
            const isCancelled = session.status === 'CANCELLED_BY_STUDENT' || session.status === 'CANCELLED_BY_COUNSELOR';
            const isCompleted = session.status === 'COMPLETED';
            const sessionTime = new Date(session.startTime).getTime();
            const isUpcoming = sessionTime > Date.now();
            const diffMinutes = Math.floor((sessionTime - Date.now()) / (1000 * 60));
            const canCancel = !isCancelled && !isCompleted && isUpcoming && diffMinutes >= 30;
            const tooCloseToCancel = !isCancelled && !isCompleted && isUpcoming && diffMinutes < 30;

            /* Nothing on the API moves a finished session out of CONFIRMED, so
               status alone cannot say whether a room is worth opening: a booking
               from last week was still offering a green "Join Meeting" that led
               to an empty Jitsi room. The clock decides instead - the room opens
               10 minutes early and stays open half an hour past the end, so an
               overrunning session never loses its link. */
            const endTime = session.endTime
              ? new Date(session.endTime).getTime()
              : sessionTime + 60 * 60 * 1000;
            const now = Date.now();
            const canJoin =
              isConfirmed && !isCancelled && now >= sessionTime - 10 * 60 * 1000 && now <= endTime + 30 * 60 * 1000;
            /* And a session that has not happened yet cannot be rated. This used
               to appear the moment a booking was made, which asks the student to
               score a conversation they have not had and feeds those scores into
               the counselor's public rating. */
            const canGiveFeedback = !session.studentFeedback && !isCancelled && now >= endTime;

            return (
              <div
                key={session.id}
                className="p-6 rounded-2xl border border-ink-200/90 bg-paper/50 hover:bg-card transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-plum-500 to-plum-600 text-plum-50 font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                    {session.counselor?.user?.firstName?.[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-ink-900 text-base">
                      Session with {session.counselor?.user?.firstName} {session.counselor?.user?.lastName}
                    </h4>
                    <p className="text-ink-500 text-xs mt-0.5">
                      Scheduled: <strong>{formatSessionDateTime(session.startTime)}</strong>
                    </p>
                    {isCancelled && (
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-ink-100 text-ink-600 rounded-lg text-xs font-semibold">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                  {canCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenCancel(session)}
                    >
                      Cancel session
                    </Button>
                  )}

                  {tooCloseToCancel && (
                    <span className="text-xs text-ink-400 font-medium">
                      Too close to start time to cancel online
                    </span>
                  )}

                  {canJoin && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-sage-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Meeting</span>
                    </a>
                  )}

                  {/* Says where the link went, so a booking made for next week
                      does not look like one that failed to get a room. */}
                  {isConfirmed && !isCancelled && !canJoin && isUpcoming && (
                    <span className="text-xs text-ink-400 font-medium">
                      Join link opens 10 minutes before
                    </span>
                  )}

                  {canGiveFeedback && (
                    <button
                      type="button"
                      onClick={() => onOpenFeedback(session)}
                      className="px-4 py-2.5 bg-gold-50 hover:bg-gold-100 text-gold-900 border border-gold-200/80 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Star className="w-4 h-4 text-gold-500 fill-gold-400" />
                      <span>Give Feedback</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
