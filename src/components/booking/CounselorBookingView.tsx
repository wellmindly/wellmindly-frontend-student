import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, CalendarDays, Clock, Globe, ShieldCheck, Users } from "lucide-react";
import type { Counselor, Slot, SlotOption, BookedSession } from "./types";
import { CounselorFilter } from "./CounselorFilter";
import { CounselorPickerCard } from "./CounselorPickerCard";
import { DateStrip } from "./DateStrip";
import { SlotGrid } from "./SlotGrid";
import { BookingSummary } from "./BookingSummary";
import { MySessionsList } from "./MySessionsList";
import { CounselorBioModal } from "./CounselorBioModal";
import { BookingSuccessModal } from "./BookingSuccessModal";
import { SessionFeedbackModal } from "./SessionFeedbackModal";
import { Button, ConfirmSheet, SegmentedControl, StepDots, Skeleton } from "../ui";
import { useScrollTopOnChange } from "../../lib/a11y";
import { dayKey } from "../../lib/format";
import api from "../../services/api";

/* ============================================================================
   CounselorBookingView
   ----------------------------------------------------------------------------
   Booking is two questions, asked one at a time:

     Step 1  When?  - a date, then a time. Slots are pooled across every
                      counselor, so the student sees the real shape of the day
                      instead of ten separate calendars they have to scroll.
     Step 2  Who?   - only the people actually free at that time, as a photo
                      and a name. Everything else is one tap away in a modal.

   The old single screen listed ten full counselor cards *above* the picker,
   which is why choosing a time meant scrolling past a wall of bios first.
   ========================================================================= */

