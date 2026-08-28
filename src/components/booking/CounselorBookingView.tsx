import { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  Sparkles,
  Search,
  X,
  User,
  Globe,
} from 'lucide-react';
import type { Counselor, Slot, BookedSession } from './types';
import { CounselorCard } from './CounselorCard';
import { DateStrip } from './DateStrip';
import { SlotGrid } from './SlotGrid';
import { BookingSummary } from './BookingSummary';
import { MySessionsList } from './MySessionsList';
import { CounselorBioModal } from './CounselorBioModal';
import { BookingSuccessModal } from './BookingSuccessModal';
import { SessionFeedbackModal } from './SessionFeedbackModal';
import { ConfirmSheet } from '../ui/Sheet';
import api from '../../services/api';

export const toLocalISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function CounselorBookingView() {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(toLocalISODate(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [loadingCounselors, setLoadingCounselors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Timezone preference (Default to UTC as requested)
  const [timezoneMode, setTimezoneMode] = useState<'utc' | 'local'>('utc');

  // Full Bio Modal state
  const [bioModalCounselor, setBioModalCounselor] = useState<Counselor | null>(null);

  // Booking Confirmation Modal
  const [confirmingBooking, setConfirmingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // My Booked Sessions
  const [activeTab, setActiveTab] = useState<'book' | 'my-sessions'>('book');
  const [mySessions, setMySessions] = useState<BookedSession[]>([]);
  const [loadingMySessions, setLoadingMySessions] = useState(false);

  // Post-session Student Feedback Modal
  const [activeFeedbackSession, setActiveFeedbackSession] = useState<BookedSession | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Cancellation State
  const [cancelTarget, setCancelTarget] = useState<BookedSession | null>(null);
  const [cancellingSession, setCancellingSession] = useState(false);
  const [cancelStatusMessage, setCancelStatusMessage] = useState<string | null>(null);

  const handleCloseFeedback = () => {
    setActiveFeedbackSession(null);
    setRating(null);
    setComments('');
    setFeedbackError(null);
  };

  // Detect local timezone string (e.g., "IST", "EST")
  const localTzAbbr = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
        .formatToParts(new Date())
        .find((part) => part.type === 'timeZoneName')?.value || 'Local';
    } catch (e) {
      return 'Local';
    }
  }, []);

  // Fetch active counselors
  useEffect(() => {
    api
      .get('/v1/students/counselors')
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
    let url = `/v1/students/counselors/slots?date=${selectedDate}`;
    if (selectedCounselor) {
      url += `&counselorId=${selectedCounselor.id}`;
    }

    api
      .get(url)
      .then((res) => {
        if (res.data.success) {
          if (selectedCounselor) {
            setSlots(res.data.data.slots || []);
          } else {
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
    api
      .get('/v1/students/sessions/me')
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

  // Next 7 Days generator for quick date navigation
  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = toLocalISODate(d);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
      const fullLabel = i === 0 ? `Today, ${fullDate}` : fullDate;
      days.push({ iso, dayName, monthDay, fullLabel });
    }
    return days;
  }, []);

  // Filter counselors by search and category
  const filteredCounselors = useMemo(() => {
    return counselors.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.credentials.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.specializations.some((s) => s.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'youth') {
        return c.specializations.some((s) => /adolescent|youth|student/i.test(s));
      }
      if (selectedCategory === 'stress') {
        return c.specializations.some((s) => /stress|overwhelm|load/i.test(s));
      }
      if (selectedCategory === 'anxiety') {
        return c.specializations.some((s) => /anxiety|depression|mood|cbt/i.test(s));
      }
      if (selectedCategory === 'coaching') {
        return c.specializations.some((s) => /mindset|coaching|transformation|healing/i.test(s));
      }
      if (selectedCategory === 'behavioral') {
        return c.specializations.some((s) => /aba|autism|adhd|special|behavior/i.test(s));
      }
      return true;
    });
  }, [counselors, searchQuery, selectedCategory]);

  // Deduplicate and process slots so duplicate start times never appear
  const processedSlots = useMemo(() => {
    if (selectedCounselor) {
      const map = new Map<string, Slot>();
      slots.forEach((s) => {
        if (!map.has(s.startTime) || (s.isAvailable && !map.get(s.startTime)?.isAvailable)) {
          map.set(s.startTime, {
            ...s,
            counselorName: selectedCounselor.name,
          });
        }
      });
      return Array.from(map.values()).sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    }

    // When all counselors are shown: Group by unique startTime
    const slotMap = new Map<string, { slot: Slot; counselorIds: string[] }>();
    slots.forEach((s) => {
      const c = counselors.find((item) => item.id === s.counselorId);
      if (!slotMap.has(s.startTime)) {
        slotMap.set(s.startTime, {
          slot: {
            ...s,
            counselorName: c?.name || '',
          },
          counselorIds: s.isAvailable ? [s.counselorId] : [],
        });
      } else {
        const existing = slotMap.get(s.startTime)!;
        if (s.isAvailable && !existing.counselorIds.includes(s.counselorId)) {
          existing.counselorIds.push(s.counselorId);
        }
        if (s.isAvailable) {
          existing.slot.isAvailable = true;
        }
      }
    });

    return Array.from(slotMap.values())
      .map((item) => ({
        ...item.slot,
        availableCount: item.counselorIds.length,
      }))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [slots, selectedCounselor, counselors]);

  // Format slot time range for display (e.g. "08:00 – 09:00 UTC" or "01:30 PM – 02:30 PM IST")
  const formatSlotTimeRange = (startTimeIso: string, endTimeIso: string) => {
    const start = new Date(startTimeIso);
    const end = new Date(endTimeIso);

    if (timezoneMode === 'utc') {
      const startH = String(start.getUTCHours()).padStart(2, '0');
      const startM = String(start.getUTCMinutes()).padStart(2, '0');
      const endH = String(end.getUTCHours()).padStart(2, '0');
      const endM = String(end.getUTCMinutes()).padStart(2, '0');
      return `${startH}:${startM} - ${endH}:${endM} UTC`;
    }

    const startStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const endStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${startStr} - ${endStr}`;
  };

  // Format full date & time for session confirmations & cards accurately
  const formatSessionDateTime = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    if (timezoneMode === 'utc') {
      const year = d.getUTCFullYear();
      const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
      const day = d.getUTCDate();
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const mins = String(d.getUTCMinutes()).padStart(2, '0');
      return `${month} ${day}, ${year} at ${hours}:${mins} UTC`;
    }

    return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} (${localTzAbbr})`;
  };

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];

    processedSlots.forEach((slot) => {
      const d = new Date(slot.startTime);
      const hour = timezoneMode === 'utc' ? d.getUTCHours() : d.getHours();

      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [processedSlots, timezoneMode]);

  const handleBookSession = async () => {
    const counselorIdToBook = selectedCounselor ? selectedCounselor.id : selectedSlot?.counselorId;

    if (!counselorIdToBook || !selectedSlot) {
      setBookingError('Please select a counselor or pick an available time slot.');
      return;
    }

    setConfirmingBooking(true);
    setBookingError(null);

    try {
      const res = await api.post(
        '/v1/students/sessions/book',
        {
          counselorId: counselorIdToBook,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        }
      );

      if (res.data.success) {
        setBookingSuccess(res.data.data);
      }
    } catch (err: any) {
      setBookingError(
        err.response?.data?.error?.message || err.response?.data?.error || 'Failed to book session. Please try another slot.'
      );
    } finally {
      setConfirmingBooking(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!activeFeedbackSession) return;
    if (rating === null) {
      setFeedbackError('Please tell us how the session was.');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      await api.post(
        `/v1/students/sessions/${activeFeedbackSession.id}/feedback`,
        { rating, comments }
      );
      handleCloseFeedback();
      fetchMySessions();
    } catch (err: any) {
      setFeedbackError(err.response?.data?.error || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setCancellingSession(true);
    setCancelStatusMessage(null);

    try {
      await api.post(`/v1/students/sessions/${cancelTarget.id}/cancel`, {});
      setCancelTarget(null);
      setCancelStatusMessage('That session is cancelled. The slot is free again.');
      fetchMySessions();
    } catch (err: any) {
      if (err.response?.data?.error?.code === 'CANCELLATION_RESTRICTED') {
        setCancelStatusMessage('That session starts too soon to cancel online. Please contact us instead.');
      } else {
        setCancelStatusMessage("We couldn't cancel that session. Please try again in a moment.");
      }
      setCancelTarget(null);
    } finally {
      setCancellingSession(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/90 backdrop-blur-xl p-3 rounded-3xl border border-ink-200/80 shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'book'
                ? 'bg-ink-900 text-ink-50 shadow-md'
                : 'text-ink-600 hover:bg-paper/80'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Book a Counselor</span>
          </button>

          <button
            onClick={() => setActiveTab('my-sessions')}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'my-sessions'
                ? 'bg-ink-900 text-ink-50 shadow-md'
                : 'text-ink-600 hover:bg-paper/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Booked Sessions</span>
            {mySessions.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-plum-500/20 text-plum-700 text-2xs font-extrabold">
                {mySessions.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-ink-700 bg-paper/90 px-4 py-2 rounded-2xl border border-ink-200/80">
          <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
          <span>One-to-one counseling</span>
        </div>
      </div>

      {activeTab === 'book' ? (
        <div className="space-y-8">
          {/* Main Hero Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-ink-900 via-plum-900 to-ink-900 rounded-3xl p-8 sm:p-10 text-ink-50 shadow-2xl border border-plum-500/20">
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-plum-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-card/10 backdrop-blur-md border border-card/15 text-plum-200 text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-plum-300" />
                <span>Dedicated Peer Counseling and Guidance</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-display text-ink-50 leading-tight">
                Talk to Someone Who Truly Understands Student Life
              </h1>

              <p className="text-ink-300 text-sm sm:text-base leading-relaxed font-normal">
                Book a one-to-one session with a member of our counseling team. You choose the day and the time, and the session happens over a private video link.
              </p>
            </div>
          </div>

          {/* Category Filter Pills and Search Bar */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-ink-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search counselor by name, credential, or specialty..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-ink-200/90 text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-plum-500 shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {[
                  { id: 'all', label: 'All Counselors' },
                  { id: 'youth', label: 'Youth and Students' },
                  { id: 'stress', label: 'Stress and Workload' },
                  { id: 'anxiety', label: 'Anxiety and Mood' },
                  { id: 'coaching', label: 'Mindset Coaching' },
                  { id: 'behavioral', label: 'Specialized Care' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-plum-600 text-plum-50 shadow-md shadow-plum-200'
                        : 'bg-card text-ink-600 border border-ink-200/80 hover:bg-paper'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Counselors Grid */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-ink-900 font-display">
                    {selectedCounselor ? 'Selected Counselor' : 'Available Counselors'}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-ink-100 text-ink-600 rounded-full text-xs font-extrabold">
                    {filteredCounselors.length}
                  </span>
                </div>

                {selectedCounselor && (
                  <button
                    onClick={() => {
                      setSelectedCounselor(null);
                      setSelectedSlot(null);
                    }}
                    className="text-xs font-bold text-plum-600 hover:text-plum-800 flex items-center space-x-1 transition-colors"
                  >
                    <span>Show All Counselors</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {loadingCounselors ? (
                <div className="py-20 text-center space-y-3 bg-card rounded-3xl border border-ink-200">
                  <div className="w-8 h-8 border-3 border-plum-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-ink-500 text-sm font-medium">Loading counselor directory...</p>
                </div>
              ) : filteredCounselors.length === 0 ? (
                <div className="py-16 px-6 text-center space-y-3 bg-card rounded-3xl border border-ink-200">
                  <User className="w-10 h-10 text-ink-300 mx-auto" />
                  <h3 className="text-base font-bold text-ink-800">No counselors match your filter</h3>
                  <p className="text-ink-500 text-xs max-w-sm mx-auto">
                    Try searching for a different keyword or reset your category selection to view all available counselors.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2 bg-plum-50 text-plum-600 font-bold text-xs rounded-xl hover:bg-plum-100 transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredCounselors.map((counselor) => {
                    const isSelected = selectedCounselor?.id === counselor.id;
                    return (
                      <CounselorCard
                        key={counselor.id}
                        counselor={counselor}
                        isSelected={isSelected}
                        onSelect={setSelectedCounselor}
                        onOpenBio={setBioModalCounselor}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Interactive Date and Time Picker Panel */}
            <div className="lg:col-span-5 bg-card rounded-3xl border border-ink-200/90 p-6 sm:p-7 shadow-lg shadow-ink-100 space-y-6 lg:sticky lg:top-8">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-ink-100 pb-4">
                <div>
                  <h3 className="font-bold text-ink-900 text-lg font-display flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-plum-600" />
                    <span>Select Date and Time</span>
                  </h3>
                  <p className="text-ink-500 text-xs mt-0.5">
                    {selectedCounselor ? (
                      <span>Booking with <strong>{selectedCounselor.name}</strong></span>
                    ) : (
                      'Showing available slots across counselors'
                    )}
                  </p>
                </div>

                {/* Timezone Toggle Pill */}
                <button
                  onClick={() => setTimezoneMode(timezoneMode === 'local' ? 'utc' : 'local')}
                  className="px-3 py-1.5 bg-paper hover:bg-ink-100 text-ink-800 rounded-xl text-2xs font-bold transition-all flex items-center space-x-1.5 border border-ink-200/80 shadow-sm"
                  title="Click to toggle between UTC and Local Timezone"
                >
                  <Globe className="w-3.5 h-3.5 text-plum-600" />
                  <span>{timezoneMode === 'utc' ? 'UTC Standard' : `Local (${localTzAbbr})`}</span>
                </button>
              </div>

              {/* Quick Select Next 7 Days Strip */}
              <DateStrip
                next7Days={next7Days}
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedSlot(null);
                }}
              />

              {/* Time Slots Section */}
              <SlotGrid
                loadingSlots={loadingSlots}
                processedSlotsCount={processedSlots.length}
                timezoneMode={timezoneMode}
                localTzAbbr={localTzAbbr}
                groupedSlots={groupedSlots}
                selectedSlot={selectedSlot}
                selectedCounselor={selectedCounselor}
                onSelectSlot={setSelectedSlot}
                formatSlotTimeRange={formatSlotTimeRange}
              />

              {/* Selection Summary Box, Error, and CTA */}
              <BookingSummary
                selectedSlot={selectedSlot}
                selectedCounselor={selectedCounselor}
                counselors={counselors}
                bookingError={bookingError}
                confirmingBooking={confirmingBooking}
                onBookSession={handleBookSession}
                formatSessionDateTime={formatSessionDateTime}
              />
            </div>
          </div>
        </div>
      ) : (
        /* My Booked Sessions Tab */
        <MySessionsList
          loadingMySessions={loadingMySessions}
          mySessions={mySessions}
          onOpenFeedback={(session) => {
            setActiveFeedbackSession(session);
            setRating(null);
            setComments('');
            setFeedbackError(null);
          }}
          onOpenCancel={(session) => {
            setCancelTarget(session);
            setCancelStatusMessage(null);
          }}
          cancelStatusMessage={cancelStatusMessage}
          formatSessionDateTime={formatSessionDateTime}
        />
      )}

      {/* Counselor Full Bio Modal */}
      <CounselorBioModal
        bioModalCounselor={bioModalCounselor}
        onClose={() => setBioModalCounselor(null)}
        onSelectCounselor={setSelectedCounselor}
      />

      {/* Booking Confirmation / Success Modal */}
      <BookingSuccessModal
        bookingSuccess={bookingSuccess}
        counselors={counselors}
        selectedCounselor={selectedCounselor}
        onClose={() => {
          setBookingSuccess(null);
          setSelectedSlot(null);
          setActiveTab('my-sessions');
        }}
        formatSessionDateTime={formatSessionDateTime}
      />

      {/* Student Feedback Modal */}
      <SessionFeedbackModal
        activeFeedbackSession={activeFeedbackSession}
        rating={rating}
        setRating={setRating}
        comments={comments}
        setComments={setComments}
        feedbackError={feedbackError}
        setFeedbackError={setFeedbackError}
        submittingFeedback={submittingFeedback}
        onClose={handleCloseFeedback}
        onSubmit={handleSubmitFeedback}
      />

      {/* Cancel Session Confirmation Sheet */}
      <ConfirmSheet
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
        title="Cancel this session?"
        description="Your counselor will be told the slot is free again. You can book another time whenever you're ready, and nothing about this goes on your record."
        confirmLabel="Cancel session"
        destructive
        loading={cancellingSession}
      />
    </div>
  );
}
