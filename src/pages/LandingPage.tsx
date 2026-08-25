import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { HeroSection } from "../components/landing/HeroSection";
import { ComingSoonModal } from "../components/dashboard/ComingSoonModal";
import { ExploreToolsSection } from "../components/landing/sections/ExploreToolsSection";
import { CoachingSection } from "../components/landing/sections/CoachingSection";
import { CampusSupportSection } from "../components/landing/sections/CampusSupportSection";
import { CoachBookingModal } from "../components/landing/sections/CoachBookingModal";
import type { CoachItem } from "../components/landing/sections/types";
import { config } from "../config";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export type { CoachItem } from "../components/landing/sections/types";

const DEFAULT_COACHES: CoachItem[] = [
  {
    name: "Varisha Nigar",
    role: "Psychology & Peer Support Coach",
    init: "VN",
    c1: "from-coral-600 to-coral-700",
    specs: ["Psychology Mentorship", "Peer Support", "Mental Health"],
    bio: "Dedicated academic and psychology professional providing personalized mentorship.",
  },
  {
    name: "Vinayak Katyayan",
    role: "Youth Mental Health & Recovery Coach",
    init: "VK",
    c1: "from-teal-600 to-teal-700",
    specs: ["Youth Mental Health", "Clinical Care", "Structured Recovery"],
    bio: "Clinical Psychologist & PhD Scholar at KGMU focusing on emotional wellbeing.",
  },
  {
    name: "Garvita Singh",
    role: "Youth Wellbeing & Resilience Coach",
    init: "GS",
    c1: "from-plum-600 to-plum-700",
    specs: ["Youth Wellbeing", "Resilience", "Stress Management"],
    bio: "Educator with 9+ years experience empowering youth to grow academically and personally.",
  },
  {
    name: "Jairus Rohan",
    role: "Behavioral Health & Neurodiversity Coach",
    init: "JR",
    c1: "from-gold-600 to-gold-700",
    specs: ["Behavioral Health", "Neurodiversity (ADHD)", "Skill Building"],
    bio: "Behavioral professional supporting youth with neurodiversity, ADHD, and emotional regulation.",
  }
];

