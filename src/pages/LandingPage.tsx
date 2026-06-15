import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertCircle, X, Shield, ArrowRight, Lock, 
  PenTool, MessageSquare, Clock, Users, HelpCircle, Heart 
} from "lucide-react";
import { LandingHeader } from "../components/landing/LandingHeader";
import { LandingFooter } from "../components/landing/LandingFooter";
import { HeroSection } from "../components/landing/HeroSection";
import { ComingSoonModal } from "../components/dashboard/ComingSoonModal";
import { config } from "../config";
import { useAuth } from "../context/AuthContext";

// Feeling chip definitions and custom reflections
const FEELING_CHIPS = [
  { name: "Overwhelmed", emoji: "🤯", text: "When everything feels urgent, nothing gets to feel small. You're not weak for struggling to keep up — you're carrying a lot at once. Want to put some of it down for a minute?" },
  { name: "Flat", emoji: "😐", text: "Some days are just grey. You don't have to force yourself to find the bright side — sometimes just sitting with the quiet is what you need. No pressure to feel any other way right now." },
  { name: "Can't switch off", emoji: "🌀", text: "Your brain is running miles ahead of your body, replaying the past and pre-playing the future. It's exhausting. Let's slow things down, even if just for a minute." },
  { name: "Numb", emoji: "🌫️", text: "When everything gets to be too much, sometimes our brains just turn the volume down on all of it. You're not empty, you're just overloaded. Give yourself permission to just be." },
  { name: "Just tired", emoji: "🥱", text: "Not the kind of tired sleep fixes. The kind where your head is heavy and the next step feels like too much. It's okay to have nothing left in the tank today." },
  { name: "Honestly, not sure", emoji: "💭", text: "You don't need to have a label or a clear reason to feel off. It's fine to just feel 'not okay' without knowing why. We can start from there." }
];

const LAUNCH_TESTS = [
  { id: "checkin", name: "Emotional check-in", desc: "A two-minute wellbeing snapshot. See how you're really doing — and watch it shift over the weeks.", tag: "Wellbeing · 2 min", color: "from-teal to-teal/80" },
  { id: "strengths", name: "Signature strengths", desc: "Your top five character strengths — the qualities you lead with, on a card made to share.", tag: "Strengths · 2 min", color: "from-gold to-gold/80" },
  { id: "bigfive", name: "Personality profile", desc: "Five core traits that add up to an archetype that's unmistakably you.", tag: "Identity · 2 min", color: "from-sky to-sky/80" },
  { id: "strengthshadow", name: "Strength & shadow", desc: "Your greatest strength and its flip side — usually the same trait, turned up or down.", tag: "Insight · 2 min", color: "from-plum to-plum/80" },
  { id: "mood", name: "Mood snapshot", desc: "A one-tap picture check. Fast and honest — and it adds a tile to your moodboard.", tag: "Quick · 15 sec", color: "from-rose to-rose/80" },
  { id: "values", name: "What matters most", desc: "A quick this-or-that that reveals the values you quietly lead with.", tag: "Values · 90 sec", color: "from-coral to-coral/80" }
];

const COACHES = [
  { name: "Riya Kapoor", role: "Wellbeing Coach", init: "RK", c1: "from-[#d8472f] to-[#a8331f]", specs: ["Stress", "Confidence", "Anxiety"] },
  { name: "Marcus Bell", role: "Mindset & Focus Coach", init: "MB", c1: "from-[#0e7c6e] to-[#0a5a4a]", specs: ["Focus", "Motivation", "Habits"] },
  { name: "Sara Nakamura", role: "Wellbeing & Balance Coach", init: "SN", c1: "from-[#6d28d9] to-[#4818a0]", specs: ["Balance", "Burnout", "Sleep"] },
  { name: "Tom Okafor", role: "Resilience Coach", init: "TO", c1: "from-[#c8973a] to-[#a06f1f]", specs: ["Setbacks", "Resilience", "Big changes"] }
];

const BOOKING_SLOTS = ["Mon 4:00pm", "Tue 10:00am", "Wed 6:30pm", "Thu 5:00pm", "Sat 9:00am", "Sun 11:00am"];