export function CounselorBookingView() {
  const [activeTab, setActiveTab] = useState<"book" | "my-sessions">("book");
  const [step, setStep] = useState<1 | 2>(1);

  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loadingCounselors, setLoadingCounselors] = useState(true);
  /** Ids the student narrowed to. Empty means "anyone". */
  const [filterIds, setFilterIds] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>(dayKey(new Date()));
  const [rawSlots, setRawSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);

  const [chosenCounselor, setChosenCounselor] = useState<Counselor | null>(null);
  const [detailCounselor, setDetailCounselor] = useState<Counselor | null>(null);

  // Times default to UTC: the university cohort spans timezones and the
  // counseling team schedules in UTC, so it is the shared reference.
  const [timezoneMode, setTimezoneMode] = useState<"utc" | "local">("utc");

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const [mySessions, setMySessions] = useState<BookedSession[]>([]);
  const [loadingMySessions, setLoadingMySessions] = useState(false);

  const [activeFeedbackSession, setActiveFeedbackSession] = useState<BookedSession | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<BookedSession | null>(null);
  const [cancellingSession, setCancellingSession] = useState(false);
  const [cancelStatusMessage, setCancelStatusMessage] = useState<string | null>(null);

  // Moving between steps or tabs is a navigation, so start at the top of it.
  useScrollTopOnChange(`${activeTab}-${step}`);

  const handleCloseFeedback = () => {
    setActiveFeedbackSession(null);
    setRating(null);
    setComments("");
    setFeedbackError(null);
  };

  /* ----------------------------------------------------------------- data */

  // Local timezone abbreviation, e.g. "IST", "EST".
  const localTzAbbr = useMemo(() => {
    try {
      return (
        new Intl.DateTimeFormat(undefined, { timeZoneName: "short" })
          .formatToParts(new Date())
          .find((part) => part.type === "timeZoneName")?.value || "Local"
      );
    } catch {
      return "Local";
    }
  }, []);

  useEffect(() => {
    api
      .get("/v1/students/counselors")
      .then((res) => {
        if (res.data.success) setCounselors(res.data.data);
      })
      .catch((err) => console.error("Failed to load counselors:", err))
      .finally(() => setLoadingCounselors(false));
  }, []);

  // One request per date, never per counselor: the response already carries
  // every counselor's slots, and the filter is a view over that same payload.
  useEffect(() => {
    let cancelled = false;
    setLoadingSlots(true);

    api
      .get(`/v1/students/counselors/slots?date=${selectedDate}`)
      .then((res) => {
        if (cancelled) return;
        const flat: Slot[] = [];
        const groups = Array.isArray(res.data?.data) ? res.data.data : [];
        groups.forEach((entry: any) => {
          (entry.slots || []).forEach((s: any) => {
            flat.push({ ...s, counselorId: s.counselorId || entry.id });
          });
        });
        setRawSlots(flat);
      })
      .catch((err) => {
        console.error("Failed to fetch slots:", err);
        if (!cancelled) setRawSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const fetchMySessions = () => {
    setLoadingMySessions(true);
    api
      .get("/v1/students/sessions/me")
      .then((res) => {
        if (res.data.success) setMySessions(res.data.data);
      })
      .finally(() => setLoadingMySessions(false));
  };

  useEffect(() => {
    if (activeTab === "my-sessions") fetchMySessions();
  }, [activeTab]);

  const next7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = dayKey(d);
      const dayName =
        i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
      const monthDay = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const fullDate = d.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const fullLabel = i === 0 ? `Today, ${fullDate}` : fullDate;
      days.push({ iso, dayName, monthDay, fullLabel });
    }
    return days;
  }, []);

  /**
   * Collapse the per-counselor slots into one row per start time. A time with
   * nobody free is kept (with an empty id list) so the day still reads as a
   * shape rather than as an arbitrary list of survivors.
   */
  const slotOptions = useMemo<SlotOption[]>(() => {
    const relevant =
      filterIds.length > 0 ? rawSlots.filter((s) => filterIds.includes(s.counselorId)) : rawSlots;

    const byStart = new Map<string, SlotOption>();
    relevant.forEach((s) => {
      const existing = byStart.get(s.startTime);
      if (!existing) {
        byStart.set(s.startTime, {
          startTime: s.startTime,
          endTime: s.endTime,
          counselorIds: s.isAvailable ? [s.counselorId] : [],
        });
        return;
      }
      if (s.isAvailable && !existing.counselorIds.includes(s.counselorId)) {
        existing.counselorIds.push(s.counselorId);
      }
    });

    return Array.from(byStart.values()).sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
  }, [rawSlots, filterIds]);

  // A slot chosen before a filter change can stop being bookable. Drop it
  // rather than letting the student submit something the server will reject.
  useEffect(() => {
    if (!selectedSlot) return;
    const current = slotOptions.find((s) => s.startTime === selectedSlot.startTime);
    if (!current || current.counselorIds.length === 0) {
      setSelectedSlot(null);
      setChosenCounselor(null);
      setStep(1);
    } else if (current !== selectedSlot) {
      // Same time, different set of free counselors - refresh so step two sees it.
      setSelectedSlot(current);
    }
  }, [slotOptions, selectedSlot]);

  useEffect(() => {
    if (chosenCounselor && selectedSlot && !selectedSlot.counselorIds.includes(chosenCounselor.id)) {
      setChosenCounselor(null);
    }
  }, [chosenCounselor, selectedSlot]);

  const availableCounselors = useMemo(() => {
    if (!selectedSlot) return [];
    return counselors.filter((c) => selectedSlot.counselorIds.includes(c.id));
  }, [counselors, selectedSlot]);

  /* ----------------------------------------------------------- formatting */

  // e.g. "08:00 - 09:00 UTC" or "01:30 PM - 02:30 PM"
  const formatSlotTimeRange = (startTimeIso: string, endTimeIso: string) => {
    const start = new Date(startTimeIso);
    const end = new Date(endTimeIso);

    if (timezoneMode === "utc") {
      const startH = String(start.getUTCHours()).padStart(2, "0");
      const startM = String(start.getUTCMinutes()).padStart(2, "0");
      const endH = String(end.getUTCHours()).padStart(2, "0");
      const endM = String(end.getUTCMinutes()).padStart(2, "0");
      return `${startH}:${startM} - ${endH}:${endM} UTC`;
    }

    const startStr = start.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const endStr = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${startStr} - ${endStr}`;
  };

  const formatSessionDateTime = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;

    if (timezoneMode === "utc") {
      const year = d.getUTCFullYear();
      const month = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
      const day = d.getUTCDate();
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const mins = String(d.getUTCMinutes()).padStart(2, "0");
      return `${month} ${day}, ${year} at ${hours}:${mins} UTC`;
    }

    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} at ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })} (${localTzAbbr})`;
  };

  /* -------------------------------------------------------------- actions */

  const handleBookSession = async () => {
    if (!chosenCounselor || !selectedSlot) {
      setBookingError("Pick a time and a counselor first.");
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    try {
      const res = await api.post("/v1/students/sessions/book", {
        counselorId: chosenCounselor.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      if (res.data.success) {
        setBookingSuccess(res.data.data);
      } else {
        setBookingError("We could not confirm that booking. Please try another time.");
      }
    } catch (err: any) {
      setBookingError(
        err.response?.data?.error?.message ||
          err.response?.data?.error ||
          "Failed to book session. Please try another slot.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!activeFeedbackSession) return;
    if (rating === null) {
      setFeedbackError("Please tell us how the session was.");
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      await api.post(`/v1/students/sessions/${activeFeedbackSession.id}/feedback`, {
        rating,
        comments,
      });
      handleCloseFeedback();
      fetchMySessions();
    } catch (err: any) {
      setFeedbackError(err.response?.data?.error || "Failed to submit feedback. Please try again.");
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
      setCancelStatusMessage("That session is cancelled. The slot is free again.");
      fetchMySessions();
    } catch (err: any) {
      if (err.response?.data?.error?.code === "CANCELLATION_RESTRICTED") {
        setCancelStatusMessage(
          "That session starts too soon to cancel online. Please contact us instead.",
        );
      } else {
        setCancelStatusMessage("We couldn't cancel that session. Please try again in a moment.");
      }
      setCancelTarget(null);
    } finally {
      setCancellingSession(false);
    }
  };

  const selectedSlotLabel = selectedSlot
    ? formatSlotTimeRange(selectedSlot.startTime, selectedSlot.endTime)
    : null;
  const selectedDayLabel =
    next7Days.find((d) => d.iso === selectedDate)?.fullLabel ??
    new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

  /* --------------------------------------------------------------- render */

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
              Book a session
            </h1>
            <p className="mt-1 text-xs text-ink-600 sm:text-sm">
              One-to-one with a counselor, over a private video link.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-sage-200 bg-sage-50 px-3 py-1.5 text-2xs font-bold text-sage-700">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Private</span>
          </span>
        </div>

        <SegmentedControl<"book" | "my-sessions">
          label="Booking sections"
          className="w-full"
          value={activeTab}
          onChange={setActiveTab}
          options={[
            { value: "book", label: "Book", icon: <CalendarDays /> },
            {
              value: "my-sessions",
              label: "My sessions",
              icon: <Clock />,
              count: mySessions.length > 0 ? mySessions.length : undefined,
            },
          ]}
        />
      </div>

      {activeTab === "book" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xs font-bold uppercase tracking-wide text-plum-600">
                Step {step} of 2
              </p>
              <h2 className="truncate font-display text-base font-semibold text-ink-900 sm:text-lg">
                {step === 1 ? "Pick a day and time" : "Pick who you'd like to see"}
              </h2>
            </div>
            <StepDots total={2} current={step - 1} label="Booking progress" className="shrink-0" />
          </div>

          {step === 1 ? (
            <>
              <div className="space-y-5 rounded-3xl border border-ink-200/80 bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 sm:flex-1">
                    <CounselorFilter
                      counselors={counselors}
                      selectedIds={filterIds}
                      onChange={setFilterIds}
                      loading={loadingCounselors}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setTimezoneMode(timezoneMode === "utc" ? "local" : "utc")}
                    aria-label={`Times are shown in ${timezoneMode === "utc" ? "UTC" : localTzAbbr}. Switch to ${timezoneMode === "utc" ? localTzAbbr : "UTC"}.`}
                    className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-xl border border-ink-200 bg-paper px-3 text-2xs font-bold text-ink-800 transition-colors hover:bg-ink-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 sm:mt-6"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0 text-plum-600" aria-hidden="true" />
                    <span className="whitespace-nowrap">
                      {timezoneMode === "utc" ? "UTC" : localTzAbbr}
                    </span>
                  </button>
                </div>

                <DateStrip
                  next7Days={next7Days}
                  selectedDate={selectedDate}
                  onSelectDate={(d) => {
                    setSelectedDate(d);
                    setSelectedSlot(null);
                    setChosenCounselor(null);
                  }}
                />

                <SlotGrid
                  loading={loadingSlots}
                  slots={slotOptions}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  formatSlotTimeRange={formatSlotTimeRange}
                  timezoneMode={timezoneMode}
                  localTzAbbr={localTzAbbr}
                  filtered={filterIds.length > 0}
                />
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  disabled={!selectedSlot}
                  onClick={() => {
                    if (selectedSlot) setStep(2);
                  }}
                >
                  Continue to counselors
                </Button>
                <p className="text-center text-2xs text-ink-500">
                  {selectedSlot
                    ? `${selectedSlot.counselorIds.length} ${selectedSlot.counselorIds.length === 1 ? "counselor is" : "counselors are"} free at ${selectedSlotLabel}.`
                    : "Pick a time above to see who's free."}
                </p>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl border-none bg-transparent px-1 text-xs font-bold text-plum-700 transition-colors hover:text-plum-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                Change day or time
              </button>

              <div className="space-y-4 rounded-3xl border border-ink-200/80 bg-card p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-plum-100 bg-plum-50 px-3.5 py-2.5 text-xs">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0 text-plum-600" aria-hidden="true" />
                  <span className="font-semibold text-plum-800">{selectedDayLabel}</span>
                  <span className="text-plum-400" aria-hidden="true">
                    &middot;
                  </span>
                  <span className="font-semibold text-plum-800">{selectedSlotLabel}</span>
                </div>

                <h3 className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wide text-ink-500">
                  <Users className="h-3.5 w-3.5 text-plum-500" aria-hidden="true" />
                  {loadingCounselors
                    ? "Loading counselors"
                    : `${availableCounselors.length} free at this time`}
                </h3>

                {loadingCounselors ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true">
                    {[0, 1, 2].map((i) => (
                      <Skeleton key={i} className="h-44 rounded-3xl" />
                    ))}
                  </div>
                ) : availableCounselors.length === 0 ? (
                  <div className="space-y-2 rounded-2xl border border-ink-200/80 bg-paper p-6 text-center">
                    <p className="text-xs font-semibold text-ink-700">
                      Nobody is free at that time any more
                    </p>
                    <p className="text-2xs text-ink-500">
                      It may have just been booked. Go back and pick another time.
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                      Back to times
                    </Button>
                  </div>
                ) : (
                  <>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {availableCounselors.map((counselor) => (
                        <li key={counselor.id}>
                          <CounselorPickerCard
                            counselor={counselor}
                            selected={chosenCounselor?.id === counselor.id}
                            onOpenDetails={setDetailCounselor}
                          />
                        </li>
                      ))}
                    </ul>
                    <p className="text-2xs text-ink-500">
                      Tap a counselor to read their bio, then choose them.
                    </p>
                  </>
                )}
              </div>

              <BookingSummary
                counselor={chosenCounselor}
                slot={selectedSlot}
                bookingError={bookingError}
                submitting={submitting}
                onSubmit={handleBookSession}
                formatSessionDateTime={formatSessionDateTime}
              />
            </>
          )}
        </div>
      ) : (
        <MySessionsList
          loadingMySessions={loadingMySessions}
          mySessions={mySessions}
          onOpenFeedback={(session) => {
            setActiveFeedbackSession(session);
            setRating(null);
            setComments("");
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

      <CounselorBioModal
        counselor={detailCounselor}
        selected={!!detailCounselor && chosenCounselor?.id === detailCounselor.id}
        onClose={() => setDetailCounselor(null)}
        onSelect={(counselor) => {
          setChosenCounselor(counselor);
          setBookingError(null);
        }}
      />

      <BookingSuccessModal
        bookingSuccess={bookingSuccess}
        counselors={counselors}
        selectedCounselor={chosenCounselor}
        onClose={() => {
          setBookingSuccess(null);
          setSelectedSlot(null);
          setChosenCounselor(null);
          setStep(1);
          setActiveTab("my-sessions");
        }}
        formatSessionDateTime={formatSessionDateTime}
      />

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
