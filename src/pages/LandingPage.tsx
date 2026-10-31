import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Heart } from "lucide-react";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { HeroSection } from "../components/landing/HeroSection";
import { ComingSoonModal } from "../components/dashboard/ComingSoonModal";
import { ExploreToolsSection } from "../components/landing/sections/ExploreToolsSection";
import { CoachingSection } from "../components/landing/sections/CoachingSection";
import { CampusSupportSection } from "../components/landing/sections/CampusSupportSection";
import { CoachBookingModal } from "../components/landing/sections/CoachBookingModal";
import { EligibilityModal } from "../components/booking/EligibilityModal";
import { Button, Sheet } from "../components/ui";
import type { CoachItem } from "../components/landing/sections/types";
import { config } from "../config";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { scrollToElement } from "../lib/a11y";
import { trackEvent } from "../lib/analytics";


export type { CoachItem } from "../components/landing/sections/types";


const BOOKING_SLOTS = ["Mon 4:00pm", "Tue 10:00am", "Wed 6:30pm", "Thu 5:00pm", "Sat 9:00am", "Sun 11:00am"];

export function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [comingSoonFeature, setComingSoonFeature] = useState<"writemindly" | null>(null);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  useEffect(() => {
    const hasSeen = localStorage.getItem("seen-beta-welcome");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem("seen-beta-welcome", "true");
    setShowWelcomeModal(false);
  };
  
  // Update document title for SEO
  useEffect(() => {
    document.title = "WellMindly | Get to know yourself, feel a little better";
  }, []);
  
  const [coaches, setCoaches] = useState<CoachItem[]>([]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [coachesError, setCoachesError] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const fetchCoaches = () => {
    setLoadingCoaches(true);
    setCoachesError(false);
    api.get("/contacts/coaches")
      .then((res) => {
        if (res.data && Array.isArray(res.data.coaches) && res.data.coaches.length > 0) {
          setCoaches(res.data.coaches);
        } else {
          setCoaches([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch coaches:", err);
        setCoachesError(true);
      })
      .finally(() => {
        setLoadingCoaches(false);
      });
  };

  useEffect(() => {
    fetchCoaches();
  }, []);
 
  const handleCrisisClick = () => {
    // Sensitive crisis interactions must never be transmitted to third-party analytics
    navigate("/crisis");
  };

  const handleCheckInClick = () => {
    // Non-sensitive generic hero engagement; check-in mood/answers are never sent
    trackEvent("primary_cta_clicked", { cta_id: "landing_hero_cta" });
    // Signed in, so use the check-in that actually reaches their account: the
    // public /discover flow only ever writes results to localStorage.
    if (isAuthenticated) {
      navigate("/dashboard?tab=checkin");
      return;
    }
    sessionStorage.setItem("last_test_started", "checkin");
    navigate("/discover?start=checkin");
  };

  const handleCoachingScroll = () => {
    trackEvent("primary_cta_clicked", { cta_id: "coaching_section_scroll" });
    scrollToElement(document.getElementById("coaching-section"));
  };

  const handleWriteMindlyClick = () => {
    trackEvent("feature_opened", { feature_id: "writemindly" });
    if (!config.enableWriteMindly) {
      setComingSoonFeature("writemindly");
      return;
    }
    if (isAuthenticated) {
      navigate("/dashboard?tab=writemindly");
    } else {
      navigate(`/login?redirect=${encodeURIComponent("/dashboard?tab=writemindly")}`);
    }
  };

  const handleTalkMindlyClick = () => {
    trackEvent("feature_opened", { feature_id: "talkmindly" });
    if (isAuthenticated) {
      navigate("/dashboard?tab=talkmindly");
    } else {
      navigate(`/login?redirect=${encodeURIComponent("/dashboard?tab=talkmindly")}`);
    }
  };
 
  /**
   * Where "See availability" actually goes: the real booking flow in the
   * dashboard, narrowed to that coach when the directory gave us their id.
   * `/contacts/coaches` and `/v1/students/counselors` both key on
   * `counselorProfile.id`, so the id travels between the two screens.
   */
  const bookingPathFor = (coach: CoachItem | null) =>
    coach?.id
      ? `/dashboard?tab=sessionbooking&counselor=${encodeURIComponent(coach.id)}`
      : "/dashboard?tab=sessionbooking";

  const handleSelectCoach = (coach: CoachItem) => {
    // Counseling session booking interactions are not transmitted to third-party analytics
    if (isAuthenticated) {
      const isUniStudent = !!user?.universityId || !!user?.universityVerified;
      if (!isUniStudent) {
        setShowEligibilityModal(true);
        return;
      }
      navigate(bookingPathFor(coach));
      return;
    }
    setSelectedCoach(coach);
    setSelectedSlot(null);
  };

  // Only reachable while signed out: signed-in students never open the preview.
  const confirmBooking = () => {
    if (!selectedCoach || selectedSlot === null) return;
    // Session booking preview interactions are not transmitted to third-party analytics
    navigate(`/login?redirect=${encodeURIComponent(bookingPathFor(selectedCoach))}`);
  };


  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-rose/20 selection:text-ink relative overflow-x-hidden pb-12 flex flex-col justify-between">
      <div>
        {/* Header Layout */}
        <LandingHeader onCrisisClick={handleCrisisClick} />

        {/* Main Content Layout */}
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 relative z-10">
          {/* Hero Section */}
          <HeroSection 
            onCheckInClick={handleCheckInClick} 
            onBookCoachClick={handleCoachingScroll}
            onBubbleClick={(bubbleId) => {
              const row = document.getElementById(`care-${bubbleId}`);
              scrollToElement(row ?? document.getElementById("explore-tools"), {
                block: "center",
              });
            }}
          />

          {/* Care path: one question, three answers */}
          <ExploreToolsSection
            onWriteMindlyClick={handleWriteMindlyClick}
            onTalkMindlyClick={handleTalkMindlyClick}
            onCoachingClick={handleCoachingScroll}
          />

          {/* Redesigned Mobile-First "Book a Coach" Section */}
          <CoachingSection
            coaches={coaches}
            loading={loadingCoaches}
            error={coachesError}
            onRetry={fetchCoaches}
            onSelectCoach={handleSelectCoach}
          />

          {/* Institutional Trust Section */}
          <CampusSupportSection />
        </main>
      </div>

      {/* Footer Layout */}
      <LandingFooter onCrisisClick={handleCrisisClick} />

      {/* Coach Booking Modal */}
      <CoachBookingModal
        selectedCoach={selectedCoach}
        selectedSlot={selectedSlot}
        bookingSlots={BOOKING_SLOTS}
        onSelectSlot={setSelectedSlot}
        onClose={() => setSelectedCoach(null)}
        onConfirm={confirmBooking}
        onOpenEligibility={() => setShowEligibilityModal(true)}
      />

      {/* Non-University Student Eligibility Modal */}
      <EligibilityModal
        open={showEligibilityModal}
        onClose={() => setShowEligibilityModal(false)}
        onNavigateTab={(tab) => {
          if (isAuthenticated) {
            navigate(`/dashboard?tab=${tab}`);
          } else {
            navigate(`/login?redirect=${encodeURIComponent(`/dashboard?tab=${tab}`)}`);
          }
        }}
      />

      {/* Coming Soon Feature Modal */}
      <ComingSoonModal
        show={comingSoonFeature !== null}
        onClose={() => setComingSoonFeature(null)}
        feature={comingSoonFeature}
      />

      {/* Welcome Modal */}
      <Sheet
        open={showWelcomeModal}
        onClose={handleCloseWelcome}
        title="Before you look around..."
        size="md"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-50 text-plum-600 mb-6 shadow-inner select-none">
          <Heart className="h-6 w-6 fill-current" />
        </div>
        
        <p className="text-sm text-ink-600 leading-relaxed mb-4">
          Hi, and thank you for trying this out. You're one of a small handful of students seeing this early.
        </p>
        
        <p className="text-sm text-ink-600 leading-relaxed mb-6">
          We're building a quiet, private space for students to check in with how they're feeling, and we want to know what you honestly make of it before we show it to anyone else.
        </p>
        
        <ul className="space-y-3 mb-8 text-xs sm:text-sm font-semibold text-ink-700">
          <li className="flex gap-2.5 items-start">
            <Check className="h-4 w-4 text-plum-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span><b>The check-in works</b>. Go ahead and try it for real.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <Check className="h-4 w-4 text-plum-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span><b>TalkMindly is active</b>. Explore the anonymous, moderated peer spaces.</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <Check className="h-4 w-4 text-plum-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span><b>There are no right answers.</b> We want your honest reaction, including the parts that feel off or fake.</span>
          </li>
        </ul>
        
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center"
            onClick={handleCloseWelcome}
          >
            Okay, let me in
          </Button>
          <p className="text-center text-2xs text-ink-500 font-medium leading-none">
            Your feedback is anonymous and only seen by the creators.
          </p>
        </div>
      </Sheet>
    </div>
  );
}
