import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Check, MessageCircleQuestion, MessagesSquare, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { MOODS, moodByRating } from "../../lib/mood";
import type { MoodRating } from "../../lib/mood";
import { MoodFace } from "../ui/MoodFace";
import { buttonClasses, Badge } from "../ui";
import { cn } from "../../lib/cn";
import { scrollToElement } from "../../lib/a11y";
import studentPortraitClean from "../../assets/student_portrait_clean.webp";

interface HeroSectionProps {
  onCheckInClick?: () => void;
  onBookCoachClick?: () => void;
  onBubbleClick?: (bubbleId: "writemindly" | "talkmindly" | "blueprints") => void;
}

export function HeroSection({
  onCheckInClick,
  onBookCoachClick,
  onBubbleClick,
}: HeroSectionProps) {
  const { isAuthenticated } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodRating | null>(null);

  const handleMoodTap = (rating: MoodRating) => {
    setSelectedMood((prev) => (prev === rating ? null : rating));
  };

  const handleBubble = (bubbleId: "writemindly" | "talkmindly" | "blueprints") => {
    if (onBubbleClick) {
      onBubbleClick(bubbleId);
    } else {
      scrollToElement(document.getElementById("explore-tools"));
    }
  };

  const handleBook = () => {
    if (onBookCoachClick) {
      onBookCoachClick();
    } else {
      scrollToElement(document.getElementById("coaching-section"));
    }
  };

  return (
    <section className="pt-10 pb-16 sm:pt-16 sm:pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center lg:gap-16 gap-12">
        {/* Left Column: Typography, CTAs, Live Mood Tap */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-start"
        >
          {/* Eyebrow */}
          <span className="text-2xs font-bold uppercase tracking-wide text-plum-600 mb-4">
            Peer Support and Self-Reflection
          </span>

          {/* Headline - max 3 lines at 375px */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ink-900 text-balance leading-[1.15]">
            Clearer minds.<br />
            <span className="text-plum-600 inline-block">Lighter days.</span>
          </h1>

          {/* Subhead */}
          <p className="mt-5 text-base sm:text-lg text-ink-600 max-w-xl text-pretty leading-relaxed">
            A warm, anonymous space to pause, check in, and unpack what you're carrying. No pressure, no clinical labels. Just a space to understand yourself.
          </p>

          {/* Exactly two CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className={buttonClasses("primary", "lg", "w-full sm:w-auto justify-center min-h-12 text-center")}
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className={buttonClasses("primary", "lg", "w-full sm:w-auto justify-center min-h-12 text-center")}
              >
                Get started free
              </Link>
            )}

            <a
              href="#explore-tools"
              onClick={(e) => {
                e.preventDefault();
                scrollToElement(document.getElementById("explore-tools"));
              }}
              className={buttonClasses("ghost", "lg", "w-full sm:w-auto justify-center min-h-12 text-center")}
            >
              See how it works
            </a>
          </div>

          {/* Interactive Live Mood Tap */}
          <div className="mt-8 w-full rounded-2xl border border-ink-200/80 bg-card/70 backdrop-blur-sm p-4 sm:p-5 shadow-sm">
            <p className="text-sm font-semibold text-ink-700 mb-3">
              How are you right now?
            </p>

            <div className="grid grid-cols-5 gap-1.5">
              {MOODS.map((m) => {
                const isSelected = selectedMood === m.rating;
                return (
                  <button
                    type="button"
                    key={m.rating}
                    onClick={() => handleMoodTap(m.rating)}
                    aria-label={m.label}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer min-h-11",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                      isSelected
                        ? cn(m.soft, m.text, "ring-2 ring-current")
                        : "bg-card/80 hover:bg-card text-ink-600 hover:text-ink-900 border border-ink-100",
                    )}
                  >
                    <MoodFace rating={m.rating} className="h-6 w-6" />
                    <span className="text-2xs font-semibold mt-1 select-none">{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Revealed Affirmation */}
            {selectedMood && (
              <div className="mt-4 p-3.5 rounded-xl bg-ink-50/80 border border-ink-200/60 transition-opacity duration-200">
                <div className="flex items-start gap-2.5">
                  <span className="text-base shrink-0 select-none" aria-hidden="true">
                    {moodByRating(selectedMood).affirmation.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-ink-900">
                      {moodByRating(selectedMood).affirmation.title}
                    </p>
                    <p className="text-xs text-ink-700 mt-0.5 leading-relaxed">
                      {moodByRating(selectedMood).affirmation.message}
                    </p>
                  </div>
                </div>
                <p className="text-2xs text-ink-500 mt-3 pt-2.5 border-t border-ink-200/50">
                  Nothing saved yet.{" "}
                  <Link to="/login" className="font-semibold text-plum-700 underline hover:text-plum-900">
                    Sign in
                  </Link>{" "}
                  to save your mood and start your streak.
                </p>
              </div>
            )}
          </div>

          {/* Trust Strip */}
          <div className="mt-8 pt-5 border-t border-ink-200/60 w-full flex flex-wrap items-center gap-x-6 gap-y-2 text-2xs text-ink-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-4 h-4 text-teal-600" aria-hidden="true" />
              No identifying data shared with your school
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4 text-teal-600" aria-hidden="true" />
              Private by default
            </span>
          </div>
        </motion.div>

        {/* Right Column: Hero Art with Clearly Labelled Previews */}
        <div className="relative flex w-full flex-col items-center gap-4 sm:min-h-[440px] sm:flex-row sm:justify-center sm:gap-0">
          {/* Background Aura Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-sage-50/50 to-coral-50/50 rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none" />

          {/* Main image container */}
          <div className="relative overflow-hidden rounded-[2.5rem] border border-ink-200 bg-ink-50/40 shadow-xl max-w-xs sm:max-w-sm w-full aspect-[4/5] flex items-center justify-center">
            <img 
              src={studentPortraitClean} 
              alt="University student smiling in a calm campus setting" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Static 2-up grid at mobile, floating at sm and above */}
          <div className="grid w-full grid-cols-2 gap-3 sm:contents">
            {/* Preview Card 1: Today's Tone */}
            <button
              type="button"
              onClick={onCheckInClick}
              className="static sm:absolute sm:bottom-6 sm:-left-6 bg-card/95 backdrop-blur-md border border-ink-200 hover:border-plum-400 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-1 max-w-none sm:max-w-[220px] z-20 text-left cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400"
              aria-label="Preview: Today's tone check-in card"
            >
              <div className="flex flex-col items-start gap-1 w-full sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                <span className="text-2xs text-ink-500 font-bold uppercase tracking-wider">Today's tone</span>
                <Badge tone="primary" size="sm">Preview</Badge>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-ink-900">Finding your footing &rarr;</div>
              <div className="flex gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span className="w-2 h-2 rounded-full bg-gold-400" />
                <span className="w-2 h-2 rounded-full bg-rose-400 opacity-60" />
                <span className="w-2 h-2 rounded-full bg-plum-400 opacity-60" />
              </div>
            </button>

            {/* Preview Card 2: Next Session with Coach */}
            <button
              type="button"
              onClick={handleBook}
              className="static sm:absolute sm:top-8 sm:-right-4 bg-card/95 backdrop-blur-md border border-ink-200 hover:border-coral-400 rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center gap-3 max-w-none sm:max-w-[230px] z-20 text-left cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400"
              aria-label="Preview: Next session with coach card"
            >
              <div className="hidden sm:flex w-8 h-8 bg-coral-100 text-coral-700 rounded-xl items-center justify-center font-bold text-xs shrink-0 select-none">
                VK
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col items-start gap-1 w-full sm:flex-row sm:items-center sm:justify-between sm:gap-0 mb-0.5">
                  <span className="text-2xs text-ink-500 font-bold uppercase tracking-wider sm:truncate">Next Session</span>
                  <Badge tone="coral" size="sm">Preview</Badge>
                </div>
                <div className="text-xs font-bold text-ink-900 hover:text-coral-700 transition-colors sm:truncate">
                  Coach Vinayak &middot; Thu 5pm
                </div>
              </div>
            </button>
          </div>

          {/* Floating Bubble 1: who even am I rn */}
          <button
            type="button"
            onClick={() => handleBubble("writemindly")}
            className="hidden sm:flex absolute top-4 sm:-left-8 bg-card/90 backdrop-blur-md border border-ink-200 hover:border-teal-400 rounded-2xl px-4 py-2.5 min-h-11 shadow-md text-xs font-semibold text-ink-600 hover:text-ink-900 max-w-[170px] z-10 select-none cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 items-center gap-1.5"
          >
            <MessageCircleQuestion className="h-3.5 w-3.5" aria-hidden="true" /> who even am I rn
          </button>

          {/* Floating Bubble 2: is it just me or... */}
          <button
            type="button"
            onClick={() => handleBubble("talkmindly")}
            className="hidden sm:flex absolute bottom-32 sm:-right-6 bg-card/90 backdrop-blur-md border border-ink-200 hover:border-plum-400 rounded-2xl px-4 py-2.5 min-h-11 shadow-md text-xs font-semibold text-ink-600 hover:text-ink-900 max-w-[160px] z-10 select-none cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 items-center gap-1.5"
          >
            <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" /> is it just me or...
          </button>

          {/* Floating Bubble 3: what am I actually good at? */}
          <button
            type="button"
            onClick={() => handleBubble("blueprints")}
            className="hidden sm:flex absolute -bottom-2 sm:right-12 bg-card/90 backdrop-blur-md border border-ink-200 hover:border-gold-400 rounded-2xl px-4 py-2.5 min-h-11 shadow-md text-xs font-semibold text-ink-600 hover:text-ink-900 max-w-[200px] z-10 select-none cursor-pointer transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400 items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> what am I actually good at?
          </button>
        </div>
      </div>
    </section>
  );
}
