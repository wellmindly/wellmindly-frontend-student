import { motion } from "framer-motion";
import { Logo } from "../ui";
import studentLoginPortrait from "../../assets/student_login_portrait.png";

export interface AuthBrandPanelProps {}

export function AuthBrandPanel({}: AuthBrandPanelProps = {}) {
  return (
    <div className="hidden lg:flex relative w-[45%] flex-col justify-center items-center p-12 overflow-hidden bg-transparent">
      {/* Header Logo */}
      <Logo size="md" className="absolute top-12 left-12 z-50" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="relative flex justify-center items-center w-full max-w-md mt-16"
      >
        {/* Soft background aura glow */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-sage-500/10 to-coral-500/10 rounded-[2.5rem] blur-2xl opacity-60 pointer-events-none" />
        
        {/* Interactive Floating Card 1: Today's Tone */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute bottom-8 -left-6 bg-card/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex flex-col gap-1 max-w-[200px] z-20 pointer-events-auto"
        >
          <div className="text-2xs text-ink-soft font-bold uppercase tracking-wider">Today's tone</div>
          <div className="text-sm font-serif font-semibold text-ink">Finding your footing</div>
          <div className="flex gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="w-2 h-2 rounded-full bg-gold-500" />
            <span className="w-2 h-2 rounded-full bg-rose-500 opacity-40" />
            <span className="w-2 h-2 rounded-full bg-plum-500 opacity-40" />
          </div>
        </motion.div>

        {/* Interactive Floating Card 2: Next Session with Coach */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
          className="absolute top-12 -right-4 bg-card/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex items-center gap-3 max-w-[220px] z-20 pointer-events-auto"
        >
          <div className="w-7 h-7 bg-coral-500/15 text-coral-600 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none">
            VK
          </div>
          <div>
            <div className="text-2xs text-ink-soft font-bold uppercase tracking-wider">Next Session</div>
            <div className="text-xs font-bold text-ink">Coach Vinayak &middot; Thu 5pm</div>
          </div>
        </motion.div>

        {/* Main image container */}
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-line bg-paper-2/40 shadow-2xl max-w-sm w-full aspect-[4/5] flex items-center justify-center">
          <img 
            src={studentLoginPortrait} 
            alt="Smiling, warm university student portrait" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </motion.div>
    </div>
  );
}
