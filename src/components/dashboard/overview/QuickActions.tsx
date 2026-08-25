import { motion } from "framer-motion";

export interface QuickActionsProps {
  onComingSoonClick?: (feature: "writemindly" | "talkmindly" | "sessionbooking") => void;
}

export function QuickActions({ onComingSoonClick }: QuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-heading" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <h2 id="quick-actions-heading" className="sr-only">
        Quick Support Actions
      </h2>

      {/* TalkMindly Card */}
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => onComingSoonClick?.("talkmindly")}
        className="bg-gradient-to-br from-ink-900 to-ink-800 text-ink-50 rounded-[2rem] p-6 shadow-md border border-ink-700 flex flex-col justify-between cursor-pointer group min-h-[180px]"
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xs font-bold text-gold-400 uppercase tracking-widest bg-gold-400/10 px-2.5 py-1 rounded-full border border-gold-400/20">
              Peer Board
            </span>
            <span className="text-xs text-ink-400 font-semibold">24/7 Support</span>
          </div>
          <h3 className="text-xl font-bold font-serif mb-1 group-hover:text-gold-300 transition-colors">
            TalkMindly Space
          </h3>
          <p className="text-xs text-ink-300 leading-relaxed font-medium">
            Share your thoughts anonymously or respond to fellow students safely.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-gold-400">
          Open peer board &rarr;
        </div>
      </motion.div>

      {/* Book Session Card */}
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => onComingSoonClick?.("sessionbooking")}
        className="bg-card text-ink-900 rounded-[2rem] p-6 shadow-sm border border-ink-200/80 flex flex-col justify-between cursor-pointer group min-h-[180px]"
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xs font-bold text-teal uppercase tracking-widest bg-teal/10 px-2.5 py-1 rounded-full border border-teal/20">
              1-on-1 Support
            </span>
            <span className="text-xs text-success font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Free
            </span>
          </div>
          <h3 className="text-xl font-bold font-serif mb-1 group-hover:text-teal transition-colors">
            Book a Coach Session
          </h3>
          <p className="text-xs text-ink-500 leading-relaxed font-medium">
            Connect 1-on-1 with verified academic and peer wellbeing coaches.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-teal">
          Browse available slots &rarr;
        </div>
      </motion.div>

      {/* WriteMindly Card */}
      <motion.div
        whileHover={{ y: -4 }}
        onClick={() => onComingSoonClick?.("writemindly")}
        className="bg-card text-ink-900 rounded-[2rem] p-6 shadow-sm border border-ink-200/80 flex flex-col justify-between cursor-pointer group min-h-[180px]"
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-2xs font-bold text-plum uppercase tracking-widest bg-plum/10 px-2.5 py-1 rounded-full border border-plum/20">
              AI Companion
            </span>
            <span className="text-xs text-ink-400 font-semibold">Guided</span>
          </div>
          <h3 className="text-xl font-bold font-serif mb-1 group-hover:text-plum transition-colors">
            WriteMindly Journal
          </h3>
          <p className="text-xs text-ink-500 leading-relaxed font-medium">
            Reflect on your day with guided AI prompts tailored to your mood.
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-plum">
          Start writing &rarr;
        </div>
      </motion.div>
    </section>
  );
}