const BOOKING_SLOTS = ["Mon 4:00pm", "Tue 10:00am", "Wed 6:30pm", "Thu 5:00pm", "Sat 9:00am", "Sun 11:00am"];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [comingSoonFeature, setComingSoonFeature] = useState<"writemindly" | "talkmindly" | "sessionbooking" | null>(null);
  
  const [showBetaBanner, setShowBetaBanner] = useState(true);
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
  const [activeOfferTab, setActiveOfferTab] = useState<'blueprints' | 'writemindly' | 'talkmindly'>('writemindly');
  const [activePreviewCoachIndex, setActivePreviewCoachIndex] = useState(0);
  const [mockWritePrompt, setMockWritePrompt] = useState(0);
  const [mockTalkTopic, setMockTalkTopic] = useState<'exam-stress' | 'social'>('exam-stress');
  const [selectedCoach, setSelectedCoach] = useState<CoachItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const fetchCoaches = () => {
    setLoadingCoaches(true);
    setCoachesError(false);
    api.get("/contacts/coaches")
      .then((res) => {
        if (res.data && res.data.coaches && res.data.coaches.length > 0) {
          setCoaches(res.data.coaches);
        } else {
          setCoaches(DEFAULT_COACHES);
        }
      })
      .catch((err) => {
        console.log("Using fallback coaches:", err);
        setCoaches(DEFAULT_COACHES);
      })
      .finally(() => {
        setLoadingCoaches(false);
      });
  };

  useEffect(() => {
    fetchCoaches();
  }, []);
 
  const handleCrisisClick = () => navigate("/crisis");
  const handleCheckInClick = () => {
    sessionStorage.setItem("last_test_started", "checkin");
    navigate("/discover?start=checkin");
  };

  const handleWriteMindlyClick = () => {
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
    if (isAuthenticated) {
      navigate("/dashboard?tab=talkmindly");
    } else {
      navigate(`/login?redirect=${encodeURIComponent("/dashboard?tab=talkmindly")}`);
    }
  };
 
  const confirmBooking = () => {
    if (!selectedCoach || selectedSlot === null) return;
    navigate(`/login?redirect=${encodeURIComponent("/dashboard?tab=sessionbooking")}`);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-rose/20 selection:text-ink relative overflow-x-hidden pb-12 flex flex-col justify-between">
      {showBetaBanner && (
        <div className="w-full bg-[#fcf8f2] border-b border-amber-200/45 py-2.5 px-6 text-center text-xs font-semibold text-amber-800 relative z-50 flex items-center justify-center gap-2 select-none">
          <span>✨ <b>Private Beta</b>: You are one of 100 selected students testing this early version. Help us shape peer support.</span>
          <button 
            type="button"
            onClick={() => setShowBetaBanner(false)}
            aria-label="Close beta banner"
            className="text-amber-800 hover:text-amber-950 font-bold ml-2 cursor-pointer border-none bg-transparent flex items-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <div>
        {/* Header Layout */}
        <LandingHeader onCrisisClick={handleCrisisClick} />

        {/* Main Content Layout */}
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-6 relative z-10">
          {/* Hero Section */}
          <HeroSection 
            onCheckInClick={handleCheckInClick} 
            onBookCoachClick={() => {
              document.getElementById('coaching-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onBubbleClick={(bubbleId) => {
              document.getElementById('explore-tools')?.scrollIntoView({ behavior: 'smooth' });
              setActiveOfferTab(bubbleId);
            }}
          />

          {/* 3D Interactive Section: WHAT WE PROVIDE */}
          <ExploreToolsSection
            activeOfferTab={activeOfferTab}
            onOfferTabChange={setActiveOfferTab}
            mockWritePrompt={mockWritePrompt}
            onMockWritePromptChange={setMockWritePrompt}
            mockTalkTopic={mockTalkTopic}
            onTalkTopicChange={setMockTalkTopic}
            coaches={coaches}
            activePreviewCoachIndex={activePreviewCoachIndex}
            onPreviewCoachChange={setActivePreviewCoachIndex}
            onWriteMindlyClick={handleWriteMindlyClick}
            onTalkMindlyClick={handleTalkMindlyClick}
          />

          {/* Redesigned Mobile-First "Book a Coach" Section */}
          <CoachingSection
            coaches={coaches}
            loading={loadingCoaches}
            error={coachesError}
            onRetry={fetchCoaches}
            onSelectCoach={(coach) => {
              setSelectedCoach(coach);
              setSelectedSlot(null);
            }}
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
      />

      {/* Coming Soon Feature Modal */}
      <ComingSoonModal
        show={comingSoonFeature !== null}
        onClose={() => setComingSoonFeature(null)}
        feature={comingSoonFeature}
      />

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-paper border border-line rounded-[2.5rem] max-w-lg w-full p-8 sm:p-10 shadow-2xl relative"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-plum/10 text-plum mb-6 shadow-inner select-none">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              
              <h3 className="font-serif text-3xl font-bold mb-4 text-ink tracking-tight">
                Before you look around...
              </h3>
              
              <p className="text-sm text-ink-soft leading-relaxed mb-4">
                Hi – and thank you for doing this. You're one of a small handful of students seeing this very early.
              </p>
              
              <p className="text-sm text-ink-soft leading-relaxed mb-6">
                We're building a quiet, private space for students to check in with how they're feeling, and we want to know what you honestly make of it before we show it to anyone else.
              </p>
              
              <ul className="space-y-3 mb-8 text-xs sm:text-sm font-semibold text-slate-700">
                <li className="flex gap-2.5 items-start">
                  <span className="text-plum mt-0.5">✔</span>
                  <span><b>The check-in works</b>. Go ahead and try it for real.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-plum mt-0.5">✔</span>
                  <span><b>TalkMindly is active</b>. Explore the anonymous, moderated peer spaces.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-plum mt-0.5">✔</span>
                  <span><b>There are no right answers.</b> We want your honest reaction, including the parts that feel off or fake.</span>
                </li>
              </ul>
              
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleCloseWelcome}
                  className="cursor-pointer w-full bg-plum hover:bg-plum/90 text-plum-50 font-extrabold text-sm py-4 rounded-2xl transition-colors shadow-lg shadow-plum/20 border-none"
                >
                  Okay, let me in
                </button>
                <p className="text-center text-[11px] text-slate-400 font-medium leading-none">
                  Your feedback is anonymous and only seen by the creators.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
