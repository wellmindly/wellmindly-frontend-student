import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Shield, ArrowRight, Lock, 
  PenTool, MessageSquare, Users, Heart 
} from "lucide-react";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { HeroSection } from "../components/landing/HeroSection";
import { ComingSoonModal } from "../components/dashboard/ComingSoonModal";
import { config } from "../config";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export interface CoachItem {
  id?: string;
  name: string;
  role: string;
  init: string;
  c1: string;
  specs: string[];
  bio?: string;
  avatarUrl?: string;
}

const DEFAULT_COACHES: CoachItem[] = [
  {
    name: "Varisha Nigar",
    role: "Psychology & Peer Support Coach",
    init: "VN",
    c1: "from-[#d8472f] to-[#a8331f]",
    specs: ["Psychology Mentorship", "Peer Support", "Mental Health"],
    bio: "Dedicated academic and psychology professional providing personalized mentorship.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Vinayak Katyayan",
    role: "Youth Mental Health & Recovery Coach",
    init: "VK",
    c1: "from-[#0e7c6e] to-[#0a5a4a]",
    specs: ["Youth Mental Health", "Clinical Care", "Structured Recovery"],
    bio: "Clinical Psychologist & PhD Scholar at KGMU focusing on emotional wellbeing.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Garvita Singh",
    role: "Youth Wellbeing & Resilience Coach",
    init: "GS",
    c1: "from-[#6d28d9] to-[#4818a0]",
    specs: ["Youth Wellbeing", "Resilience", "Stress Management"],
    bio: "Educator with 9+ years experience empowering youth to grow academically and personally.",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80"
  },
  {
    name: "Jairus Rohan",
    role: "Behavioral Health & Neurodiversity Coach",
    init: "JR",
    c1: "from-[#c8973a] to-[#a06f1f]",
    specs: ["Behavioral Health", "Neurodiversity (ADHD)", "Skill Building"],
    bio: "Behavioral professional supporting youth with neurodiversity, ADHD, and emotional regulation.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80"
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
  
  const [coaches, setCoaches] = useState<CoachItem[]>(DEFAULT_COACHES);
  const [activeOfferTab, setActiveOfferTab] = useState<'blueprints' | 'writemindly' | 'talkmindly'>('blueprints');
  const [activePreviewCoachIndex, setActivePreviewCoachIndex] = useState(0);
  const [mockWritePrompt, setMockWritePrompt] = useState(0);
  const [mockTalkTopic, setMockTalkTopic] = useState<'exam-stress' | 'social'>('exam-stress');
  const [selectedCoach, setSelectedCoach] = useState<CoachItem | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    api.get("/contacts/coaches")
      .then((res) => {
        if (res.data && res.data.coaches && res.data.coaches.length > 0) {
          setCoaches(res.data.coaches);
        }
      })
      .catch((err) => {
        console.log("Using default coaches from backend seed:", err);
      });
  }, []);
 
  const handleCrisisClick = () => navigate("/crisis");
  const handleCheckInClick = () => {
    sessionStorage.setItem("last_test_started", "checkin");
    navigate("/discover?start=checkin");
  };
  const handleStartDiscovery = () => navigate("/discover");
 
  const handleWriteMindlyClick = () => {
    if (!config.enableWriteMindly) {
      setComingSoonFeature("writemindly");
      return;
    }
    if (isAuthenticated) {
      navigate("/dashboard?tab=writemindly");
    } else {
      navigate("/login?redirect=/dashboard?tab=writemindly");
    }
  };

  const handleTalkMindlyClick = () => {
    if (isAuthenticated) {
      navigate("/dashboard?tab=talkmindly");
    } else {
      navigate("/login?redirect=/dashboard?tab=talkmindly");
    }
  };
 
  const confirmBooking = () => {
    if (selectedSlot === null || !selectedCoach) return;
    const coachFirstName = selectedCoach.name.split(" ")[0];
    const slotText = BOOKING_SLOTS[selectedSlot];
    setSelectedCoach(null);
    showToast(`Session booked with ${coachFirstName} · ${slotText}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-rose/20 selection:text-ink relative overflow-x-hidden pb-12 flex flex-col justify-between">
      {showBetaBanner && (
        <div className="w-full bg-[#fcf8f2] border-b border-amber-200/45 py-2.5 px-6 text-center text-xs font-semibold text-amber-800 relative z-50 flex items-center justify-center gap-2 select-none">
          <span>✨ <b>Private Beta</b>: You are one of 100 selected students testing this early version. Help us shape peer support.</span>
          <button 
            onClick={() => setShowBetaBanner(false)}
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
        <main className="mx-auto max-w-6xl px-6 relative z-10">
          {/* Hero Section */}
          <HeroSection 
            onCheckInClick={handleCheckInClick} 
            onStartDiscovery={handleStartDiscovery} 
            onBookCoachClick={() => {
              document.getElementById('coaching-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onBubbleClick={(question) => {
              document.getElementById('explore-tools')?.scrollIntoView({ behavior: 'smooth' });
              if (question.includes('who even am I')) {
                setActiveOfferTab('writemindly');
              } else if (question.includes('is it just me')) {
                setActiveOfferTab('talkmindly');
              } else {
                setActiveOfferTab('blueprints');
              }
            }}
          />

          {/* 3D Interactive Section: WHAT WE PROVIDE */}
          <section className="py-16 border-t border-line/60" id="explore-tools">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">WHAT WE PROVIDE</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium">
                Proactive care that meets you where you are.
              </h2>
              <p className="text-sm text-ink-soft mt-3">
                Experience our three core pillars in interactive 3D tiles. Tap any tile to test live features right now.
              </p>
            </div>

            {/* Interactive 3D Tiles Container */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 [perspective:1000px]">
              
              {/* 3D Tile 1: WriteMindly AI */}
              <motion.div
                whileHover={{ rotateY: -2, rotateX: 2, y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className={`bg-card border rounded-[2rem] p-6 sm:p-8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  activeOfferTab === 'writemindly' ? "border-plum ring-2 ring-plum/20" : "border-line"
                }`}
                onClick={() => setActiveOfferTab('writemindly')}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-teal/10 to-transparent rounded-full pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center font-bold shadow-inner">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold bg-teal/10 text-teal px-3 py-1 rounded-full uppercase tracking-wider">
                      Private AI Companion
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-ink mb-2">WriteMindly</h3>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-6">
                    Say it to something that won't judge you. Type whatever's running in your head—messy, half-formed, 2am. Reframes thoughts without public exposure.
                  </p>

                  {/* Mini Live Simulator inside Tile */}
                  <div className="bg-paper-2 border border-line/70 rounded-2xl p-4 text-xs space-y-3 mb-6">
                    <div className="text-[10px] font-bold text-ink-soft uppercase tracking-wider border-b border-line pb-2 flex justify-between items-center">
                      <span>Try AI Reflection</span>
                      <span className="w-2 h-2 rounded-full bg-teal animate-ping" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMockWritePrompt(0); setActiveOfferTab('writemindly'); }}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border-none ${
                          mockWritePrompt === 0 ? "bg-teal text-white shadow-sm" : "bg-paper text-ink-soft hover:text-ink"
                        }`}
                      >
                        Academic
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMockWritePrompt(1); setActiveOfferTab('writemindly'); }}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border-none ${
                          mockWritePrompt === 1 ? "bg-teal text-white shadow-sm" : "bg-paper text-ink-soft hover:text-ink"
                        }`}
                      >
                        Lonely
                      </button>
                    </div>
                    <div className="p-3 bg-paper rounded-xl border border-line/40 text-[11px] text-left leading-relaxed">
                      <div className="font-bold text-ink mb-1">
                        {mockWritePrompt === 0 ? "📝 Student: I have 3 deadlines tomorrow and I can't start..." : "📝 Student: It feels like everyone else fit in easily..."}
                      </div>
                      <div className="text-teal font-medium">
                        {mockWritePrompt === 0 
                          ? "✨ WriteMindly: Take a breath. Let's isolate the closest deadline. What's one paragraph you can write in 15 mins?" 
                          : "✨ WriteMindly: Feeling disconnected in a new space is very common. Give yourself permission to go at your own pace today."
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleWriteMindlyClick(); }}
                  className="rounded-full bg-navy text-white py-3.5 px-6 text-xs font-bold w-full hover:bg-navy/90 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  Start Private Writing
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>

              {/* 3D Tile 2: TalkMindly Peer Support */}
              <motion.div
                whileHover={{ rotateY: 0, rotateX: 2, y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className={`bg-card border rounded-[2rem] p-6 sm:p-8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  activeOfferTab === 'talkmindly' ? "border-plum ring-2 ring-plum/20" : "border-line"
                }`}
                onClick={() => setActiveOfferTab('talkmindly')}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-plum/10 to-transparent rounded-full pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-plum/10 text-plum flex items-center justify-center font-bold shadow-inner">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold bg-plum/10 text-plum px-3 py-1 rounded-full uppercase tracking-wider">
                      Peer Support Circles
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-ink mb-2">TalkMindly</h3>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-6">
                    Say it to people who actually get it. Moderated 24/7 anonymous student circles. Zero DMs, no real names, no social pressure.
                  </p>

                  {/* Mini Live Simulator inside Tile */}
                  <div className="bg-paper-2 border border-line/70 rounded-2xl p-4 text-xs space-y-3 mb-6">
                    <div className="text-[10px] font-bold text-ink-soft uppercase tracking-wider border-b border-line pb-2 flex justify-between items-center">
                      <span>Live Channel Simulator</span>
                      <span className="text-plum font-bold">#anonymous-chat</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMockTalkTopic('exam-stress'); setActiveOfferTab('talkmindly'); }}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border-none ${
                          mockTalkTopic === 'exam-stress' ? "bg-plum text-white shadow-sm" : "bg-paper text-ink-soft hover:text-ink"
                        }`}
                      >
                        Burnout
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setMockTalkTopic('social'); setActiveOfferTab('talkmindly'); }}
                        className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border-none ${
                          mockTalkTopic === 'social' ? "bg-plum text-white shadow-sm" : "bg-paper text-ink-soft hover:text-ink"
                        }`}
                      >
                        Campus Life
                      </button>
                    </div>
                    <div className="p-3 bg-paper rounded-xl border border-line/40 text-[11px] text-left leading-relaxed space-y-2">
                      {mockTalkTopic === 'exam-stress' ? (
                        <>
                          <div className="text-ink">
                            <span className="font-extrabold text-[#7c9473] mr-1">Sage:</span>
                            Anyone else staring at code wanting to scream?
                          </div>
                          <div className="text-plum font-medium pl-2 border-l-2 border-plum/30">
                            <span className="font-extrabold text-plum mr-1">Lotus:</span>
                            Close laptop, take a 10m walk! You've got this.
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-ink">
                            <span className="font-extrabold text-[#e0863f] mr-1">Fern:</span>
                            Quiet in dorms tonight, feels hard to connect.
                          </div>
                          <div className="text-plum font-medium pl-2 border-l-2 border-plum/30">
                            <span className="font-extrabold text-plum mr-1">Tulip:</span>
                            Same here! Let's grab library coffee tomorrow.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTalkMindlyClick(); }}
                  className="rounded-full bg-navy text-white py-3.5 px-6 text-xs font-bold w-full hover:bg-navy/90 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  Join Peer Rooms
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>

              {/* 3D Tile 3: 1-on-1 Coaching */}
              <motion.div
                whileHover={{ rotateY: 2, rotateX: 2, y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className={`bg-card border rounded-[2rem] p-6 sm:p-8 shadow-md hover:shadow-xl transition-all flex flex-col justify-between relative overflow-hidden cursor-pointer ${
                  activeOfferTab === 'blueprints' ? "border-plum ring-2 ring-plum/20" : "border-line"
                }`}
                onClick={() => setActiveOfferTab('blueprints')}
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-coral/10 to-transparent rounded-full pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-coral/10 text-coral flex items-center justify-center font-bold shadow-inner">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold bg-coral/10 text-coral px-3 py-1 rounded-full uppercase tracking-wider">
                      Human 1-on-1 Support
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-ink mb-2">Mindset Coaching</h3>
                  <p className="text-xs sm:text-sm text-ink-soft leading-relaxed mb-6">
                    Book confidential 1-on-1 sessions with trained student coaches to navigate academic stress, motivation, and resilience.
                  </p>

                  {/* Mini Live Simulator inside Tile */}
                  <div className="bg-paper-2 border border-line/70 rounded-2xl p-4 text-xs space-y-3 mb-6">
                    <div className="text-[10px] font-bold text-ink-soft uppercase tracking-wider border-b border-line pb-2 flex justify-between items-center">
                      <span>Available Wellbeing Coaches</span>
                      <span className="text-emerald-600 font-bold">● Active</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {coaches.map((c, idx) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActivePreviewCoachIndex(idx); setActiveOfferTab('blueprints'); }}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border-none ${
                            activePreviewCoachIndex === idx ? "bg-coral text-white shadow-sm" : "bg-paper text-ink-soft hover:text-ink"
                          }`}
                        >
                          {c.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 bg-paper rounded-xl border border-line/40 text-[11px] text-left leading-relaxed">
                      <div className="font-bold text-ink">{coaches[activePreviewCoachIndex]?.name}</div>
                      <div className="text-[10px] text-ink-soft mb-1">{coaches[activePreviewCoachIndex]?.role}</div>
                      <div className="flex flex-wrap gap-1">
                        {(coaches[activePreviewCoachIndex]?.specs || []).slice(0, 2).map(s => (
                          <span key={s} className="bg-paper-2 text-ink-soft text-[9px] font-bold px-1.5 py-0.5 rounded border border-line">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    document.getElementById('coaching-section')?.scrollIntoView({ behavior: 'smooth' }); 
                  }}
                  className="rounded-full bg-navy text-white py-3.5 px-6 text-xs font-bold w-full hover:bg-navy/90 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  Book 1-on-1 Session
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </div>

            {/* Integrated Mobile Safety & Trust Strip */}
            <div className="bg-paper border border-line rounded-3xl p-6 shadow-sm">
              <div className="text-center mb-4">
                <span className="text-[10px] font-bold text-teal uppercase tracking-widest">Built For Complete Safety</span>
                <h4 className="text-lg font-serif font-bold text-ink mt-1">Safe enough to be honest.</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div className="bg-card border border-line/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink text-xs">100% Anonymous</div>
                    <div className="text-[10px] text-ink-soft">No real names or emails</div>
                  </div>
                </div>

                <div className="bg-card border border-line/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink text-xs">24/7 Moderated</div>
                    <div className="text-[10px] text-ink-soft">Real team safety checks</div>
                  </div>
                </div>

                <div className="bg-card border border-line/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink text-xs">No Direct DMs</div>
                    <div className="text-[10px] text-ink-soft">Zero cornering or spam</div>
                  </div>
                </div>

                <div className="bg-card border border-line/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-ink text-xs">You're in Control</div>
                    <div className="text-[10px] text-ink-soft">Leave or clear anytime</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Redesigned Mobile-First "Book a Coach" Section */}
          <section className="py-16 border-t border-line/60" id="coaching-section">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest flex items-center justify-center gap-2 mb-3">
                Real Human Support
                <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-bold px-2.5 py-0.5 rounded-full normal-case tracking-normal border border-emerald-500/20">● Live 1-on-1 Sessions</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium">
                Book a coach when you want to talk.
              </h2>
              <p className="text-sm text-ink-soft mt-3">
                When you'd rather talk it through, book a confidential session with a trained student coach. Academic stress, motivation, and balance on your terms.
              </p>
            </div>

            {/* Free Sessions Mobile Banner */}
            <div className="bg-gradient-to-r from-teal/10 via-[#eadfce]/20 to-teal/10 border border-line rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 mb-8 text-xs font-medium">
              <div className="flex items-center gap-3">
                <span className="bg-ember text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shrink-0">Free</span>
                <span className="text-ink text-left">Everyone gets <b>4 free sessions</b> funded by your institution.</span>
              </div>
              <span className="text-[11px] font-bold text-teal shrink-0">No credit card required</span>
            </div>

            {/* Mobile Snap Carousel / Desktop Responsive Grid */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible no-scrollbar">
              {coaches.map((coach) => (
                <div 
                  key={coach.name} 
                  className="bg-card border border-line rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all min-w-[260px] sm:min-w-0 snap-center shrink-0 sm:shrink"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      {coach.avatarUrl ? (
                        <img src={coach.avatarUrl} alt={coach.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-line" />
                      ) : (
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${coach.c1} text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm`}>
                          {coach.init}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-ink text-sm leading-tight">{coach.name}</h4>
                        <div className="text-[11px] text-ink-soft line-clamp-1">{coach.role}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {coach.specs.map((s) => (
                        <span key={s} className="bg-paper text-ink-soft text-[10px] font-bold px-2 py-0.8 rounded-full border border-line/40">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-3 border-t border-line/50">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                      Available this week
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedCoach(coach); setSelectedSlot(null); }}
                      className="w-full bg-navy text-white text-xs font-bold py-3 rounded-xl hover:bg-navy/90 transition-colors cursor-pointer border-none shadow-sm min-h-[44px]"
                    >
                      Book a session
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-ink-soft text-center max-w-2xl mx-auto mt-6">
              Our coaches are trained peer mentors focused on wellbeing, stress relief, and academic resilience. Professional clinical care guidance is provided whenever specialized support is needed.
            </p>
          </section>

          {/* Institutional Trust Section */}
          <section className="py-16 border-t border-line/60" id="campus-support">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-coral uppercase tracking-widest mb-3">Institutional Trust</span>
                <h2 className="text-3xl font-serif text-ink tracking-tight font-medium mb-4">
                  Your university never sees you as a name.
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed">
                  WellMindly shares nothing about you as an individual: not your check-ins, not your messages, and not your identity. Universities only ever see aggregated campus pulse trends.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="bg-card border border-line rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="bg-paper border-b border-line px-6 py-4 text-xs font-bold text-ink tracking-wider uppercase select-none">
                    How we fit alongside campus support
                  </div>
                  
                  <div className="divide-y divide-line/60">
                    <div className="p-4 sm:p-5 grid grid-cols-12 gap-3 text-xs">
                      <div className="col-span-4 font-bold text-ink-soft uppercase select-none">Dimension</div>
                      <div className="col-span-4 font-semibold text-teal">WellMindly</div>
                      <div className="col-span-4 font-semibold text-ink-soft">Campus Support</div>
                    </div>

                    <div className="p-4 sm:p-5 grid grid-cols-12 gap-3 text-xs">
                      <div className="col-span-4 font-bold text-ink">Scope</div>
                      <div className="col-span-4 text-ink-soft">Peer coaching & reflection</div>
                      <div className="col-span-4 text-ink-soft">Clinical assessment & therapy</div>
                    </div>

                    <div className="p-4 sm:p-5 grid grid-cols-12 gap-3 text-xs">
                      <div className="col-span-4 font-bold text-ink">Privacy</div>
                      <div className="col-span-4 text-ink-soft">100% private & anonymous</div>
                      <div className="col-span-4 text-ink-soft">Official logs in student records</div>
                    </div>

                    <div className="p-4 sm:p-5 grid grid-cols-12 gap-3 text-xs">
                      <div className="col-span-4 font-bold text-ink">Speed</div>
                      <div className="col-span-4 text-ink-soft">Match in &lt;24 hours</div>
                      <div className="col-span-4 text-ink-soft">Subject to waitlists</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Footer Layout */}
      <LandingFooter onCrisisClick={handleCrisisClick} />

      {/* Coach Booking Modal */}
      <AnimatePresence>
        {selectedCoach && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-paper border border-line rounded-3xl max-w-md w-full p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedCoach(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-paper-2/40 hover:bg-paper-2/80 transition-colors flex items-center justify-center text-ink-soft hover:text-ink cursor-pointer border-none"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif text-2xl font-medium mb-1 text-ink">
                Book with {selectedCoach.name.split(" ")[0]}
              </h3>
              <p className="text-xs text-ink-soft mb-6">
                {selectedCoach.role} &middot; Your free university session
              </p>

              <div className="text-xs font-bold text-ink uppercase tracking-wider mb-2.5">
                Available slots
              </div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {BOOKING_SLOTS.map((slot, idx) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(idx)}
                    className={`px-3 py-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      selectedSlot === idx 
                        ? "bg-navy border-navy text-white"
                        : "bg-white border-line text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <button
                onClick={confirmBooking}
                disabled={selectedSlot === null}
                className="w-full bg-[#121a30] text-white font-bold text-xs py-3.5 rounded-xl hover:bg-[#1d2843] transition-colors cursor-pointer border-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm booking
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Popup Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 30, x: "-50%" }}
            className="fixed bottom-8 left-1/2 bg-navy text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-2xl z-50 text-center select-none"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
                <Heart className="h-6 w-6 fill-current animate-pulse" />
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
                  onClick={handleCloseWelcome}
                  className="cursor-pointer w-full bg-plum hover:bg-plum/90 text-white font-extrabold text-sm py-4 rounded-2xl transition-colors shadow-lg shadow-plum/20 border-none"
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
