import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Star,
  CheckCircle2,
  Video,
  ArrowRight,
  X,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

interface Counselor {
  id: string;
  userId: string;
  name: string;
  credentials: string;
  specializations: string[];
  bio: string;
  avatarUrl: string;
  averageRating: number;
  totalReviews: number;
}

interface Slot {
  startTime: string;
  endTime: string;
  counselorId: string;
  isAvailable: boolean;
}

export const CounselorBookingView: React.FC = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking Confirmation Modal
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // My Booked Sessions
  const [activeTab, setActiveTab] = useState<'book' | 'my-sessions'>('book');
  const [mySessions, setMySessions] = useState<any[]>([]);
  const [loadingMySessions, setLoadingMySessions] = useState(false);

  // Post-session Student Feedback Modal
  const [activeFeedbackSession, setActiveFeedbackSession] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  // Fetch active counselors
  useEffect(() => {
    axios
      .get(`${API_BASE}/students/counselors`, { headers: getHeaders() })
      .then((res) => {
        if (res.data.success) {
          setCounselors(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load counselors:', err))
      .finally(() => setLoadingCounselors(false));
  }, []);

  // Fetch slots whenever selectedCounselor or selectedDate changes
  useEffect(() => {
    setLoadingSlots(true);
    let url = `${API_BASE}/students/counselors/slots?date=${selectedDate}`;
    if (selectedCounselor) {
      url += `&counselorId=${selectedCounselor.id}`;
    }

    axios
      .get(url, { headers: getHeaders() })
      .then((res) => {
        if (res.data.success) {
          if (selectedCounselor) {
            setSlots(res.data.data.slots || []);
          } else {
            // Aggregate all available slots across counselors
            const allSlots: Slot[] = [];
            res.data.data.forEach((cItem: any) => {
              allSlots.push(...(cItem.slots || []));
            });
            setSlots(allSlots);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch slots:', err))
      .finally(() => setLoadingSlots(false));
  }, [selectedCounselor, selectedDate]);

  const fetchMySessions = () => {
    setLoadingMySessions(true);
    axios
      .get(`${API_BASE}/students/sessions/me`, { headers: getHeaders() })
      .then((res) => {
        if (res.data.success) {
          setMySessions(res.data.data);
        }
      })
      .finally(() => setLoadingMySessions(false));
  };

  useEffect(() => {
    if (activeTab === 'my-sessions') {
      fetchMySessions();
    }
  }, [activeTab]);

  const handleBookSession = async () => {
    if (!selectedCounselor || !selectedSlot) return;
    setConfirmingBooking(true);
    setBookingError(null);

    try {
      const res = await axios.post(
        `${API_BASE}/students/sessions/book`,
        {
          counselorId: selectedCounselor.id,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        },
        { headers: getHeaders() }
      );

      if (res.data.success) {
        setBookingSuccess(res.data.data);
      }
    } catch (err: any) {
      setBookingError(
        err.response?.data?.error?.message || 'Failed to book session. Please try another slot.'
      );
    } finally {
      setConfirmingBooking(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!activeFeedbackSession) return;
    setSubmittingFeedback(true);

    try {
      await axios.post(
        `${API_BASE}/students/sessions/${activeFeedbackSession.id}/feedback`,
        { rating, comments },
        { headers: getHeaders() }
      );
      setActiveFeedbackSession(null);
      fetchMySessions();
    } catch (err) {
      alert('Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Sub-header Navigation Tabs */}
      <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('book')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
              activeTab === 'book'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Book a Counselor Session</span>
          </button>

          <button
            onClick={() => setActiveTab('my-sessions')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 ${
              activeTab === 'my-sessions'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Booked Sessions</span>
          </button>
        </div>
      </div>

      {activeTab === 'book' ? (
        <div className="space-y-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium uppercase tracking-wider flex items-center space-x-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Professional Support</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
                Book a 1-on-1 Session with a Counselor
              </h1>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl">
                Choose a verified therapist or counselor, pick your preferred date and time, and instantly receive your video meeting link.
              </p>
            </div>
          </div>

          {/* Bi-directional Interactive Booking Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1 & 2: Counselors Fancy Directory */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedCounselor ? 'Selected Counselor' : 'Available Counselors'}
                </h2>
                {selectedCounselor && (
                  <button
                    onClick={() => {
                      setSelectedCounselor(null);
                      setSelectedSlot(null);
                    }}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Clear Filter</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {loadingCounselors ? (
                <div className="p-8 text-center text-slate-500 text-sm">Loading counselors...</div>
              ) : counselors.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-sm">
                  No active counselors available at this moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {counselors.map((counselor) => {
                    const isSelected = selectedCounselor?.id === counselor.id;
                    return (
                      <div
                        key={counselor.id}
                        onClick={() => setSelectedCounselor(counselor)}
                        className={`bg-white rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                          isSelected
                            ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                            : 'border-slate-200/80 hover:border-emerald-300'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                              {counselor.avatarUrl ? (
                                <img src={counselor.avatarUrl} alt={counselor.name} className="w-full h-full object-cover" />
                              ) : (
                                counselor.name[0]
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-base">{counselor.name}</h3>
                              <p className="text-emerald-700 text-xs font-semibold">{counselor.credentials}</p>
                              <div className="flex items-center space-x-1 mt-1 text-amber-500 text-xs font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{counselor.averageRating}</span>
                                <span className="text-slate-400 font-normal">({counselor.totalReviews} reviews)</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {counselor.specializations.map((spec, i) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-semibold">
                                {spec}
                              </span>
                            ))}
                          </div>

                          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{counselor.bio}</p>
                        </div>

                        <button
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          {isSelected ? 'Counselor Selected ✓' : 'Select Counselor'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Column 3: Interactive Date & Time Slot Picker */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6 h-fit">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5 text-emerald-600" />
                  <span>Select Date & Slot</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Time slots automatically update in UTC</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Available Time Slots ({slots.length})
                </label>

                {loadingSlots ? (
                  <p className="text-slate-400 text-xs py-4 text-center">Checking slots availability...</p>
                ) : slots.length === 0 ? (
                  <p className="text-slate-400 text-xs py-4 text-center bg-slate-50 rounded-xl">
                    No available slots on this date.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {slots.map((slot, i) => {
                      const start = new Date(slot.startTime);
                      const timeString = start.toUTCString().split(' ')[4].substring(0, 5) + ' UTC';
                      const isSelected = selectedSlot?.startTime === slot.startTime;

                      return (
                        <button
                          key={i}
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2.5 px-3 rounded-xl font-semibold text-xs border transition-all ${
                            !slot.isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                          }`}
                        >
                          {timeString}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {bookingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Book Button CTA */}
              <button
                disabled={!selectedCounselor || !selectedSlot || confirmingBooking}
                onClick={handleBookSession}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center space-x-2"
              >
                <span>{confirmingBooking ? 'Booking Session...' : 'Confirm & Book Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* My Booked Sessions Tab */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Booked Sessions</h2>
            <p className="text-slate-500 text-xs mt-1">Join your upcoming video calls or submit post-session feedback</p>
          </div>

          {loadingMySessions ? (
            <p className="text-slate-400 text-sm">Loading your sessions...</p>
          ) : mySessions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              You haven't booked any counseling sessions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {mySessions.map((session) => {
                const start = new Date(session.startTime);
                const isConfirmed = session.status === 'CONFIRMED';

                return (
                  <div key={session.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base">
                        {session.counselor?.user?.firstName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          Session with {session.counselor?.user?.firstName} {session.counselor?.user?.lastName}
                        </h4>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Date (UTC): <strong>{start.toUTCString()}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {isConfirmed && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                        >
                          <Video className="w-4 h-4" />
                          <span>Join Meeting</span>
                        </a>
                      )}

                      {!session.studentFeedback && (
                        <button
                          onClick={() => {
                            setActiveFeedbackSession(session);
                            setRating(5);
                            setComments('');
                          }}
                          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                        >
                          <Star className="w-4 h-4 text-amber-500" />
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
      )}

      {/* Booking Confirmation / Success Modal */}
      {bookingSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">Session Confirmed!</h3>
              <p className="text-slate-500 text-sm mt-1">
                Your session has been successfully booked. An email confirmation has been sent to your inbox.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
              <p><strong>Counselor:</strong> {selectedCounselor?.name}</p>
              <p><strong>Scheduled Time:</strong> {new Date(bookingSuccess.startTime).toUTCString()}</p>
              <p className="truncate"><strong>Meeting Link:</strong> <a href={bookingSuccess.meetingLink} target="_blank" rel="noreferrer" className="text-emerald-600 underline">{bookingSuccess.meetingLink}</a></p>
            </div>

            <button
              onClick={() => {
                setBookingSuccess(null);
                setSelectedSlot(null);
                setActiveTab('my-sessions');
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 text-sm"
            >
              Go to My Sessions
            </button>
          </div>
        </div>
      )}

      {/* Student Feedback Modal */}
      {activeFeedbackSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Counselor Session Feedback</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Rating Stars (1 to 5)</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Outstanding)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5 - Good)</option>
                <option value={3}>⭐⭐⭐ (3/5 - Average)</option>
                <option value={2}>⭐⭐ (2/5 - Fair)</option>
                <option value={1}>⭐ (1/5 - Poor)</option>
              </select>
            </div>
            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us about your session experience..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveFeedbackSession(null)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-emerald-700"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
