import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, ArrowRight, MessageSquare, Users, AlertCircle } from "lucide-react";
import type { CoachItem } from "./types";
import { buttonClasses } from "../../ui";
import { cn } from "../../../lib/cn";

export interface ExploreToolsSectionProps {
  activeOfferTab: "blueprints" | "writemindly" | "talkmindly";
  onOfferTabChange: (tab: "blueprints" | "writemindly" | "talkmindly") => void;
  mockWritePrompt: number;
  onMockWritePromptChange: (prompt: number) => void;
  mockTalkTopic: "exam-stress" | "social";
  onTalkTopicChange: (topic: "exam-stress" | "social") => void;
  coaches: CoachItem[];
  activePreviewCoachIndex: number;
  onPreviewCoachChange: (index: number) => void;
  onWriteMindlyClick: () => void;
  onTalkMindlyClick: () => void;
}

const TABS: Array<{
  id: "writemindly" | "talkmindly" | "blueprints";
  name: string;
  depth: string;
  oneLine: string;
  icon: typeof PenTool;
  activeBg: string;
  inactiveBg: string;
}> = [
  {
    id: "writemindly",
    name: "WriteMindly",
    depth: "On your own",
    oneLine: "Get it out of your head in 60 seconds with private AI reflection.",
    icon: PenTool,
    activeBg: "bg-teal-600 text-white",
    inactiveBg: "bg-teal-50 text-teal-700",
  },
  {
    id: "talkmindly",
    name: "TalkMindly",
    depth: "Guided",
    oneLine: "Talk it through in anonymous, 24/7 moderated peer circles.",
    icon: MessageSquare,
    activeBg: "bg-plum-600 text-white",
    inactiveBg: "bg-plum-50 text-plum-700",
  },
  {
    id: "blueprints",
    name: "Mindset Coaching",
    depth: "With a human",
    oneLine: "Book confidential 1-on-1 sessions with trained student mentors.",
    icon: Users,
    activeBg: "bg-coral-600 text-white",
    inactiveBg: "bg-coral-50 text-coral-700",
  },
];

