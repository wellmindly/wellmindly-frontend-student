import { motion } from "framer-motion";
import { Shield, Check, ArrowRight } from "lucide-react";
import studentPortraitClean from "../../assets/student_portrait_clean.png";

interface HeroSectionProps {
  onCheckInClick: () => void;
  onStartDiscovery: () => void;
  onBookCoachClick?: () => void;
  onBubbleClick?: (question: string) => void;
}

export function HeroSection({ 
  onCheckInClick, 
  onStartDiscovery, 
  onBookCoachClick, 
  onBubbleClick 
}: HeroSectionProps) {
  const handleBubble = (q: string) => {
    if (onBubbleClick) {
      onBubbleClick(q);
    } else {
      document.getElementById('explore-tools')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBook = () => {
    if (onBookCoachClick) {
      onBookCoachClick();
    } else {
      document.getElementById('coaching-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-center">
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
            className="rounded-full bg-plum text-white px-8 py-4 text-sm font-bold shadow-lg shadow-plum/20 hover:bg-plum/90 transition-all text-center cursor-pointer border-none min-h-[48px] flex items-center justify-center"
          >
            See how you're feeling
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartDiscovery}
            className="rounded-full border border-plum/30 bg-plum/5 text-plum px-8 py-4 text-sm font-bold hover:bg-plum/10 hover:border-plum/50 transition-all text-center cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
          >
            Explore Blueprints
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Microcopy */}
        <span className="text-xs text-ink-soft/70 font-semibold tracking-wide mt-3 sm:ml-4">
          Explore 6 character blueprints and private peer support.
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

      {/* Right Column: Premium Hero Image with Interactive Floating Elements */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className="relative flex justify-center items-center w-full min-h-[420px] sm:min-h-[480px]"
      >
        {/* Soft background aura glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-sage-brand/10 to-coral/10 rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none" />
        
        {/* Interactive Floating Card 1: Today's Tone */}
        <motion.button
          onClick={onCheckInClick}
          whileHover={{ y: -6, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute bottom-6 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md border border-line hover:border-plum/40 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-1 max-w-[190px] sm:max-w-[210px] z-30 pointer-events-auto text-left cursor-pointer transition-colors"
          title="Click to check in today"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] text-ink-soft font-bold uppercase tracking-wider">Today's tone</span>
            <span className="text-[9px] bg-plum/10 text-plum font-bold px-1.5 py-0.5 rounded">Tap</span>
          </div>
          <div className="text-xs sm:text-sm font-serif font-semibold text-ink">Finding your footing &rarr;</div>
          <div className="flex gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-gold" />
            <span className="w-2 h-2 rounded-full bg-rose opacity-60" />
            <span className="w-2 h-2 rounded-full bg-plum opacity-60" />
          </div>
        </motion.button>

        {/* Interactive Floating Card 2: Next Session with Coach */}
        <motion.button
          onClick={handleBook}
          whileHover={{ y: -6, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
          className="absolute top-8 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md border border-line hover:border-coral/40 rounded-2xl p-3.5 sm:p-4 shadow-xl flex items-center gap-3 max-w-[200px] sm:max-w-[220px] z-30 pointer-events-auto text-left cursor-pointer transition-colors"
          title="Click to book a coach"
        >
          <div className="w-8 h-8 bg-coral/15 text-coral rounded-xl flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-inner">
            VK
          </div>
          <div>
            <div className="text-[10px] text-ink-soft font-bold uppercase tracking-wider flex items-center gap-1">
              Next Session
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold text-ink hover:text-coral transition-colors">
              Coach Vinayak &middot; Thu 5pm
            </div>
          </div>
        </motion.button>

        {/* Floating Bubble 1: who even am I rn */}
        <motion.button
          onClick={() => handleBubble("who even am I rn")}
          whileHover={{ scale: 1.08, rotate: 0 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -8, 0], rotate: [-2, 1, -2] }}
          transition={{ y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
          className="absolute top-4 -left-4 sm:-left-8 bg-white/90 backdrop-blur-md border border-line hover:border-teal/50 rounded-2xl px-3.5 py-2 shadow-md text-xs font-semibold text-ink-soft hover:text-ink max-w-[160px] z-30 pointer-events-auto select-none cursor-pointer transition-all"
        >
          💭 who even am I rn
        </motion.button>

        {/* Floating Bubble 2: is it just me or... */}
        <motion.button
          onClick={() => handleBubble("is it just me or...")}
          whileHover={{ scale: 1.08, rotate: 0 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -10, 0], rotate: [1, -2, 1] }}
          transition={{ y: { duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 } }}
          className="absolute bottom-32 -right-4 sm:-right-6 bg-white/90 backdrop-blur-md border border-line hover:border-plum/50 rounded-2xl px-3.5 py-2 shadow-md text-xs font-semibold text-ink-soft hover:text-ink max-w-[150px] z-30 pointer-events-auto select-none cursor-pointer transition-all"
        >
          🗣️ is it just me or...
        </motion.button>

        {/* Floating Bubble 3: what am I actually good at? */}
        <motion.button
          onClick={() => handleBubble("what am I actually good at?")}
          whileHover={{ scale: 1.08, rotate: 0 }}
          whileTap={{ scale: 0.95 }}
          animate={{ y: [0, -7, 0], rotate: [-1, 2, -1] }}
          transition={{ y: { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 2.2 } }}
          className="absolute -bottom-2 right-6 sm:right-12 bg-white/90 backdrop-blur-md border border-line hover:border-gold/50 rounded-2xl px-3.5 py-2 shadow-md text-xs font-semibold text-ink-soft hover:text-ink max-w-[190px] z-30 pointer-events-auto select-none cursor-pointer transition-all"
        >
          ✨ what am I actually good at?
        </motion.button>
        
        {/* Main image container */}
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-line bg-paper-2/40 shadow-2xl max-w-xs sm:max-w-sm w-full aspect-[4/5] flex items-center justify-center">
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

