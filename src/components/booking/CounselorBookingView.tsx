import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Check,
  ShieldCheck,
  Info,
  Sun,
  Sunrise,
  Sunset,
  Globe,
  ChevronRight,
  User,
} from 'lucide-react';
import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'https://api.wellmindly.com/api';
if (rawApiUrl.endsWith('/')) rawApiUrl = rawApiUrl.slice(0, -1);
if (!rawApiUrl.endsWith('/api')) rawApiUrl += '/api';
const API_BASE = `${rawApiUrl}/v1`;

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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Timezone preference
  const [timezoneMode, setTimezoneMode] = useState<'local' | 'utc'>('local');

  // Full Bio Modal state
  const [bioModalCounselor, setBioModalCounselor] = useState<Counselor | null>(null);

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

  // Next 7 Days generator for quick date navigation
  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ iso, dayName, monthDay });
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

  // Format slot time for display
  const formatSlotTime = (isoString: string) => {
    const d = new Date(isoString);
    if (timezoneMode === 'utc') {
      const utcHours = String(d.getUTCHours()).padStart(2, '0');
      const utcMins = String(d.getUTCMinutes()).padStart(2, '0');
      return `${utcHours}:${utcMins} UTC`;
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: Slot[] = [];
    const afternoon: Slot[] = [];
    const evening: Slot[] = [];

    slots.forEach((slot) => {
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
  }, [slots, timezoneMode]);

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
        err.response?.data?.error?.message || err.response?.data?.error || 'Failed to book session. Please try another slot.'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      {/* Top Header & Tab Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-xl p-3 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'book'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Book a Counselor</span>
          </button>

          <button
            onClick={() => setActiveTab('my-sessions')}
            className={`flex-1 sm:flex-initial px-6 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'my-sessions'
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                : 'text-slate-600 hover:bg-slate-100/80'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>My Booked Sessions</span>
            {mySessions.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 text-[10px] font-extrabold">
                {mySessions.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100/70 rounded-2xl text-xs font-semibold text-slate-600 self-end sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>100% Confidential & Peer Vetted</span>
        </div>
      </div>

      {activeTab === 'book' ? (
        <div className="space-y-8">
          {/* Main Hero Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl border border-indigo-500/20">
            <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Dedicated Peer Counseling & Guidance</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif text-white leading-tight">
                Talk to Someone Who Truly Understands Student Life
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Connect with verified therapists, clinical psychologists, and student coaches. Select your preferred date, pick a convenient time slot, and get your video link immediately.
              </p>
            </div>
          </div>

          {/* Category Filter Pills & Search Bar */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search counselor by name, credential, or specialty..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200/90 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                {[
                  { id: 'all', label: 'All Counselors' },
                  { id: 'youth', label: 'Youth & Students' },
                  { id: 'stress', label: 'Stress & Load' },
                  { id: 'anxiety', label: 'Anxiety & Mood' },
                  { id: 'coaching', label: 'Mindset Coaching' },
                  { id: 'behavioral', label: 'Specialized Care' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
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
                  <h2 className="text-xl font-bold text-slate-900 font-serif">
                    {selectedCounselor ? 'Selected Counselor' : 'Available Counselors'}
                  </h2>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-extrabold">
                    {filteredCounselors.length}
                  </span>
                </div>

                {selectedCounselor && (
                  <button
                    onClick={() => {
                      setSelectedCounselor(null);
                      setSelectedSlot(null);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 transition-colors"
                  >
                    <span>Show All Counselors</span>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {loadingCounselors ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-slate-500 text-sm font-medium">Loading counselor directory...</p>
                </div>
              ) : filteredCounselors.length === 0 ? (
                <div className="py-16 px-6 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
                  <User className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No counselors match your filter</h3>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto">
                    Try searching for a different keyword or reset your category selection to view all available counselors.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredCounselors.map((counselor) => {
                    const isSelected = selectedCounselor?.id === counselor.id;
                    return (
                      <motion.div
                        key={counselor.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => setSelectedCounselor(counselor)}
                        className={`bg-white rounded-3xl p-6 border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 relative group ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-gradient-to-b from-indigo-50/30 to-white shadow-xl shadow-indigo-100/50'
                            : 'border-slate-200/90 hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                      >
                        {/* Top Profile Header */}
                        <div className="space-y-4">
                          <div className="flex items-start space-x-3.5">
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xl flex items-center justify-center shadow-md overflow-hidden ring-2 ring-white">
                                {counselor.avatarUrl ? (
                                  <img
                                    src={counselor.avatarUrl}
                                    alt={counselor.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  counselor.name[0]
                                )}
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                                  {counselor.name}
                                </h3>
                                {isSelected && (
                                  <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-500 text-xs font-medium truncate mt-0.5">
                                {counselor.credentials}
                              </p>

                              <div className="flex items-center space-x-1 mt-1 text-amber-500 text-xs font-bold">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{counselor.averageRating}</span>
                                <span className="text-slate-400 font-normal">
                                  ({counselor.totalReviews > 0 ? counselor.totalReviews : 'Peer Vetted'})
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Specializations Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {counselor.specializations.map((spec, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-slate-100/90 text-slate-700 rounded-lg text-[11px] font-medium border border-slate-200/50"
                              >
                                {spec}
                              </span>
                            ))}
                          </div>

                          {/* Bio Text */}
                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                            {counselor.bio}
                          </p>
                        </div>

                        {/* Card Bottom CTA & Info Button */}
                        <div className="pt-2 flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBioModalCounselor(counselor);
                            }}
                            className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
                            title="Read Full Bio"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          <button
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            <span>{isSelected ? 'Counselor Selected' : 'Select Counselor'}</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 Columns: Interactive Date & Time Picker Panel */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-lg shadow-slate-100 space-y-6 lg:sticky lg:top-8">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg font-serif flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-600" />
                    <span>Select Date & Time</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {selectedCounselor ? (
                      <span>Booking with <strong>{selectedCounselor.name}</strong></span>
                    ) : (
                      'Showing slots across all counselors'
                    )}
                  </p>
                </div>

                {/* Timezone Toggle Pill */}
                <button
                  onClick={() => setTimezoneMode(timezoneMode === 'local' ? 'utc' : 'local')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200/70 text-slate-700 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1.5 border border-slate-200"
                  title="Toggle Local vs UTC display"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{timezoneMode === 'local' ? localTzAbbr : 'UTC'}</span>
                </button>
              </div>

              {/* Quick Select Next 7 Days Strip */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Choose Date
                </label>
                <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                  {next7Days.map((day) => {
                    const isSelected = selectedDate === day.iso;
                    return (
                      <button
                        key={day.iso}
                        onClick={() => {
                          setSelectedDate(day.iso);
                          setSelectedSlot(null);
                        }}
                        className={`px-3 py-2 rounded-2xl text-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">{day.dayName}</div>
                        <div className="text-xs font-extrabold">{day.monthDay}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1">
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedSlot(null);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Time Slots Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Available Slots ({slots.length})
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Format: 45 min video call
                  </span>
                </div>

                {loadingSlots ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs">Checking slots availability...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-1">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-slate-600 font-semibold text-xs">No available slots on this date</p>
                    <p className="text-slate-400 text-[11px]">Try picking another date from the bar above.</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {/* Morning Block */}
                    {groupedSlots.morning.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1.5 uppercase tracking-wider">
                          <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                          <span>Morning</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {groupedSlots.morning.map((slot, i) => {
                            const timeStr = formatSlotTime(slot.startTime);
                            const isSelected = selectedSlot?.startTime === slot.startTime;

                            return (
                              <button
                                key={i}
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                                  !slot.isAvailable
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                    : 'bg-slate-50/80 hover:bg-indigo-50/60 text-slate-800 border-slate-200/80 hover:border-indigo-300'
                                }`}
                              >
                                {timeStr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Afternoon Block */}
                    {groupedSlots.afternoon.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1.5 uppercase tracking-wider">
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Afternoon</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {groupedSlots.afternoon.map((slot, i) => {
                            const timeStr = formatSlotTime(slot.startTime);
                            const isSelected = selectedSlot?.startTime === slot.startTime;

                            return (
                              <button
                                key={i}
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                                  !slot.isAvailable
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                    : 'bg-slate-50/80 hover:bg-indigo-50/60 text-slate-800 border-slate-200/80 hover:border-indigo-300'
                                }`}
                              >
                                {timeStr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Evening Block */}
                    {groupedSlots.evening.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1.5 uppercase tracking-wider">
                          <Sunset className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Evening</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {groupedSlots.evening.map((slot, i) => {
                            const timeStr = formatSlotTime(slot.startTime);
                            const isSelected = selectedSlot?.startTime === slot.startTime;

                            return (
                              <button
                                key={i}
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlot(slot)}
                                className={`py-2.5 px-3 rounded-xl font-bold text-xs border transition-all ${
                                  !slot.isAvailable
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                    : 'bg-slate-50/80 hover:bg-indigo-50/60 text-slate-800 border-slate-200/80 hover:border-indigo-300'
                                }`}
                              >
                                {timeStr}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Selection Summary Box */}
              {selectedCounselor && selectedSlot && (
                <div className="bg-indigo-50/80 border border-indigo-200/80 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="font-bold text-indigo-900 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Booking Summary</span>
                  </div>
                  <div className="space-y-1 text-indigo-950 font-medium">
                    <p>Counselor: <strong>{selectedCounselor.name}</strong></p>
                    <p>Time: <strong>{formatSlotTime(selectedSlot.startTime)} ({selectedDate})</strong></p>
                  </div>
                </div>
              )}

              {bookingError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Main Booking CTA */}
              <button
                disabled={!selectedCounselor || !selectedSlot || confirmingBooking}
                onClick={handleBookSession}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-200 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center space-x-2"
              >
                <span>{confirmingBooking ? 'Booking Session...' : 'Confirm & Book Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* My Booked Sessions Tab */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 font-serif">My Booked Sessions</h2>
            <p className="text-slate-500 text-xs mt-1">Join your upcoming video consultations or leave feedback for completed sessions.</p>
          </div>

          {loadingMySessions ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-sm">Loading your booked sessions...</p>
            </div>
          ) : mySessions.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No session bookings found</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                You haven't scheduled any counselor sessions yet. Use the "Book a Counselor" tab to select a date and slot.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mySessions.map((session) => {
                const start = new Date(session.startTime);
                const isConfirmed = session.status === 'CONFIRMED';

                return (
                  <div
                    key={session.id}
                    className="p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center text-lg shadow-md shrink-0">
                        {session.counselor?.user?.firstName?.[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">
                          Session with {session.counselor?.user?.firstName} {session.counselor?.user?.lastName}
                        </h4>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Scheduled: <strong>{start.toLocaleString()}</strong> ({timezoneMode === 'local' ? localTzAbbr : 'UTC'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      {isConfirmed && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
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
                          className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs rounded-xl transition-all flex items-center space-x-1.5"
                        >
                          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
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

      {/* Counselor Full Bio Modal */}
      <AnimatePresence>
        {bioModalCounselor && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setBioModalCounselor(null)}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  {bioModalCounselor.avatarUrl ? (
                    <img src={bioModalCounselor.avatarUrl} alt={bioModalCounselor.name} className="w-full h-full object-cover" />
                  ) : (
                    bioModalCounselor.name[0]
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-serif">{bioModalCounselor.name}</h3>
                  <p className="text-indigo-600 text-xs font-semibold">{bioModalCounselor.credentials}</p>
                  <div className="flex items-center space-x-1 mt-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{bioModalCounselor.averageRating}</span>
                    <span className="text-slate-400 font-normal">({bioModalCounselor.totalReviews} peer reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Background & Bio</h4>
                <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {bioModalCounselor.bio}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-1.5">
                  {bioModalCounselor.specializations.map((spec, i) => (
                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  onClick={() => setBioModalCounselor(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedCounselor(bioModalCounselor);
                    setBioModalCounselor(null);
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-200 transition-colors"
                >
                  Select This Counselor
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Confirmation / Success Modal */}
      <AnimatePresence>
        {bookingSuccess && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-serif">Session Confirmed!</h3>
                <p className="text-slate-500 text-xs mt-1">
                  Your private consultation has been booked. A confirmation email with meeting details has been sent to your inbox.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2">
                <p><strong>Counselor:</strong> {selectedCounselor?.name}</p>
                <p><strong>Scheduled Time:</strong> {new Date(bookingSuccess.startTime).toLocaleString()}</p>
                <p className="truncate">
                  <strong>Meeting Link:</strong>{' '}
                  <a href={bookingSuccess.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                    {bookingSuccess.meetingLink}
                  </a>
                </p>
              </div>

              <button
                onClick={() => {
                  setBookingSuccess(null);
                  setSelectedSlot(null);
                  setActiveTab('my-sessions');
                }}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg text-xs"
              >
                Go to My Sessions
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Student Feedback Modal */}
      {activeFeedbackSession && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 font-serif">Session Feedback</h3>
            <p className="text-slate-500 text-xs">Help us maintain clinical care standards for your peers.</p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rating (1 to 5 Stars)</label>
              <select
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5 - Outstanding Support)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5 - Good & Helpful)</option>
                <option value={3}>⭐⭐⭐ (3/5 - Average)</option>
                <option value={2}>⭐⭐ (2/5 - Fair)</option>
                <option value={1}>⭐ (1/5 - Needs Improvement)</option>
              </select>
            </div>

            <textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Tell us about your session experience..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setActiveFeedbackSession(null)}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submittingFeedback}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

