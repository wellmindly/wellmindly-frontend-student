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



const COACHES = [
  { name: "Riya Kapoor", role: "Wellbeing Coach", init: "RK", c1: "from-[#d8472f] to-[#a8331f]", specs: ["Stress", "Confidence", "Anxiety"] },
  { name: "Marcus Bell", role: "Mindset & Focus Coach", init: "MB", c1: "from-[#0e7c6e] to-[#0a5a4a]", specs: ["Focus", "Motivation", "Habits"] },
  { name: "Sara Nakamura", role: "Wellbeing & Balance Coach", init: "SN", c1: "from-[#6d28d9] to-[#4818a0]", specs: ["Balance", "Burnout", "Sleep"] },
  { name: "Tom Okafor", role: "Resilience Coach", init: "TO", c1: "from-[#c8973a] to-[#a06f1f]", specs: ["Setbacks", "Resilience", "Big changes"] }
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
  
  // Interactive Section States
  const [activeOfferTab, setActiveOfferTab] = useState<'blueprints' | 'writemindly' | 'talkmindly'>('blueprints');
  const [activeAudience, setActiveAudience] = useState<'students' | 'universities'>('students');
  const [mockWritePrompt, setMockWritePrompt] = useState(0);
  const [mockTalkTopic, setMockTalkTopic] = useState<'exam-stress' | 'social'>('exam-stress');
  const [selectedCoach, setSelectedCoach] = useState<typeof COACHES[0] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");
 
  const handleCrisisClick = () => navigate("/crisis");
  const handleCheckInClick = () => navigate("/discover?start=checkin");
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

 
  const handleBookCoach = () => {
    setComingSoonFeature("sessionbooking");
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
          />
          <section className="py-16 border-t border-line/60" id="explore-tools">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">WHAT WE PROVIDE</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium">
                Proactive care that meets you where you are.
              </h2>
              <p className="text-sm text-ink-soft mt-3">
                Explore our three core pillars designed to fit your day-to-day routine. Select a tool to see how it works.
              </p>
            </div>

            {/* Tab selector */}
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              <button
                onClick={() => setActiveOfferTab('blueprints')}
                className={`px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeOfferTab === 'blueprints'
                    ? "bg-plum text-white shadow-md"
                    : "bg-card text-ink-soft border border-line hover:border-ink hover:text-ink"
                }`}
              >
                Self-Discovery Blueprints
              </button>
              <button
                onClick={() => setActiveOfferTab('writemindly')}
                className={`px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeOfferTab === 'writemindly'
                    ? "bg-plum text-white shadow-md"
                    : "bg-card text-ink-soft border border-line hover:border-ink hover:text-ink"
                }`}
              >
                WriteMindly AI
              </button>
              <button
                onClick={() => setActiveOfferTab('talkmindly')}
                className={`px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeOfferTab === 'talkmindly'
                    ? "bg-plum text-white shadow-md"
                    : "bg-card text-ink-soft border border-line hover:border-ink hover:text-ink"
                }`}
              >
                TalkMindly Peer Support
              </button>
            </div>

            {/* Tab content panel */}
            <div className="bg-card border border-line rounded-[2rem] p-8 sm:p-12 shadow-sm min-h-[380px] grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-plum/5 to-transparent rounded-full pointer-events-none" />
              
              <div className="md:col-span-6 flex flex-col items-start text-left">
                <AnimatePresence mode="wait">
                  {activeOfferTab === 'blueprints' && (
                    <motion.div
                      key="blueprints-info"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <span className="text-[10px] font-bold text-teal uppercase tracking-widest">Self-Discovery</span>
                      <h3 className="text-2xl font-serif text-ink font-bold leading-snug">Character Blueprints</h3>
                      <p className="text-sm text-ink-soft leading-relaxed">
                        Take a few minutes to explore your personality traits, signature strengths, and core values. No test is clinical—they are built to help you reflect, find your footing, and understand what drives you.
                      </p>
                      <button
                        onClick={handleStartDiscovery}
                        className="rounded-full bg-navy text-white px-6 py-3 text-xs font-bold hover:bg-navy/90 transition-all cursor-pointer border-none flex items-center gap-2"
                      >
                        Try a Blueprint
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}

                  {activeOfferTab === 'writemindly' && (
                    <motion.div
                      key="writemindly-info"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <span className="text-[10px] font-bold text-teal uppercase tracking-widest">Private AI Companion</span>
                      <h3 className="text-2xl font-serif text-ink font-bold leading-snug">Empathetic Reflective Journal</h3>
                      <p className="text-sm text-ink-soft leading-relaxed">
                        Write down whatever's running in your head at any hour. WriteMindly offers non-judgmental prompts to help you slow down, reframe stress, and find clarity without public exposure.
                      </p>
                      <button
                        onClick={handleWriteMindlyClick}
                        className="rounded-full bg-navy text-white px-6 py-3 text-xs font-bold hover:bg-navy/90 transition-all cursor-pointer border-none flex items-center gap-2"
                      >
                        Start Private Writing
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}

                  {activeOfferTab === 'talkmindly' && (
                    <motion.div
                      key="talkmindly-info"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-4"
                    >
                      <span className="text-[10px] font-bold text-teal uppercase tracking-widest">Peer Group Spaces</span>
                      <h3 className="text-2xl font-serif text-ink font-bold leading-snug">Anonymous Student Circles</h3>
                      <p className="text-sm text-ink-soft leading-relaxed">
                        Join safe, 24/7 moderated group chat channels. Share experiences about academic burnout, social circles, or campus transitions anonymously. No real names, no profiles, and zero DMs.
                      </p>
                      <button
                        onClick={() => {
                          if (isAuthenticated) {
                            navigate("/dashboard");
                          } else {
                            navigate("/login?redirect=/dashboard");
                          }
                        }}
                        className="rounded-full bg-navy text-white px-6 py-3 text-xs font-bold hover:bg-navy/90 transition-all cursor-pointer border-none flex items-center gap-2"
                      >
                        Join Peer Rooms
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interactive side previews */}
              <div className="md:col-span-6 flex justify-center items-center h-full w-full">
                <AnimatePresence mode="wait">
                  {activeOfferTab === 'blueprints' && (
                    <motion.div
                      key="blueprints-preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full bg-paper border border-line rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center text-left">
                        <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">Blueprint preview</span>
                        <span className="text-[10px] font-bold bg-gold/10 text-gold-dark px-2.5 py-0.5 rounded-full">Strengths Card</span>
                      </div>
                      <div className="space-y-2 text-left">
                        <div className="text-sm font-bold text-ink">Select a trait below to review:</div>
                        <div className="flex flex-wrap gap-1.5">
                          {["Perseverance", "Creativity", "Bravery", "Gratitude"].map((trait, idx) => (
                            <button
                              key={trait}
                              onClick={() => setMockWritePrompt(idx)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                mockWritePrompt === idx
                                  ? "bg-gold text-white"
                                  : "bg-paper-2 text-ink-soft hover:text-ink border border-line"
                              }`}
                            >
                              {trait}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-paper-2 rounded-2xl border border-line/65 text-xs text-ink-soft leading-relaxed min-h-[90px] flex items-center text-left">
                        {mockWritePrompt === 0 && "🔥 Perseverance: You keep going when things get tough. You don't leave tasks half-done."}
                        {mockWritePrompt === 1 && "🎨 Creativity: You discover original solutions. The flip side is occasionally overthinking simple steps."}
                        {mockWritePrompt === 2 && "🛡️ Bravery: You stand up for what matters, even when it's uncomfortable or intimidating."}
                        {mockWritePrompt === 3 && "🙏 Gratitude: You naturally notice the good around you. It helps anchor you during stressful weeks."}
                      </div>
                    </motion.div>
                  )}

                  {activeOfferTab === 'writemindly' && (
                    <motion.div
                      key="writemindly-preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full bg-paper border border-line rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-line pb-3 text-left">
                        <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">Private Journal Simulator</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-teal" />
                      </div>
                      <div className="space-y-2 text-left">
                        <div className="text-xs font-bold text-ink-soft">Click a topic to start:</div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMockWritePrompt(0)}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                              mockWritePrompt === 0
                                ? "bg-teal text-white"
                                : "bg-paper-2 text-ink-soft border border-line"
                            }`}
                          >
                            Academic Stress
                          </button>
                          <button
                            onClick={() => setMockWritePrompt(1)}
                            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                              mockWritePrompt === 1
                                ? "bg-teal text-white"
                                : "bg-paper-2 text-ink-soft border border-line"
                            }`}
                          >
                            Feeling Lonely
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 bg-paper-2 p-3.5 rounded-2xl border border-line/65 text-xs text-left">
                        <div className="font-bold text-ink">
                          {mockWritePrompt === 0 ? "📝 Student: I have 3 deadlines tomorrow and I can't start..." : "📝 Student: It feels like everyone else has fit in easily..."}
                        </div>
                        <div className="text-teal font-medium pl-2.5 border-l-2 border-teal/40">
                          {mockWritePrompt === 0 
                            ? "✨ WriteMindly: Take a breath. Let's isolate the closest deadline. What is a single paragraph you can write in the next 15 minutes?" 
                            : "✨ WriteMindly: Feeling disconnected in a new space is very common. Give yourself permission to go at your own pace today."
                          }
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeOfferTab === 'talkmindly' && (
                    <motion.div
                      key="talkmindly-preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full bg-paper border border-line rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center border-b border-line pb-3 text-left">
                        <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">#anonymous-chat</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setMockTalkTopic('exam-stress')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              mockTalkTopic === 'exam-stress' ? "bg-plum text-white" : "bg-paper-2 text-ink-soft"
                            }`}
                          >
                            Burnout
                          </button>
                          <button
                            onClick={() => setMockTalkTopic('social')}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              mockTalkTopic === 'social' ? "bg-plum text-white" : "bg-paper-2 text-ink-soft"
                            }`}
                          >
                            Socials
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 min-h-[140px] flex flex-col justify-end text-xs">
                        {mockTalkTopic === 'exam-stress' ? (
                          <>
                            <div className="bg-paper-2 p-3 rounded-2xl rounded-tl-none border border-line/45 max-w-[85%] self-start text-left">
                              <span className="block text-[9px] font-extrabold text-[#7c9473] mb-1">Anonymous Sage</span>
                              Anyone else staring at the code compiler and wanting to scream?
                            </div>
                            <div className="bg-plum/10 p-3 rounded-2xl rounded-tr-none border border-plum/10 max-w-[85%] self-end text-left">
                              <span className="block text-[9px] font-extrabold text-plum mb-1">Anonymous Lotus</span>
                              Spent 4 hours debugging. Closed my laptop, going to walk outside. You've got this, take a break!
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-paper-2 p-3 rounded-2xl rounded-tl-none border border-line/45 max-w-[85%] self-start text-left">
                              <span className="block text-[9px] font-extrabold text-[#e0863f] mb-1">Anonymous Fern</span>
                              Feels like everyone made friend groups in the first week. It's so quiet in the dorms.
                            </div>
                            <div className="bg-plum/10 p-3 rounded-2xl rounded-tr-none border border-plum/10 max-w-[85%] self-end text-left">
                              <span className="block text-[9px] font-extrabold text-plum mb-1">Anonymous Tulip</span>
                              Same. But it's early. Let's just grab coffee or go to the campus library together sometime.
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Interactive Audience Selector (mimics About Us but with direct interactive selector) */}
          <section className="py-16 border-t border-line/60" id="audience-selector">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">Audience Alignment</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium">
                Who WellMindly is built for.
              </h2>
              <p className="text-sm text-ink-soft mt-3">
                Select your perspective below to explore the customized features and benefits we deliver.
              </p>
            </div>

            {/* Selector buttons */}
            <div className="flex justify-center gap-3.5 mb-10">
              <button
                onClick={() => setActiveAudience('students')}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  activeAudience === 'students'
                    ? "bg-navy text-white border-navy shadow-sm"
                    : "bg-card text-ink-soft border-line hover:border-ink hover:text-ink"
                }`}
              >
                For Students
              </button>
              <button
                onClick={() => setActiveAudience('universities')}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  activeAudience === 'universities'
                    ? "bg-navy text-white border-navy shadow-sm"
                    : "bg-card text-ink-soft border-line hover:border-ink hover:text-ink"
                }`}
              >
                For Universities
              </button>
            </div>

            {/* Audience Content */}
            <div className="min-h-[220px]">
              <AnimatePresence mode="wait">
                {activeAudience === 'students' ? (
                  <motion.div
                    key="students-content"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="grid md:grid-cols-3 gap-8"
                  >
                    <div className="bg-card p-8 rounded-2xl border border-line text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-plum/10 text-plum rounded-xl inline-block mb-4 font-bold text-xs uppercase text-left">QUALITIES</div>
                      <h4 className="text-base font-bold text-ink mb-2 text-left">Discover Yourself</h4>
                      <p className="text-xs.5 text-ink-soft leading-relaxed text-left">
                        Understand your signature qualities, core values, and habits using our quick self-discovery modules.
                      </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-line text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-teal/10 text-teal rounded-xl inline-block mb-4 font-bold text-xs uppercase text-left">PRIVACY</div>
                      <h4 className="text-base font-bold text-ink mb-2 text-left">100% Anonymous Option</h4>
                      <p className="text-xs.5 text-ink-soft leading-relaxed text-left">
                        Reflect, chat, and check in without sharing your real name or emails. No tracking, no profiles.
                      </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-line text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-coral/10 text-coral rounded-xl inline-block mb-4 font-bold text-xs uppercase text-left">COMMUNITY</div>
                      <h4 className="text-base font-bold text-ink mb-2 text-left">Empathetic Peers</h4>
                      <p className="text-xs.5 text-ink-soft leading-relaxed text-left">
                        Find student circles dealing with the same pressures. Share your thoughts in a safe and moderated space.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="universities-content"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="grid md:grid-cols-3 gap-8"
                  >
                    <div className="bg-card p-8 rounded-2xl border border-line text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-teal/10 text-teal rounded-xl inline-block mb-4 font-bold text-xs uppercase text-left">OUTREACH</div>
                      <h4 className="text-base font-bold text-ink mb-2 text-left">Preventative Support</h4>
                      <p className="text-xs.5 text-ink-soft leading-relaxed text-left">
                        Catch mild/moderate student stress early, de-escalating clinical queues through self-reflection.
                      </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-line text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-plum/10 text-plum rounded-xl inline-block mb-4 font-bold text-xs uppercase text-left">INSIGHTS</div>
                      <h4 className="text-base font-bold text-ink mb-2 text-left">Anonymized Campus Trends</h4>
                      <p className="text-xs.5 text-ink-soft leading-relaxed text-left">
                        Understand macro-level student wellness patterns during exam seasons to deploy resources effectively.
                      </p>
                    </div>

                    <div className="bg-card p-8 rounded-2xl border border-line text-left shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-2.5 bg-coral/10 text-coral rounded-xl inline-block mb-4 font-bold text-xs uppercase text-left">SECURITY</div>
                      <h4 className="text-base font-bold text-ink mb-2 text-left">Safe & Compliant</h4>
                      <p className="text-xs.5 text-ink-soft leading-relaxed text-left">
                        Fully moderated channels, profile blocks, and no DMs protect your student body from harassment.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Moodboard / Color mapping (Light themed) */}
          <section className="py-16 border-t border-line/60" id="moodboard-showcase">
            <div className="bg-card text-ink border border-line rounded-[2.5rem] p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-radial-gradient(circle at top right, rgba(122,91,147,0.04), transparent 60%) pointer-events-none" />
              <div className="text-left">
                <span className="text-[11px] font-bold text-coral uppercase tracking-widest mb-3 block">Mosaic Habit Model</span>
                <h2 className="text-3xl sm:text-4xl font-serif leading-tight font-medium text-ink">
                  Every check-in becomes a color.
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed mt-4">
                  Each time you check in, it builds your moodboard and a private picture of how your weeks actually feel. No streaks to keep, no empty calendar gaps, and no pressure. Just patterns you can notice and act on.
                </p>
              </div>

              <div className="bg-paper border border-line rounded-3xl p-6.5 flex flex-col gap-4 shadow-sm">
                <div className="text-xs font-bold text-ink border-b border-line pb-3 text-left">Moodboard dimensions</div>
                
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-ink-soft mb-1">
                      <span>Energy</span>
                      <span className="text-[#e3b04b] font-bold">78%</span>
                    </div>
                    <div className="h-2 w-full bg-paper-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#e3b04b] to-[#7c9473]" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-ink-soft mb-1">
                      <span>Calm</span>
                      <span className="text-[#e0863f] font-bold">64%</span>
                    </div>
                    <div className="h-2 w-full bg-paper-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#e0863f] to-[#d8472f]" style={{ width: '64%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-ink-soft mb-1">
                      <span>Focus</span>
                      <span className="text-[#3aa78a] font-bold">71%</span>
                    </div>
                    <div className="h-2 w-full bg-paper-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#3aa78a] to-[#0e7c6e]" style={{ width: '71%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-ink-soft mb-1">
                      <span>Recovery</span>
                      <span className="text-[#9aa2bd] font-bold">48%</span>
                    </div>
                    <div className="h-2 w-full bg-paper-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#9aa2bd] to-[#6f7aa0]" style={{ width: '48%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-ink-soft mb-1">
                      <span>Motivation</span>
                      <span className="text-[#cf7794] font-bold">83%</span>
                    </div>
                    <div className="h-2 w-full bg-paper-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#cf7794] to-[#b06a78]" style={{ width: '83%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Two Ways In: WriteMindly & TalkMindly */}
          <section className="py-16 border-t border-line/60" id="core-tools">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">Core Tools</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium">
                Two ways to feel less alone.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* WriteMindly */}
              <div className="bg-card border border-line rounded-[2rem] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-ink">WriteMindly</h3>
                      <div className="text-xs font-semibold text-ink-soft">Private. Instant. Always awake.</div>
                    </div>
                  </div>
                  <h4 className="text-md font-bold text-ink mb-2">Say it to something that won't judge you.</h4>
                  <p className="text-sm text-ink-soft leading-relaxed mb-6">
                    Type whatever's on your mind: messy, half-formed, 2am, all of it. WriteMindly helps you slow down long enough to hear your own thoughts. Sometimes that's all you need. No advice unless you want it.
                  </p>
                </div>
                <button
                  onClick={handleWriteMindlyClick}
                  className="rounded-full bg-navy text-white py-3.5 px-6.5 text-xs font-bold w-full text-center hover:bg-navy/90 transition-colors cursor-pointer border-none"
                >
                  Start writing
                </button>
              </div>

              {/* TalkMindly */}
              <div className="bg-card border border-line rounded-[2rem] p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-plum/10 text-plum flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-ink">TalkMindly</h3>
                      <div className="text-xs font-semibold text-ink-soft">Anonymous. Moderated. Real people.</div>
                    </div>
                  </div>
                  <h4 className="text-md font-bold text-ink mb-2">Say it to people who actually get it.</h4>
                  <p className="text-sm text-ink-soft leading-relaxed mb-6">
                    Anonymous spaces where students talk about the things they usually keep to themselves. The pressure. The loneliness. The self-doubt. Sometimes hearing "I've felt that too" changes everything. No names, no judgment.
                  </p>
                </div>
                <button
                  onClick={() => setComingSoonFeature("talkmindly")}
                  className="rounded-full bg-navy text-white py-3.5 px-6.5 text-xs font-bold w-full text-center hover:bg-navy/95 transition-colors cursor-pointer border-none"
                >
                  Find your space
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-ink-soft italic">
              One when you want to be heard alone. One when you don't want to be alone at all.
            </p>
          </section>

          {/* TalkMindly Trust */}
          <section className="py-16 border-t border-line/60" id="safety-trust">
            <div className="max-w-3xl mx-auto text-center">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">Safety First</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium mb-4">
                Safe enough to be honest.
              </h2>
              <p className="text-sm text-ink-soft mb-12">
                Opening up to strangers is scary. So we built TalkMindly to make it safe before it makes it social.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-12">
                <div className="bg-card border border-line rounded-2xl p-5 flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-md font-bold text-ink mb-1">Anonymous</h4>
                    <p className="text-xs text-ink-soft leading-relaxed">No real names. No profiles. No one finds out it's you.</p>
                  </div>
                </div>

                <div className="bg-card border border-line rounded-2xl p-5 flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-md font-bold text-ink mb-1">Moderated</h4>
                    <p className="text-xs text-ink-soft leading-relaxed">Real people keep every space safe, around the clock.</p>
                  </div>
                </div>

                <div className="bg-card border border-line rounded-2xl p-5 flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <X className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-md font-bold text-ink mb-1">No DMs</h4>
                    <p className="text-xs text-ink-soft leading-relaxed">No private messaging. No one can corner you.</p>
                  </div>
                </div>

                <div className="bg-card border border-line rounded-2xl p-5 flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-teal/10 text-teal flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-md font-bold text-ink mb-1">You're in Control</h4>
                    <p className="text-xs text-ink-soft leading-relaxed">Leave any time. Share nothing you don't want to.</p>
                  </div>
                </div>
              </div>
              <div className="text-xs font-bold text-ink">Anonymous doesn't mean alone. It means safe.</div>
            </div>
          </section>

          {/* Book a Coach */}
          <section className="py-16 border-t border-line/60" id="coaching-section">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest flex items-center justify-center gap-2 mb-3">
                Real Human Support
                <span className="bg-plum/10 text-plum text-[9px] font-bold px-2 py-0.5 rounded-full normal-case tracking-normal">Beta / Coming Soon</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium">
                Book a coach when you want to talk.
              </h2>
              <p className="text-sm text-ink-soft mt-3">
                When you'd rather talk it through, book a session with a wellbeing coach. Stress, confidence, motivation, relationships: on your terms, around your schedule.
              </p>
            </div>

            <div className="bg-gradient-to-r from-teal/10 via-[#eadfce]/20 to-teal/10 border border-line rounded-3xl p-6.5 flex flex-wrap items-center justify-between gap-4 mb-10 text-sm font-medium">
              <div className="flex items-center gap-3">
                <span className="bg-ember text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">Free</span>
                <span className="text-ink">Everyone gets <b>4 free sessions</b> funded by your school, university, or workplace.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {COACHES.map((coach) => (
                <div 
                  key={coach.name} 
                  className="bg-card border border-line rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4.5">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${coach.c1} text-white flex items-center justify-center font-serif font-bold text-lg`}>
                        {coach.init}
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-sm.5">{coach.name}</h4>
                        <div className="text-[11px] text-ink-soft">{coach.role}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {coach.specs.map((s) => (
                        <span key={s} className="bg-paper text-ink-soft text-[10px] font-bold px-2 py-0.8 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                      Next available: this week
                    </div>
                    <button
                      onClick={() => handleBookCoach()}
                      className="w-full bg-navy text-white text-xs font-bold py-2.5 rounded-xl hover:bg-navy/90 transition-colors cursor-pointer border-none"
                    >
                      Book a session
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-ink-soft max-w-3xl">
              Coaches are non-clinical wellbeing coaches, not therapists. If anything you're facing needs clinical care, we'll gently connect you to a qualified professional. You're never left to figure it out alone.
            </p>
          </section>

          {/* University Trust (How we fit alongside campus support) */}
          <section className="py-16 border-t border-line/60" id="campus-support">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-coral uppercase tracking-widest mb-3">Institutional Trust</span>
                <h2 className="text-3xl font-serif text-ink tracking-tight font-medium mb-4">
                  Your university never sees you as a name.
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed">
                  WellMindly shares nothing about you as an individual: not your check-ins, not your messages, and not your identity. Universities only ever see the bigger picture: when whole groups are stressed, when exam season bites. The pulse of the campus, never the student.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="bg-card border border-line rounded-[2rem] overflow-hidden shadow-sm">
                  <div className="bg-paper border-b border-line px-6 py-4.5 text-xs font-bold text-ink tracking-wider uppercase select-none">
                    How we fit alongside campus support
                  </div>
                  
                  <div className="divide-y divide-line/60">
                    <div className="p-5 grid grid-cols-12 gap-4 text-xs">
                      <div className="col-span-4 font-bold text-ink-soft uppercase select-none">Dimension</div>
                      <div className="col-span-4 font-semibold text-teal">WellMindly</div>
                      <div className="col-span-4 font-semibold text-ink-soft">Campus Support</div>
                    </div>

                    <div className="p-5 grid grid-cols-12 gap-4 text-xs">
                      <div className="col-span-4 font-bold text-ink">Scope</div>
                      <div className="col-span-4 text-ink-soft">Self-discovery & peer coaching</div>
                      <div className="col-span-4 text-ink-soft">Clinical assessment & therapy</div>
                    </div>

                    <div className="p-5 grid grid-cols-12 gap-4 text-xs">
                      <div className="col-span-4 font-bold text-ink">Privacy</div>
                      <div className="col-span-4 text-ink-soft">100% private, never shared</div>
                      <div className="col-span-4 text-ink-soft">Official logs in university records</div>
                    </div>

                    <div className="p-5 grid grid-cols-12 gap-4 text-xs">
                      <div className="col-span-4 font-bold text-ink">Speed</div>
                      <div className="col-span-4 text-ink-soft">Match with coach in &lt;24 hours</div>
                      <div className="col-span-4 text-ink-soft">Often subject to waitlists</div>
                    </div>

                    <div className="p-5 grid grid-cols-12 gap-4 text-xs">
                      <div className="col-span-4 font-bold text-ink">When you need clinical care</div>
                      <div className="col-span-8 text-teal font-semibold">
                        We connect you to a campus or external clinical care professional, fast.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Onboarding & Stories (Shaped by students) */}
          <section className="py-16 border-t border-line/60" id="student-voice">
            <div className="bg-[#eadfce]/20 border border-line rounded-[2.5rem] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">Shaped by Students</span>
              <h2 className="text-3xl font-serif text-ink tracking-tight font-medium mb-4">
                Built for students. Shaped by students.
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed max-w-2xl mx-auto mb-8">
                WellMindly wasn't built because students needed another app. It was built because too many students were struggling quietly. Every tool. Every conversation. Every feature starts with one question: "What would have helped when life felt hard?"
              </p>
              <div className="text-xs font-bold text-ink-soft border-t border-line/60 pt-6">
                This is not just something you use. It's something you're helping build.
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 text-center" id="final-cta">
            <h2 className="text-4xl sm:text-5xl font-serif text-ink tracking-tight font-medium mb-4">
              Start with what's true right now.
            </h2>
            <p className="text-sm sm:text-base text-ink-soft leading-relaxed max-w-xl mx-auto mb-8">
              Start with how you're feeling right now. That's the whole first step.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartDiscovery}
              className="rounded-full bg-navy text-white px-10 py-4.5 text-sm font-bold shadow-lg shadow-navy/20 hover:bg-navy/95 transition-all text-center cursor-pointer border-none"
            >
              Explore Blueprints
            </motion.button>
            <div className="text-xs text-ink-soft/75 mt-3">
              Takes a minute. Costs nothing. No one finds out it's you.
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
                  <span><b>Two bigger features are still coming</b>. You'll see WriteMindly and TalkMindly here as previews, not finished yet.</span>
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
