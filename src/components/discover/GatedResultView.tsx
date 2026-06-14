import { motion } from "framer-motion";
import { Lock, Sparkles, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TestDef } from "./types";

interface GatedResultViewProps {
  cur: TestDef;
  curId: string;
  onBackClick: () => void;
}

export function GatedResultView({ curId, onBackClick }: GatedResultViewProps) {
  const navigate = useNavigate();

  // Custom teaser copy depending on the quiz type
  const getTeaserInfo = (id: string) => {
    switch (id) {
      case "checkin":
        return {
          header: "Emotional Snapshot Captured!",
          desc: "We've mapped your well-being snapshot across 6 dimensions. Your responses indicate a specific emotional posture today, but you need to log in to see the full detailed profile.",
          feature: "Emotional dimensions breakdown",
        };
      case "mood":
        return {
          header: "Mood snapshot recorded!",
          desc: "Your mood snapshot tile has been created. To add it to your personal wellness board and track it over time, please create an account.",
          feature: "Daily mood tiles & tracking",
        };
      case "strengths":
        return {
          header: "Signature strengths mapped!",
          desc: "Your top 5 signature strengths have been calculated! You have a highly unique profile. Log in to reveal your signature strength cards and share them.",
          feature: "Top 5 character strengths card",
        };
      case "bigfive":
        return {
          header: "Personality archetype ready!",
          desc: "Your Big Five personality traits have been calculated, revealing your distinct character archetype. Sign up to unlock your detailed archetype report.",
          feature: "Big Five character archetype report",
        };
      case "values":
        return {
          header: "Personal values mapped!",
          desc: "Your core personal values have been mapped based on your choices. Log in to see your leading values and second-tier drivers.",
          feature: "Leading values hierarchy card",
        };
      case "strengthshadow":
        return {
          header: "Strength & shadow analyzed!",
          desc: "Your core strength and its shadow (the flip side of your greatest trait) have been analyzed. Sign up to read your detailed shadow warnings and tips.",
          feature: "Personal strength & shadow card",
        };
      default:
        return {
          header: "Self-Reflection Complete!",
          desc: "Your results are analyzed and ready to view. Sign in or create a free student account to unlock your full detailed report.",
          feature: "Personalized wellness insights",
        };
    }
  };

  const teaser = getTeaserInfo(curId);

  return (
    <div className="bg-white border border-line rounded-3xl p-8 sm:p-10 shadow-[0_22px_50px_-22px_rgba(122,91,147,.2)] text-center relative overflow-hidden select-none">
      
      {/* Decorative Aura Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-plum/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-sage-brand/5 blur-3xl pointer-events-none" />

      {/* Lock Icon Header */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-16 h-16 rounded-2xl bg-plum/10 text-plum flex items-center justify-center mx-auto mb-6 shadow-sm shadow-plum/5"
      >
        <Lock className="w-7 h-7" />
      </motion.div>

      <h2 className="font-serif font-extrabold text-3xl mb-3 text-ink leading-tight">
        {teaser.header}
      </h2>
      
      <p className="text-ink-soft text-base leading-relaxed max-w-lg mx-auto font-medium mb-8">
        {teaser.desc}
      </p>

      {/* Blurred Card Mockup Teaser */}
      <div className="relative border border-line/70 rounded-2xl p-6 bg-slate-50/50 max-w-sm mx-auto mb-8 overflow-hidden select-none">
        
        {/* Mock content */}
        <div className="space-y-4 filter blur-[5px] opacity-45 pointer-events-none select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-plum/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-plum" />
            </div>
            <div className="h-4 w-32 bg-slate-300 rounded-md" />
          </div>
          
          <div className="h-6 w-full bg-slate-300 rounded-md" />
          <div className="h-24 w-full bg-plum/15 rounded-xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-plum/20" />
          </div>
          
          <div className="space-y-2">
            <div className="h-2 w-full bg-slate-200 rounded-md" />
            <div className="h-2 w-[85%] bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* Lock Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-6">
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-plum bg-white shadow border border-line px-3.5 py-1.5 rounded-full flex items-center gap-1.5 select-none">
            <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
            Unlocks with Account
          </span>
          <p className="text-xs text-ink/75 font-bold mt-2.5 max-w-[200px] leading-normal text-center">
            Unlock your <b className="text-plum">{teaser.feature}</b> and save it forever.
          </p>
        </div>
      </div>

      {/* Redirection CTAs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-md mx-auto">
        <button 
          onClick={() => navigate(`/login?redirect=/discover&testId=${curId}`)}
          className="cursor-pointer flex-1 bg-plum hover:bg-plum/90 text-white font-extrabold text-[14.5px] py-4 rounded-full transition-all active:scale-[.97] shadow-lg shadow-plum/20 border-none"
        >
          Sign Up / Sign In
        </button>
        <button 
          onClick={onBackClick}
          className="cursor-pointer flex-1 px-6 py-3 rounded-full border-[1.5px] border-line text-ink-soft font-extrabold text-[14.5px] hover:bg-slate-50 transition active:scale-[.97] bg-transparent"
        >
          Back to all tests
        </button>
      </div>
      
    </div>
  );
}
