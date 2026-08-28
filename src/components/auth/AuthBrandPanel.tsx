import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { Logo } from "../ui";
import studentLoginPortrait from "../../assets/student_login_portrait.webp";

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
        
        {/* Floating card 1: what the product actually asks of you */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute bottom-8 -left-6 bg-card/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex flex-col gap-1 max-w-[200px] z-20"
        >
          <div className="text-2xs text-ink-500 font-bold uppercase tracking-wider">The daily check-in</div>
          <div className="text-sm font-semibold text-ink-900">Tap the face that fits. Nothing else to fill in.</div>
          <div className="flex gap-1.5 mt-2" aria-hidden="true">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            <span className="w-2 h-2 rounded-full bg-rose-400 opacity-60" />
            <span className="w-2 h-2 rounded-full bg-plum-400 opacity-60" />
          </div>
        </motion.div>

        {/* Floating card 2: the privacy promise, same words as the hero trust strip */}
        <motion.div
          whileHover={{ y: -5, scale: 1.02 }}
          animate={{ y: [0, -8, 0] }}
          transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 } }}
          className="absolute top-12 -right-4 bg-card/95 backdrop-blur-md border border-line rounded-2xl p-4 shadow-xl flex items-start gap-3 max-w-[220px] z-20"
        >
          <Shield className="h-5 w-5 shrink-0 text-teal-600 mt-0.5" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-2xs text-ink-500 font-bold uppercase tracking-wider">Your privacy</div>
            <div className="text-xs font-bold text-ink-900">Never shared with your school</div>
            <div className="text-2xs text-ink-500 font-medium mt-0.5">Private by default</div>
          </div>
        </motion.div>

        {/* Main image container */}
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-line bg-paper-2/40 shadow-2xl max-w-sm w-full aspect-[4/5] flex items-center justify-center">
          <img 
            src={studentLoginPortrait} 
            alt="Smiling, warm university student portrait" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transition-none"
          />
        </div>
      </motion.div>
    </div>
  );
}
