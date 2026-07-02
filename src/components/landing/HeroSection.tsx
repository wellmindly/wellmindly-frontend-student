import { motion } from "framer-motion";
import { Shield, Check, ArrowRight } from "lucide-react";
import studentPortraitClean from "../../assets/student_portrait_clean.png";

interface HeroSectionProps {
  onCheckInClick: () => void;
  onStartDiscovery: () => void;
}

export function HeroSection({ onCheckInClick, onStartDiscovery }: HeroSectionProps) {
  return (
    <section className="py-16 sm:py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
      {/* Left Column: Typography & CTAs */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-start"
      >
        {/* Subtle Brand Tagline */}
        <div className="inline-block mb-6 text-xs font-bold uppercase tracking-wider text-teal bg-teal/5 border border-teal/15 px-4 py-1.5 rounded-full font-sans">
          Peer Support & Self-Reflection
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-ink leading-[1.1] tracking-tight font-medium">
          Clearer minds.<br />
          <span className="text-plum inline-block">Lighter days.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-ink-soft leading-relaxed max-w-[48ch]">
          A warm, anonymous space to pause, check in, and unpack what you're carrying. No pressure, no clinical labels. Just a space to understand yourself.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckInClick}
            className="rounded-full bg-plum text-white px-8 py-4 text-sm font-bold shadow-lg shadow-plum/20 hover:bg-plum/90 transition-all text-center cursor-pointer border-none"
          >
            See how you're feeling
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartDiscovery}
            className="rounded-full border border-plum/30 bg-plum/5 text-plum px-8 py-4 text-sm font-bold hover:bg-plum/10 hover:border-plum/50 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
          >
            Explore Blueprints
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Microcopy */}
        <span className="text-xs text-ink-soft/70 font-semibold tracking-wide mt-3 ml-4">
          Explore 11+ character blueprints and private peer support.
        </span>

        {/* Trust Strip */}
        <div className="mt-12 pt-6 border-t border-line/60 w-full flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-ink-soft">
          <span className="flex items-center gap-2 font-medium">
            <Shield className="w-4 h-4 text-teal" />
            Never shared with your school
          </span>
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-teal" />
            Anonymous option
          </span>
          <span className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-teal" />
            Delete anytime
          </span>
        </div>
      </motion.div>

      {/* Right Column: Premium Hero Image with Floating Elements */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className="relative flex justify-center items-center w-full"
      >
        {/* Soft background aura glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-sage-brand/10 to-coral/10 rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none" />
        
        {/* Interactive Floating Card 1: Today's Tone (styled with clean border and glassmorphism) */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute bottom-8 -left-6 bg-white/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex flex-col gap-1 max-w-[200px] z-20 pointer-events-auto"
        >
          <div className="text-[10px] text-ink-soft font-bold uppercase tracking-wider">Today's tone</div>
          <div className="text-sm font-serif font-semibold text-ink">Finding your footing</div>
          <div className="flex gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-teal" />
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="w-2 h-2 rounded-full bg-rose opacity-40" />
            <span className="w-2 h-2 rounded-full bg-plum opacity-40" />
          </div>
        </motion.div>

        {/* Interactive Floating Card 2: Next Session with Coach (TO Tom Okafor initial) */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
          className="absolute top-12 -right-4 bg-white/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-[220px] z-20 pointer-events-auto"
        >
          <div className="w-7 h-7 bg-coral/15 text-coral rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none">
            TO
          </div>
          <div>
            <div className="text-[10px] text-ink-soft font-bold uppercase tracking-wider">Next Session</div>
            <div className="text-xs font-bold text-ink">Coach Tom &middot; Thu 5pm</div>
          </div>
        </motion.div>

        {/* Floating Bubble 1: who even am I rn */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [-2, 1, -2] }}
          transition={{ y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
          className="absolute top-8 -left-8 bg-white/80 backdrop-blur-sm border border-line rounded-2xl px-4 py-2.5 shadow-md text-xs font-semibold text-ink-soft/90 max-w-[150px] z-20 pointer-events-none select-none"
        >
          who even am I rn
        </motion.div>

        {/* Floating Bubble 2: is it just me or... */}
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [1, -2, 1] }}
          transition={{ y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 } }}
          className="absolute bottom-36 -right-6 bg-white/80 backdrop-blur-sm border border-line rounded-2xl px-4 py-2.5 shadow-md text-xs font-semibold text-ink-soft/90 max-w-[140px] z-20 pointer-events-none select-none"
        >
          is it just me or...
        </motion.div>

        {/* Floating Bubble 3: what am I actually good at? */}
        <motion.div
          animate={{ y: [0, -7, 0], rotate: [-1, 2, -1] }}
          transition={{ y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2.2 } }}
          className="absolute -bottom-4 right-12 bg-white/85 backdrop-blur-sm border border-line rounded-2xl px-4 py-2.5 shadow-md text-xs font-semibold text-ink-soft/90 max-w-[180px] z-20 pointer-events-none select-none"
        >
          what am I actually good at?
        </motion.div>
        
        {/* Main image container with clean, solid-backdrop look */}
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-line bg-paper-2/40 shadow-2xl max-w-sm w-full aspect-[4/5] flex items-center justify-center">
          <img 
            src={studentPortraitClean} 
            alt="Smiling, warm university student portrait" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </motion.div>
    </section>
  );
}