const FOCUS_AREAS = [
  { name: "Academic Stress", text: "Deadlines, exams, and the constant feeling that you're falling behind. We help you unpack the pressure so you can focus on one small step at a time." },
  { name: "Social Anxiety", text: "Feeling lonely in a room full of people, or replaying a conversation from three days ago. Speak anonymously to other students who get it." },
  { name: "Mindful Focus", text: "Can't switch off or concentrate. Learn how to settle your mind, pause, and ground yourself when everything starts to feel urgent." },
  { name: "Just feeling off / not sure", text: "No diagnosis, no clinical labels. A simple, safe space to sit with whatever's loud in your head right now without needing to explain it." }
];

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
    document.title = "WellMindly — Get to know yourself, feel a little better";
  }, []);
  
  // Interactive Section States
  const [selectedFeeling, setSelectedFeeling] = useState<typeof FEELING_CHIPS[0] | null>(null);
  const [activeFocusIndex, setActiveFocusIndex] = useState(0);
  const [selectedCoach, setSelectedCoach] = useState<typeof COACHES[0] | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState("");
 
  const handleCrisisClick = () => navigate("/crisis");
  const handleCheckInClick = () => navigate("/discover?start=checkin");
  const handleExploreClick = () => navigate("/discover");
 
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
 
  const selectFeelingChip = (chip: typeof FEELING_CHIPS[0]) => {
    setSelectedFeeling(chip);
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
            onExploreClick={handleExploreClick} 
          />

          {/* Quick Emotional Entry */}
          <section className="py-12 sm:py-16 border-t border-line/60" id="quick-entry">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-medium mb-3">
                How have you actually been lately?
              </h2>
              <p className="text-sm text-ink-soft mb-8">
                Select what feels closest right now. No sign-up, no judgment.
              </p>
              
              <div className="flex flex-wrap gap-2.5 justify-center mb-8">
                {FEELING_CHIPS.map((chip) => {
                  const isSelected = selectedFeeling?.name === chip.name;
                  return (
                    <button
                      key={chip.name}
                      onClick={() => selectFeelingChip(chip)}
                      className={`px-4.5 py-2.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? "bg-navy text-white border-navy shadow-md scale-102"
                          : "bg-white text-ink-soft border-line hover:border-ink hover:text-ink"
                      }`}
                    >
                      <span className="mr-1.5">{chip.emoji}</span>
                      {chip.name}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {selectedFeeling && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-card border border-line rounded-3xl p-6.5 text-left shadow-lg relative"
                  >
                    <div className="text-[10px] text-teal font-bold uppercase tracking-wider mb-2 font-sans">
                      Thanks for being honest. That's harder than it sounds.
                    </div>
                    <p className="text-sm text-ink leading-relaxed font-serif mb-6">
                      {selectedFeeling.text}
                    </p>
                    
                    <div className="border-t border-line/60 pt-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-bold text-ink-soft">Here's a 60-second thing that helps. No pressure.</div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          onClick={handleCheckInClick}
                          className="w-full sm:w-auto rounded-full bg-navy text-white px-5 py-2.5 text-xs font-bold hover:bg-navy/90 transition-colors cursor-pointer border-none"
                        >
                          Try it now
                        </button>
                        <button
                          onClick={() => setSelectedFeeling(null)}
                          className="w-full sm:w-auto rounded-full border border-line bg-transparent text-ink-soft px-4 py-2.5 text-xs font-bold hover:bg-paper-2 hover:text-ink transition-colors cursor-pointer"
                        >
                          Not now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Interactive Focus Selector */}
          <section className="py-16 border-t border-line/60" id="focus-areas">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
              <div className="md:col-span-5 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-coral uppercase tracking-widest mb-3">Focus Areas</span>
                <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium leading-tight mb-4">
                  Sometimes understanding changes more than fixing.
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed mb-6">
                  Not every difficult feeling needs a solution. Sometimes it just needs a name. Sometimes it needs a little attention. The goal isn't to feel good all the time — it's to understand yourself a little better today.
                </p>
                <div className="flex flex-col gap-2">
                  {FOCUS_AREAS.map((area, idx) => (
                    <button
                      key={area.name}
                      onClick={() => setActiveFocusIndex(idx)}
                      className={`text-left px-5 py-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        activeFocusIndex === idx 
                          ? "bg-card text-ink border-line shadow-sm font-semibold"
                          : "bg-transparent text-ink-soft border-transparent hover:text-ink"
                      }`}
                    >
                      {area.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-7">
                <div className="bg-card border border-line rounded-[2rem] p-8 sm:p-12 shadow-sm min-h-[220px] flex items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-teal/5 to-transparent rounded-full pointer-events-none" />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFocusIndex}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-4 relative z-10"
                    >
                      <div className="text-xs font-bold text-teal font-sans uppercase tracking-wider">
                        {FOCUS_AREAS[activeFocusIndex].name}
                      </div>
                      <p className="text-lg sm:text-xl font-serif text-ink leading-relaxed">
                        "{FOCUS_AREAS[activeFocusIndex].text}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* Six Launch Tests */}
          <section className="py-16 border-t border-line/60" id="discover-tests">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[11px] font-bold text-coral uppercase tracking-widest block mb-3">Discovery Content</span>
              <h2 className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-medium leading-tight">
                Six quick ways to meet yourself.
              </h2>
              <p className="text-sm text-ink-soft mt-3">
                Each takes about two minutes and hands back something worth keeping. Start with a check-in, or follow your curiosity — there's no wrong place to begin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {LAUNCH_TESTS.map((test, idx) => (
                <div 
                  key={test.name} 
                  className="bg-card border border-line rounded-3xl p-6.5 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${test.color} flex items-center justify-center text-white mb-4.5 shadow-sm`}>
                      {idx === 0 && <Clock className="w-5 h-5" />}
                      {idx === 1 && <Shield className="w-5 h-5" />}
                      {idx === 2 && <Users className="w-5 h-5" />}
                      {idx === 3 && <PenTool className="w-5 h-5" />}
                      {idx === 4 && <AlertCircle className="w-5 h-5" />}
                      {idx === 5 && <HelpCircle className="w-5 h-5" />}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-ink mb-2">{test.name}</h3>
                    <p className="text-xs.5 text-ink-soft leading-relaxed mb-4">{test.desc}</p>
                  </div>
                  <div className="border-t border-line/45 pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ink-soft/80 bg-paper px-3 py-1 rounded-full">{test.tag}</span>
                    <button 
                      onClick={() => navigate(`/discover?start=${test.id}`)} 
                      className="text-xs font-bold text-teal hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                    >
                      Start
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Moodboard / Color mapping */}
          <section className="py-16 border-t border-line/60" id="moodboard-showcase">
            <div className="bg-navy text-white rounded-[2.5rem] p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-radial-gradient(circle at top right, rgba(249,168,37,0.1), transparent 60%) pointer-events-none" />
              <div>
                <span className="text-[11px] font-bold text-coral uppercase tracking-widest mb-3 block">Mosaic Habit Model</span>
                <h2 className="text-3xl sm:text-4xl font-serif leading-tight font-medium">
                  Every check-in becomes a color.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mt-4">
                  Each time you check in, it builds your moodboard and a private picture of how your weeks actually feel. No streaks to keep, no empty calendar gaps, and no pressure — just patterns you can notice and act on.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-6.5 flex flex-col gap-4">
                <div className="text-xs font-bold text-slate-300 border-b border-white/10 pb-3">Moodboard dimensions</div>
                
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>Energy</span>
                      <span className="text-[#e3b04b]">78%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#e3b04b] to-[#7c9473]" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>Calm</span>
                      <span className="text-[#e0863f]">64%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#e0863f] to-[#d8472f]" style={{ width: '64%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>Focus</span>
                      <span className="text-[#3aa78a]">71%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#3aa78a] to-[#0e7c6e]" style={{ width: '71%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>Recovery</span>
                      <span className="text-[#9aa2bd]">48%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#9aa2bd] to-[#6f7aa0]" style={{ width: '48%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-bold text-slate-300 mb-1">
                      <span>Motivation</span>
                      <span className="text-[#cf7794]">83%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
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
                    Type whatever's on your mind — messy, half-formed, 2am, all of it. WriteMindly helps you slow down long enough to hear your own thoughts. Sometimes that's all you need. No advice unless you want it.
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
                When you'd rather talk it through, book a session with a wellbeing coach. Stress, confidence, motivation, relationships — on your terms, around your schedule.
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
              Coaches are non-clinical wellbeing coaches, not therapists. If anything you're facing needs clinical care, we'll gently connect you to a qualified professional — you're never left to figure it out alone.
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
                  WellMindly shares nothing about you as an individual — not your check-ins, not your messages, not your identity. Universities only ever see the bigger picture: when whole groups are stressed, when exam season bites. The pulse of the campus, never the student.
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
              onClick={handleCheckInClick}
              className="rounded-full bg-navy text-white px-10 py-4.5 text-sm font-bold shadow-lg shadow-navy/20 hover:bg-navy/95 transition-all text-center cursor-pointer border-none"
            >
              See how you're feeling
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
                We're building a quiet, private space for students to check in with how they're feeling — and we want to know what you honestly make of it, before we show it to anyone else.
              </p>
              
              <ul className="space-y-3 mb-8 text-xs sm:text-sm font-semibold text-slate-700">
                <li className="flex gap-2.5 items-start">
                  <span className="text-plum mt-0.5">✔</span>
                  <span><b>The check-in works</b> — go ahead and try it for real.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-plum mt-0.5">✔</span>
                  <span><b>Two bigger features are still coming</b> — you'll see WriteMindly and TalkMindly here as previews, not finished yet.</span>
                </li>
                <li className="flex gap-2.5 items-start">
                  <span className="text-plum mt-0.5">✔</span>
                  <span><b>There are no right answers.</b> We want your honest reaction — including the parts that feel off or fake.</span>
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