export function ExploreToolsSection({
  activeOfferTab,
  onOfferTabChange,
  mockWritePrompt,
  onMockWritePromptChange,
  mockTalkTopic,
  onTalkTopicChange,
  coaches,
  activePreviewCoachIndex,
  onPreviewCoachChange,
  onWriteMindlyClick,
  onTalkMindlyClick,
}: ExploreToolsSectionProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = TABS.findIndex((t) => t.id === activeOfferTab);

  const moveTab = (to: number) => {
    const wrapped = ((to % TABS.length) + TABS.length) % TABS.length;
    const targetTab = TABS[wrapped];
    onOfferTabChange(targetTab.id);
    tabRefs.current[wrapped]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        moveTab(activeIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        moveTab(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        moveTab(0);
        break;
      case "End":
        e.preventDefault();
        moveTab(TABS.length - 1);
        break;
    }
  };

  return (
    <section className="py-16 border-t border-ink-200/60" id="explore-tools">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-2xs font-bold text-plum-600 uppercase tracking-wide block mb-3">
          Your care path
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-900 text-balance">
          Start wherever you are today
        </h2>
        <p className="text-base text-ink-600 max-w-2xl text-pretty mt-3 mx-auto">
          Three ways to get support. Use one, or move between them as things change.
        </p>
      </div>

      {/* Rail: 3 Nodes on a Connector */}
      <div
        role="tablist"
        aria-label="Care options"
        onKeyDown={handleKeyDown}
        className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8"
      >
        {/* Connector line for desktop (horizontal) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-10 left-[16.66%] right-[16.66%] h-[2px] bg-ink-200 pointer-events-none"
        >
          <div
            className={cn(
              "h-full transition-all duration-300",
              activeIndex === 0 && "w-0 bg-teal-500",
              activeIndex === 1 && "w-1/2 bg-plum-500",
              activeIndex === 2 && "w-full bg-coral-500",
            )}
          />
        </div>

        {/* Connector line for mobile (vertical) */}
        <div
          aria-hidden="true"
          className="lg:hidden absolute top-8 bottom-8 left-10 w-[2px] bg-ink-200 pointer-events-none -translate-x-1/2"
        >
          <div
            className={cn(
              "w-full transition-all duration-300",
              activeIndex === 0 && "h-0 bg-teal-500",
              activeIndex === 1 && "h-1/2 bg-plum-500",
              activeIndex === 2 && "h-full bg-coral-500",
            )}
          />
        </div>

        {TABS.map((tab, idx) => {
          const isSelected = tab.id === activeOfferTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              id={`care-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls="care-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onOfferTabChange(tab.id)}
              className={cn(
                "group relative flex lg:flex-col items-start lg:items-center text-left lg:text-center gap-4 lg:gap-3 p-5 rounded-3xl transition-all cursor-pointer border",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 min-h-12",
                isSelected
                  ? "bg-white border-ink-300 shadow-md ring-2 ring-plum-500/20"
                  : "bg-white/60 hover:bg-white border-ink-100 hover:border-ink-200",
              )}
            >
              {/* Node Circle */}
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-200 z-10 shadow-xs",
                  isSelected ? tab.activeBg : tab.inactiveBg,
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>

              {/* Text Details: Always visible regardless of selection */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 lg:justify-center mb-0.5">
                  <span className="text-2xs font-bold uppercase tracking-wide text-ink-500">
                    {tab.depth}
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink-900 leading-tight mb-1">
                  {tab.name}
                </h3>
                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed max-w-xs">
                  {tab.oneLine}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Shared Demo Panel */}
      <div
        role="tabpanel"
        id="care-panel"
        aria-labelledby={`care-tab-${activeOfferTab}`}
        tabIndex={0}
        className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 min-h-[380px] shadow-sm mb-12 focus-visible:outline-none"
      >
        <AnimatePresence mode="wait">
          {activeOfferTab === "writemindly" && (
            <motion.div
              key="writemindly"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xs font-bold bg-teal-50 text-teal-800 border border-teal-200/70 px-3 py-1 rounded-full uppercase tracking-wider">
                    Private AI Companion
                  </span>
                  <span className="text-2xs text-ink-500 font-semibold">Interactive Demo</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-ink-900 mb-2">WriteMindly</h3>
                <p className="text-sm text-ink-600 leading-relaxed mb-6 max-w-2xl">
                  Say it to something that won't judge you. Type whatever's running in your head — messy, half-formed, 2am. Reframes thoughts without public exposure.
                </p>

                {/* Simulator */}
                <div className="bg-ink-50 border border-ink-200/70 rounded-2xl p-4 text-xs space-y-3 mb-6 max-w-2xl">
                  <div className="text-2xs font-bold text-ink-500 uppercase tracking-wider border-b border-ink-200 pb-2 flex justify-between items-center">
                    <span>Try AI Reflection</span>
                    <span className="flex items-center gap-1 text-teal-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                      Live Demo
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onMockWritePromptChange(0)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                        mockWritePrompt === 0
                          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                          : "bg-white border-ink-200 text-ink-600 hover:text-ink-900",
                      )}
                    >
                      Academic Stress
                    </button>
                    <button
                      type="button"
                      onClick={() => onMockWritePromptChange(1)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                        mockWritePrompt === 1
                          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                          : "bg-white border-ink-200 text-ink-600 hover:text-ink-900",
                      )}
                    >
                      Feeling Disconnected
                    </button>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-ink-200 text-xs text-left leading-relaxed">
                    <div className="font-bold text-ink-900 mb-1.5">
                      {mockWritePrompt === 0
                        ? "Student: I have 3 deadlines tomorrow and I can't start..."
                        : "Student: It feels like everyone else fit in easily..."}
                    </div>
                    <div className="text-teal-800 font-medium">
                      {mockWritePrompt === 0
                        ? "WriteMindly: Take a breath. Let's isolate the closest deadline. What's one paragraph you can write in 15 mins?"
                        : "WriteMindly: Feeling disconnected in a new space is very common. Give yourself permission to go at your own pace today."}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onWriteMindlyClick}
                className={buttonClasses("primary", "md", "w-full sm:w-auto self-start min-h-11")}
              >
                Start Private Writing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.div>
          )}

          {activeOfferTab === "talkmindly" && (
            <motion.div
              key="talkmindly"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xs font-bold bg-plum-50 text-plum-800 border border-plum-200/70 px-3 py-1 rounded-full uppercase tracking-wider">
                    Peer Support Circles
                  </span>
                  <span className="text-2xs text-ink-500 font-semibold">Interactive Demo</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-ink-900 mb-2">TalkMindly</h3>
                <p className="text-sm text-ink-600 leading-relaxed mb-6 max-w-2xl">
                  Say it to people who actually get it. Moderated 24/7 anonymous student circles. Zero DMs, no real names, no social pressure.
                </p>

                {/* Simulator */}
                <div className="bg-ink-50 border border-ink-200/70 rounded-2xl p-4 text-xs space-y-3 mb-6 max-w-2xl">
                  <div className="text-2xs font-bold text-ink-500 uppercase tracking-wider border-b border-ink-200 pb-2 flex justify-between items-center">
                    <span>Live Channel Simulator</span>
                    <span className="text-plum-700 font-bold">#anonymous-chat</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onTalkTopicChange("exam-stress")}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                        mockTalkTopic === "exam-stress"
                          ? "bg-plum-600 border-plum-600 text-white shadow-sm"
                          : "bg-white border-ink-200 text-ink-600 hover:text-ink-900",
                      )}
                    >
                      Burnout
                    </button>
                    <button
                      type="button"
                      onClick={() => onTalkTopicChange("social")}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                        mockTalkTopic === "social"
                          ? "bg-plum-600 border-plum-600 text-white shadow-sm"
                          : "bg-white border-ink-200 text-ink-600 hover:text-ink-900",
                      )}
                    >
                      Campus Life
                    </button>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-ink-200 text-xs text-left leading-relaxed space-y-2">
                    {mockTalkTopic === "exam-stress" ? (
                      <>
                        <div className="text-ink-900">
                          <span className="font-extrabold text-sage-700 mr-1.5">Sage:</span>
                          Anyone else staring at code wanting to scream?
                        </div>
                        <div className="text-plum-900 font-medium pl-2.5 border-l-2 border-plum-300">
                          <span className="font-extrabold text-plum-700 mr-1.5">Lotus:</span>
                          Close laptop, take a 10m walk! You've got this.
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-ink-900">
                          <span className="font-extrabold text-coral-700 mr-1.5">Fern:</span>
                          Quiet in dorms tonight, feels hard to connect.
                        </div>
                        <div className="text-plum-900 font-medium pl-2.5 border-l-2 border-plum-300">
                          <span className="font-extrabold text-plum-700 mr-1.5">Tulip:</span>
                          Same here! Let's grab library coffee tomorrow.
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onTalkMindlyClick}
                className={buttonClasses("primary", "md", "w-full sm:w-auto self-start min-h-11")}
              >
                Join Peer Rooms
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.div>
          )}

          {activeOfferTab === "blueprints" && (
            <motion.div
              key="blueprints"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xs font-bold bg-coral-50 text-coral-800 border border-coral-200/70 px-3 py-1 rounded-full uppercase tracking-wider">
                    Human 1-on-1 Support
                  </span>
                  <span className="text-2xs text-ink-500 font-semibold">Interactive Demo</span>
                </div>

                <h3 className="font-serif text-2xl font-bold text-ink-900 mb-2">Mindset Coaching</h3>
                <p className="text-sm text-ink-600 leading-relaxed mb-6 max-w-2xl">
                  Book confidential 1-on-1 sessions with trained student coaches to navigate academic stress, motivation, and resilience.
                </p>

                {/* Simulator */}
                <div className="bg-ink-50 border border-ink-200/70 rounded-2xl p-4 text-xs space-y-3 mb-6 max-w-2xl">
                  <div className="text-2xs font-bold text-ink-500 uppercase tracking-wider border-b border-ink-200 pb-2 flex justify-between items-center">
                    <span>Available Wellbeing Coaches</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {coaches.map((c, idx) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => onPreviewCoachChange(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                          activePreviewCoachIndex === idx
                            ? "bg-coral-600 border-coral-600 text-white shadow-sm"
                            : "bg-white border-ink-200 text-ink-600 hover:text-ink-900",
                        )}
                      >
                        {c.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-ink-200 text-xs text-left leading-relaxed">
                    <div className="font-bold text-ink-900">{coaches[activePreviewCoachIndex]?.name}</div>
                    <div className="text-2xs text-ink-500 mb-2">{coaches[activePreviewCoachIndex]?.role}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(coaches[activePreviewCoachIndex]?.specs || []).slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="bg-ink-50 text-ink-700 text-2xs font-semibold px-2 py-0.5 rounded-md border border-ink-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  document.getElementById("coaching-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className={buttonClasses("primary", "md", "w-full sm:w-auto self-start min-h-11")}
              >
                Book 1-on-1 Session
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Integrated Mobile Safety & Crisis Strip on Coral Ramp */}
      <div className="border border-coral-200 bg-coral-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-coral-800 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-coral-500 text-white flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-bold text-coral-900">Need urgent support right now?</div>
            <div className="text-2xs text-coral-700">Free, confidential 24/7 crisis hotlines &amp; grounding tools</div>
          </div>
        </div>
        <Link
          to="/crisis"
          className="w-full sm:w-auto px-4 py-2.5 bg-coral-600 hover:bg-coral-700 text-white text-xs font-bold rounded-xl transition-colors text-center shrink-0 min-h-11 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-600"
        >
          Get immediate support
        </Link>
      </div>
    </section>
  );
}
