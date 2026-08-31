import { motion } from "framer-motion";
import { Lock, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Badge } from "../ui";
import type { TestDef } from "./types";

interface GatedResultViewProps {
  curId: string;
  cur?: TestDef | null;
  data?: any;
  onBackClick: () => void;
}

export function GatedResultView({ curId, cur: _cur, data: _data, onBackClick }: GatedResultViewProps) {
  const navigate = useNavigate();

  // Custom teaser copy depending on the quiz type
  const getTeaserInfo = (id: string) => {
    switch (id) {
      case "checkin":
        return {
          header: "2-Min Check-in Completed",
          desc: "We've calculated your emotional balance, energy levels, and key wellbeing indicators.",
          feature: "Full emotional wellbeing breakdown & AI guidance",
          badges: ["Emotional Balance Index", "Energy & Mood Patterns", "Personalized Next Steps"],
        };
      case "mood":
        return {
          header: "Mood logged",
          desc: "Your mood entry is calculated. Save it to your private wellness board to watch your trends over time.",
          feature: "Daily mood history & AI reflection",
          badges: ["Moodboard mosaic tile", "Weekly emotional trajectory", "Coping recommendations"],
        };
      case "strengths":
        return {
          header: "Your strengths are ready",
          desc: "We've identified your top signature strengths from your responses.",
          feature: "Top 5 character strengths card",
          badges: ["Top 5 Signature Strengths", "Actionable strengths guide", "Blind spot awareness"],
        };
      case "bigfive":
        return {
          header: "Personality profile ready",
          desc: "Your Big Five personality archetype and trait dimensions have been mapped.",
          feature: "Big Five personality profile",
          badges: ["Archetype Classification", "5 Trait Dimension Scores", "Communication style"],
        };
      case "values":
        return {
          header: "Core values mapped",
          desc: "Your primary personal values and decision drivers have been mapped from your answers.",
          feature: "Core values summary card",
          badges: ["Core Values Hierarchy", "Value Alignment Tips", "Decision Framework"],
        };
      default:
        return {
          header: "Check-in completed",
          desc: "Your responses are ready. Create your free anonymous student account to see your full report.",
          feature: "Personalized reflection report",
          badges: ["Personalized Insights", "Safe & 100% Anonymous", "Saved to Dashboard"],
        };
    }
  };

  const teaser = getTeaserInfo(curId);

  return (
    <div className="relative w-full max-w-xl mx-auto rounded-3xl border border-ink-200/80 bg-card overflow-hidden shadow-xl">
      {/* ── Realistic Blurred Background Layer (The Actual Results Under Frost) ── */}
      <div 
        className="p-8 sm:p-10 select-none pointer-events-none filter blur-[9px] opacity-40 transition-all scale-[0.98]"
        aria-hidden="true"
      >
        {/* Fake / Teaser Score Card Header */}
        <div className="flex items-center justify-between border-b border-ink-200 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-plum-500 text-white flex items-center justify-center font-black">
              WM
            </div>
            <div>
              <div className="h-5 w-40 bg-ink-800 rounded-md mb-2" />
              <div className="h-3.5 w-24 bg-ink-400 rounded-md" />
            </div>
          </div>
          <div className="h-8 w-20 bg-teal-200 rounded-full" />
        </div>

        {/* Fake Visual Metrics & Bars */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-5 rounded-2xl bg-paper-2 border border-ink-200">
            <div className="h-3 w-20 bg-ink-400 rounded mb-3" />
            <div className="h-8 w-16 bg-ink-900 rounded font-black text-2xl mb-2" />
            <div className="h-3 w-full bg-ink-300 rounded" />
          </div>
          <div className="p-5 rounded-2xl bg-plum-50 border border-plum-200">
            <div className="h-3 w-24 bg-plum-400 rounded mb-3" />
            <div className="h-8 w-28 bg-plum-900 rounded mb-2" />
            <div className="h-3 w-full bg-plum-300 rounded" />
          </div>
        </div>

        {/* Fake Bars Breakdown */}
        <div className="space-y-3.5 p-5 rounded-2xl bg-paper border border-ink-200 mb-6">
          <div className="h-4 w-36 bg-ink-700 rounded mb-4" />
          {[75, 45, 88, 60].map((width, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-ink-400 rounded" />
                <div className="h-3 w-8 bg-ink-400 rounded" />
              </div>
              <div className="h-2.5 w-full bg-ink-100 rounded-full overflow-hidden">
                <div className="h-full bg-plum-500 rounded-full" style={{ width: `${width}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Fake AI Narrative Paragraph */}
        <div className="p-5 rounded-2xl bg-paper-2 border border-ink-200 space-y-2">
          <div className="h-4 w-48 bg-ink-800 rounded" />
          <div className="h-3 w-full bg-ink-400 rounded" />
          <div className="h-3 w-5/6 bg-ink-400 rounded" />
          <div className="h-3 w-4/6 bg-ink-400 rounded" />
        </div>
      </div>

      {/* ── Foreground Frosted Glass Unlock Overlay ── */}
      <div className="absolute inset-0 bg-paper/85 backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-10 text-center z-10">
        {/* Glow effect */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-plum-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-teal-500/15 blur-3xl" />

        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-plum-600 to-plum-500 text-white shadow-lg shadow-plum-500/25"
        >
          <Lock className="h-7 w-7" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-gold-500" />
          </span>
        </motion.div>

        {/* Badges & Header */}
        <Badge tone="primary" size="md" className="mb-3 font-bold" icon={<Sparkles className="w-3.5 h-3.5 text-gold-500" />}>
          Your check-in is saved & ready
        </Badge>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900 mb-2.5">
          {teaser.header}
        </h2>
        
        <p className="text-sm sm:text-base text-ink-600 max-w-md leading-relaxed mb-6">
          {teaser.desc} Sign in or create a free student account to unlock your detailed score breakdown and tailored AI guidance.
        </p>

        {/* Feature Highlights Pill Card */}
        <div className="w-full max-w-sm rounded-2xl bg-card/90 border border-ink-200/80 p-4 shadow-sm mb-7 text-left space-y-2.5">
          {teaser.badges.map((b, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-ink-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" aria-hidden="true" />
              <span>{b}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <Button
            size="lg"
            variant="primary"
            className="w-full justify-center text-sm font-bold shadow-md inline-flex items-center gap-2"
            onClick={() => navigate(`/login?redirect=/discover&showResult=${curId}`)}
          >
            <span>Sign up / Sign in to reveal results</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Button>

          <Button
            size="md"
            variant="ghost"
            className="w-full justify-center text-xs text-ink-500 hover:text-ink-800"
            onClick={onBackClick}
          >
            Back to all discovery tests
          </Button>
        </div>

        {/* Trust badge */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-2xs font-semibold text-ink-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>100% Anonymous · No identifying data shared with university</span>
        </div>
      </div>
    </div>
  );
}
